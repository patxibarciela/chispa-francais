/**
 * Serverless function for Chispa Français AI French Companion ("Camille")
 * Compatible with Vercel Serverless Functions, Node.js, and Express dev server.
 */

// Prioritized fallback models: fast, stable, and free-tier compatible
const MODEL_FALLBACK_LIST = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-3.8-flash'
];

const SYSTEM_INSTRUCTION = `Eres Camille, una compañera de conversación amigable que ayuda a una estudiante principiante a dar sus primeros pasos en el aprendizaje del francés desde cero.

PAUTAS DE IDIOMA Y ENFOQUE PEDAGÓGICO:
1. Idioma base: La estudiante aún no habla francés. Tu idioma principal es el ESPAÑOL (o sueco si la estudiante escribe en sueco), pero introduces palabras, saludos o expresiones breves en francés de forma progresiva (método sándwich: español + palabra/frase en francés en cursiva + traducción o ayuda de pronunciación sencilla entre paréntesis).
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

/**
 * Robust Google Generative Language REST fetch with strict per-model timeout
 */
async function callModelWithTimeout(modelName, contents, systemInstruction, apiKey, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
          }
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    const errorMsg = data?.error?.message || (data?.error ? JSON.stringify(data.error) : `HTTP ${response.status}`);
    throw new Error(errorMsg);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extracts real text safely from any turn structure (m.parts, m.content, m.text)
 */
function extractTurnText(m) {
  if (!m) return '';
  if (typeof m === 'string') return m.trim();
  if (Array.isArray(m.parts)) {
    return m.parts
      .map((p) => (typeof p === 'string' ? p : p?.text || ''))
      .join(' ')
      .trim();
  }
  if (typeof m.content === 'string') return m.content.trim();
  if (typeof m.text === 'string') return m.text.trim();
  return '';
}

/**
 * Core chat executor supporting both Vercel Web Standard and Node/Express
 */
async function processChatRequest(rawMessages, apiKey) {
  if (!apiKey) {
    return { status: 500, data: { error: 'GEMINI_API_KEY no configurada en las variables de entorno de Vercel/servidor.' } };
  }

  if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
    return { status: 400, data: { error: 'No se enviaron mensajes en la petición.' } };
  }

  // 1. Normalize turns safely extracting non-empty text
  const contents = [];
  const recentTurns = rawMessages.slice(-8);

  for (const turn of recentTurns) {
    const text = extractTurnText(turn);
    if (!text) continue; // Skip empty turns to prevent Gemini 400 Bad Request

    const role = turn.role === 'assistant' || turn.role === 'model' || turn.role === 'ai' ? 'model' : 'user';
    contents.push({
      role,
      parts: [{ text }]
    });
  }

  // Gemini requires the conversation to start with a user message
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  if (contents.length === 0) {
    // If the conversation only had greeting turns, make a greeting prompt
    contents.push({
      role: 'user',
      parts: [{ text: 'Bonjour !' }]
    });
  }

  // 2. Sequential fallback across models
  let lastError = null;

  for (const model of MODEL_FALLBACK_LIST) {
    try {
      console.log(`[Tutor Chat] Intentando modelo: ${model}`);
      const replyText = await callModelWithTimeout(model, contents, SYSTEM_INSTRUCTION, apiKey, 4500);

      if (replyText && replyText.trim()) {
        console.log(`[Tutor Chat] Éxito con ${model}`);
        return {
          status: 200,
          data: {
            success: true,
            reply: replyText.trim(),
            usedModel: model
          }
        };
      }
    } catch (err) {
      console.warn(`[Tutor Chat] Fallo con ${model}:`, err?.message || err);
      lastError = err;

      // If rate limited (429), pause briefly before trying next model
      if (String(err?.message || '').includes('429')) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  const detailMessage = lastError?.message || 'Los modelos no respondieron a tiempo';
  return {
    status: 503,
    data: {
      success: false,
      error: 'No se pudo obtener respuesta del tutor IA a tiempo.',
      details: detailMessage
    }
  };
}

/**
 * Standard Vercel Serverless Function (Node.js runtime)
 */
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { messages } = req.body || {};
    const result = await processChatRequest(messages, apiKey);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('[Tutor Chat] Error general:', error);
    return res.status(500).json({ error: error?.message || 'Error interno del servidor.' });
  }
}

/**
 * Next.js App Router / Edge runtime support
 */
export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = await request.json().catch(() => ({}));
    const result = await processChatRequest(body.messages, apiKey);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
