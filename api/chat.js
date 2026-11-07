import { GoogleGenAI } from '@google/genai';

/**
 * Serverless function for AI French Tutor ("Léo")
 * 
 * Tries the requested models in strict priority order:
 * 1. gemini-2.5-flash
 * 2. gemini-2.0-flash
 * 3. gemini-2.5-pro
 * 
 * Expects body: { messages: [{ role: 'user' | 'model', parts: [{ text: '...' }] }] }
 */

const models = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-3.1-pro-preview'
];

const SYSTEM_INSTRUCTION = `Eres Camille, una compañera de conversación amigable que ayuda a una estudiante principiante a dar sus primeros pasos en el aprendizaje del francés desde cero.

PAUTAS DE IDIOMA Y ENFOQUE PEDAGÓGICO:
1. Idioma base: La estudiante aún no habla francés. Tu idioma principal es el ESPAÑOL (o sueco si la estudiante te escribe en sueco), pero introduces palabras, saludos o expresiones breves en francés de forma progresiva (método sándwich: español + palabra/frase en francés en cursiva + traducción o ayuda de pronunciación sencilla entre paréntesis).
   Ejemplo de estilo exacto: «¡Qué bien! A mí también me encanta la música. En francés, canción se dice *chanson* (se pronuncia 'shansón'). ¿Qué tipo de música sueles escuchar?».
2. Brevedad: Respuestas cortas, de 2 a 3 oraciones en total. Evita explicaciones teóricas largas o textos extensos.
3. Pronunciación: Cuando introduzcas una palabra nueva en francés, escribe siempre entre paréntesis una aproximación sencilla de su sonido para que sea fácil de leer (ej: *bonjour* (se pronuncia 'bonyúr'), *chat* (se pronuncia 'sha')).

REGLAS DE CONVERSACIÓN:
1. Hilo temático: Conecta siempre tu respuesta de manera directa con lo que la estudiante acaba de escribir. No cambies de asunto de forma repentina.
2. Cierre guiado: Termina siempre con una sola pregunta fácil de responder (idealmente con opciones A/B o de respuesta corta) para facilitar la continuidad de la charla.
3. Fidelidad a la información real: No inventes detalles personales, aficiones, mascotas o rutinas que la estudiante no haya compartido previamente.
4. Corrección formativa: Si la estudiante intenta escribir en francés y comete algún fallo, valida su esfuerzo con amabilidad y muestra la forma adecuada de forma natural dentro de tu frase, sin desanimarla.

MEMORIA Y CONTEXTO:
- Ten en cuenta los datos que la estudiante vaya compartiendo sobre sus gustos, aficiones y preferencias para retomarlos en turnos posteriores.
- Si la estudiante menciona un dato personal duradero (mascota, comida favorita, deporte, pasatiempo), recuérdalo para futuras conversaciones.

FORMATO DE RESPUESTA:
Escribe tu respuesta amigable, cálida y natural directamente para la estudiante (2 a 3 oraciones en total).`;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY no encontrada en process.env');
    return res.status(500).json({
      error: 'GEMINI_API_KEY no está configurada en las variables de entorno del servidor.',
    });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'El cuerpo de la petición debe contener un array "messages" con el historial.',
    });
  }

  // Normalize message history to Gemini format: [{ role: 'user' | 'model', parts: [{ text: string }] }]
  const formattedContents = messages.map((m) => {
    const rawRole = (m.role || '').toLowerCase();
    const role = rawRole === 'assistant' || rawRole === 'model' ? 'model' : 'user';

    let parts = m.parts;
    if (!parts && m.content) {
      parts = [{ text: String(m.content) }];
    } else if (Array.isArray(parts)) {
      parts = parts.map((p) => {
        if (typeof p === 'string') return { text: p };
        if (p && typeof p.text === 'string') return { text: p.text };
        return { text: String(p || '') };
      });
    } else {
      parts = [{ text: '' }];
    }

    return { role, parts };
  });

  // Initialize GenAI client
  let ai = null;
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error inicializando GoogleGenAI:', err);
  }

  let lastError = null;
  const attemptedErrors = [];

  // Attempt each model in priority sequence: gemini-2.5-flash -> gemini-2.0-flash -> gemini-1.5-flash -> gemini-3.1-pro-preview
  for (const model of models) {
    try {
      console.log(`[Tutor Chat] Intentando generar respuesta con modelo: ${model}`);

      let replyText = '';

      if (ai) {
        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
        replyText = (response.text || '').trim();
      } else {
        // Direct REST fallback if SDK initialization failed
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const restRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          }),
        });

        if (!restRes.ok) {
          const errBody = await restRes.text();
          throw new Error(`HTTP ${restRes.status} de Gemini API: ${errBody}`);
        }

        const data = await restRes.json();
        replyText = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
      }

      if (replyText) {
        console.log(`[Tutor Chat] Éxito con modelo ${model} (${replyText.length} caracteres)`);
        return res.status(200).json({
          reply: replyText,
          modelUsed: model,
        });
      }
    } catch (err) {
      // Si el modelo devuelve 404 (no encontrado / no disponible), 429 (cuota agotada) u otro error, pasa al siguiente
      const errStr = err?.message || String(err);
      console.warn(`[Tutor Chat] Fallo con modelo ${model} (error 404/429 o similar):`, errStr);
      attemptedErrors.push({ model, error: errStr });
      lastError = err;
      // El bucle for continúa inmediatamente con el siguiente modelo de la lista
    }
  }

  console.error('[Tutor Chat] Todos los modelos fallaron:', attemptedErrors);

  return res.status(500).json({
    error: `No se pudo obtener respuesta del tutor IA tras probar ${models.join(', ')}.`,
    details: attemptedErrors,
  });
}
