import { GoogleGenAI } from '@google/genai';

/**
 * Serverless function for Chispa Français AI French Companion ("Camille")
 * Compatible with Vercel Serverless Functions, Node.js, and Express dev server.
 */

// Prioritized fallback models: fast, modern, and officially supported
const MODEL_FALLBACK_LIST = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-2.5-flash'
];

/**
 * Builds dynamic Camille system prompt with persistent student memory
 */
function buildSystemInstruction(studentName, studentFacts, supportLanguage) {
  const isSv = supportLanguage === 'sv';
  const realName = studentFacts?.name || (studentName && studentName !== 'Élève' ? studentName : null);

  const factsList = [];
  if (realName) factsList.push(`- Nombre de la estudiante: ${realName}`);
  if (studentFacts?.age) factsList.push(`- Edad: ${studentFacts.age} años`);
  if (Array.isArray(studentFacts?.pets) && studentFacts.pets.length > 0) {
    factsList.push(`- Mascotas: ${studentFacts.pets.join(', ')}`);
  }
  if (Array.isArray(studentFacts?.favoriteFoods) && studentFacts.favoriteFoods.length > 0) {
    factsList.push(`- Comida favorita: ${studentFacts.favoriteFoods.join(', ')}`);
  }
  if (Array.isArray(studentFacts?.hobbies) && studentFacts.hobbies.length > 0) {
    factsList.push(`- Aficiones e intereses: ${studentFacts.hobbies.join(', ')}`);
  }
  if (studentFacts?.cityOrCountry) {
    factsList.push(`- Lugar: ${studentFacts.cityOrCountry}`);
  }
  if (Array.isArray(studentFacts?.otherFacts) && studentFacts.otherFacts.length > 0) {
    factsList.push(`- Otros datos: ${studentFacts.otherFacts.join(', ')}`);
  }

  const memoryBlock = factsList.length > 0
    ? `DATOS RECORDADOS DE LA ESTUDIANTE (MEMORIA ACTIVA Y PERSISTENTE):
${factsList.join('\n')}

INSTRUCCIONES CLAVE DE MEMORIA:
${realName ? `1. La estudiante se llama REALMENTE ${realName}.
2. Si te pregunta si te acuerdas de su nombre, de cómo se llama, o quién es, responde de inmediato y con total certeza: «¡Claro que sí! Te llamas ${realName}.» NUNCA dudes, NUNCA le pidas que te lo repita y JAMÁS digas que se llama "Sophie".` : ''}`
    : `DATOS RECORDADOS:
- Aún no ha compartido datos personales. Si te dice su nombre, recuérdalo. ¡JAMÁS asumas que se llama "Sophie"!`;

  return `Eres Camille, una compañera de conversación amigable que ayuda a una estudiante principiante a dar sus primeros pasos en el aprendizaje del francés desde cero.

PAUTAS DE IDIOMA Y ENFOQUE PEDAGÓGICO:
1. Idioma base: El ${isSv ? 'SUECO' : 'ESPAÑOL'} (la estudiante está empezando). Introduces palabras en francés de forma progresiva con el método sándwich: español + palabra en francés en cursiva + ayuda de pronunciación sencilla entre paréntesis.
   Ejemplo: «¡Qué bien! A mí también me encanta. En francés, canción se dice *chanson* (se pronuncia 'shansón'). ¿Qué música te gusta?».
2. Pronunciación: Escribe siempre entre paréntesis una aproximación sencilla (ej: *bonjour* (se pronuncia 'bonyúr'), *chat* (se pronuncia 'sha')).

LONGITUD Y FORMATO DE CHAT (REGLA ESTRICTA DE BREVEDAD):
1. RESPUESTAS MUY BREVES: MÁXIMO 2 O 3 ORACIONES CORTAS en total. Es un chat de mensajería instantánea para móvil. Sé directa, cálida y conversacional. ¡CERO párrafos largos!
2. Hilo temático: Conecta siempre de inmediato con lo que la estudiante acaba de escribir.
3. Cierre guiado: Termina siempre con una sola pregunta corta y fácil de responder (idealmente con opciones A/B o respuesta corta).
4. Corrección formativa: Si la estudiante intenta escribir en francés y comete algún fallo, valida su esfuerzo con amabilidad y muestra la forma adecuada dentro de tu frase, sin desanimarla.

${memoryBlock}`;
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
async function processChatRequest(rawMessages, rawApiKey, studentName, studentFacts, supportLanguage) {
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

  // Prepend explicit memory facts to the conversation turns so the model always adheres to them
  const realName = studentFacts?.name || (studentName && studentName !== 'Élève' ? studentName : null);
  const memoryNotes = [];
  if (realName) memoryNotes.push(`El estudiante se llama ${realName}.`);
  if (studentFacts?.age) memoryNotes.push(`Tiene ${studentFacts.age} años.`);
  if (Array.isArray(studentFacts?.pets) && studentFacts.pets.length > 0) {
    memoryNotes.push(`Mascotas: ${studentFacts.pets.join(', ')}.`);
  }
  if (Array.isArray(studentFacts?.favoriteFoods) && studentFacts.favoriteFoods.length > 0) {
    memoryNotes.push(`Comida favorita: ${studentFacts.favoriteFoods.join(', ')}.`);
  }
  if (Array.isArray(studentFacts?.hobbies) && studentFacts.hobbies.length > 0) {
    memoryNotes.push(`Aficiones: ${studentFacts.hobbies.join(', ')}.`);
  }

  if (memoryNotes.length > 0 && contents.length > 0 && contents[0].parts?.[0]) {
    const memoryHeader = `[Memoria del estudiante: ${memoryNotes.join(' ')}]\n\n`;
    contents[0].parts[0].text = memoryHeader + contents[0].parts[0].text;
  }

  // 2. Sequential attempt across models with fast per-model timeout
  let lastError = null;
  const systemInstruction = buildSystemInstruction(studentName, studentFacts, supportLanguage);

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

  const modelErrors = {};

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
              systemInstruction,
              maxOutputTokens: 150, // Strict chat brevity: 2 to 3 short sentences
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
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 150,
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
      modelErrors[model] = errMessage;
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
    const { messages, studentName, studentFacts, supportLanguage } = req.body || {};
    const result = await processChatRequest(messages, apiKey, studentName, studentFacts, supportLanguage);
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
    const { messages, studentName, studentFacts, supportLanguage } = body || {};
    const result = await processChatRequest(messages, apiKey, studentName, studentFacts, supportLanguage);
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
