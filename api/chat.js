import { GoogleGenAI } from '@google/genai';

/**
 * Serverless function for Chispa Français AI French Companion ("Camille")
 * Compatible with Vercel Serverless Functions, Node.js, and Express dev server.
 */

// Prioritized fallback models: fast, modern, and officially supported
const MODEL_FALLBACK_LIST = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash'
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
async function processChatRequest(rawMessages, rawApiKey) {
  const apiKey = (rawApiKey || '').replace(/['"\s]+/g, '').trim();

  if (!apiKey) {
    return {
      status: 500,
      data: {
        success: false,
        error: 'GEMINI_API_KEY no configurada en las variables de entorno de Vercel.',
        details: 'Añade la variable GEMINI_API_KEY en Vercel > Settings > Environment Variables y haz un redeploy.'
      }
    };
  }

  if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
    return {
      status: 400,
      data: { success: false, error: 'No se enviaron mensajes en la petición.' }
    };
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
    contents.push({
      role: 'user',
      parts: [{ text: 'Bonjour !' }]
    });
  }

  // 2. Sequential attempt across models with reasonable 14s timeout
  let lastError = null;

  // Initialize official SDK
  let ai = null;
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
        timeout: 6500, // 6.5s per model ensures full execution stays within Vercel's limits
      },
    });
  } catch (err) {
    console.warn('[Tutor Chat] Error inicializando SDK:', err?.message || err);
  }

  for (const model of MODEL_FALLBACK_LIST) {
    try {
      console.log(`[Tutor Chat] Intentando modelo: ${model}`);
      let replyText = '';

      // 1. Try official SDK first
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              maxOutputTokens: 250,
            },
          });
          replyText = response.text?.trim() || '';
        } catch (sdkErr) {
          console.warn(`[Tutor Chat] SDK fallo con ${model}:`, sdkErr?.message || sdkErr);
          lastError = sdkErr?.message || String(sdkErr);
        }
      }

      // 2. Direct REST fetch fallback if SDK didn't return text
      if (!replyText) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6500);

        try {
          const restRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 250,
                }
              })
            }
          );

          const data = await restRes.json().catch(() => ({}));
          if (restRes.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            replyText = data.candidates[0].content.parts[0].text.trim();
          } else {
            const errDetail = data?.error?.message || (data?.error ? JSON.stringify(data.error) : `Status ${restRes.status}`);
            throw new Error(errDetail);
          }
        } finally {
          clearTimeout(timer);
        }
      }

      if (replyText) {
        console.log(`[Tutor Chat] Éxito con ${model} (${replyText.length} caracteres)`);
        return {
          status: 200,
          data: {
            success: true,
            reply: replyText,
            usedModel: model
          }
        };
      }
    } catch (err) {
      const errMessage = err?.message || String(err);
      console.warn(`[Tutor Chat] Fallo con ${model}:`, errMessage);
      lastError = errMessage;

      // If rate limited (429), pause briefly before trying next model
      if (errMessage.includes('429')) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }

  return {
    status: 503,
    data: {
      success: false,
      error: 'No se pudo obtener respuesta del tutor IA.',
      details: lastError || 'Los modelos de Gemini no respondieron a tiempo.'
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
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
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
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
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
