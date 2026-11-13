import { GoogleGenAI, ThinkingLevel } from '@google/genai';

/**
 * Serverless function for Chispa Français AI French Companion ("Camille")
 * Compatible with Vercel Serverless Functions, Node.js, and Express dev server.
 */

/**
 * Prioritized active models for conversational tutoring (hedged fallback):
 * 1. gemini-4-hydrogen (ThinkingLevel.LOW): Best pedagogical & bilingual naturalness.
 * 2. gemini-3.8-flash (ThinkingLevel.LOW): Fast, high-quality fallback launched if primary stalls > 4.2s or errors.
 * 3. gemini-3.1-flash-lite (ThinkingLevel.MINIMAL): Ultra-fast resilience fallback launched if neither resolves by 6.7s.
 */
const MODEL_PRIORITY_CHAT = [
  {
    id: 'gemini-4-hydrogen',
    thinkingLevel: ThinkingLevel.LOW,
    hedgeDelayMs: 4200,
    role: 'primary-quality-fast',
  },
  {
    id: 'gemini-3.8-flash',
    thinkingLevel: ThinkingLevel.LOW,
    hedgeDelayMs: 2500,
    role: 'secondary-recommended',
  },
  {
    id: 'gemini-3.1-flash-lite',
    thinkingLevel: ThinkingLevel.MINIMAL,
    hedgeDelayMs: 0,
    role: 'tertiary-ultra-fast',
  },
];

/**
 * Builds dynamic Camille system prompt with persistent student memory and French immersion settings
 */
function buildSystemInstruction(studentName, studentFacts, supportLanguage, immersionLevel = 'high') {
  const isSv = supportLanguage === 'sv';
  const supLang = isSv ? 'sueco' : 'español';
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

  let immersionDirectives = '';
  if (immersionLevel === 'french-only') {
    immersionDirectives = `EQUILIBRIO DE IDIOMA: INMERSIÓN COMPLETA EN FRANCÉS SENCILLO (100% FRANCÉS A1/A2).
- Habla TODO en francés sencillo, claro, natural y adaptado a principiantes de secundaria.
- Solo recurre al ${supLang} si la estudiante te pide expresamente traducir una palabra o dice que no entiende absolutamente nada.`;
  } else if (immersionLevel === 'balanced') {
    immersionDirectives = `EQUILIBRIO DE IDIOMA: EQUILIBRADO (50% FRANCÉS SENCILLO, 50% ${supLang.toUpperCase()}).
- Inicia con una frase corta y natural en francés, seguida de su traducción o aclaración breve en ${supLang}.`;
  } else {
    immersionDirectives = `EQUILIBRIO DE IDIOMA: PREDOMINIO CLARO DEL FRANCÉS SENCILLO (75-85% FRANCÉS, 15-25% ${supLang.toUpperCase()}).
- PRIORIDAD AL FRANCÉS FÁCIL: La estudiante pide expresamente UTILIZAR MUCHO MÁS FRANCÉS SENCILLO Y MENOS ${supLang.toUpperCase()}.
- Formula tus saludos, exclamaciones (« Super ! », « Bravo ! », « Moi aussi ! »), frases principales y preguntas de cierre directamente en francés sencillo (nivel A1/A2).
- El ${supLang} debe ser ÚNICAMENTE un apoyo breve entre paréntesis o una pequeña pista de traducción (ej: « *J'adore la musique pop ! Quel genre de musique tu écoutes ?* (¿Qué música escuchas?) »).
- NUNCA escribas respuestas donde casi todo esté en ${supLang} y solo haya una palabrita en francés. ¡El francés sencillo debe ser el protagonista!`;
  }

  return `Eres Camille, una compañera de conversación amigable, natural y entusiasta que ayuda a una estudiante de 13 años a practicar francés en un entorno real y divertido.

${immersionDirectives}

ADAPTABILIDAD DINÁMICA INMEDIATA:
- Si la estudiante pide más francés en cualquier mensaje ("háblame en francés", "más francés por favor", "plus de français", "parle français"):
  -> Aumenta DE INMEDIATO el francés al 95-100%, con vocabulario sencillo y felicítala por el reto ("*D'accord ! On continue en français alors !*").
- Si la estudiante dice que no entiende o pide traducción ("no entiendo", "en español por favor", "¿qué significa?", "prata svenska"):
  -> Explícale DE INMEDIATO con dulzura en ${supLang}, traduce la frase anterior y facilítale opciones claras.
- Si pide un punto medio o cualquier otro ajuste, acéptalo al instante y ajústate en ese mismo mensaje.

ESTILO, FLUIDEZ Y BREVEDAD:
1. RESPUESTAS MUY BREVES Y NATURALES: MÁXIMO 2 O 3 ORACIONES CORTAS en total (aprox. 25-55 palabras). Es un chat de mensajería para móvil: sé directa, cercana y conversacional. ¡CERO párrafos largos!
2. Hilo temático vivo: Conecta de inmediato con lo que la estudiante acaba de decir, como una amiga real, evitando sonar robótica o repetitiva.
3. Cierre guiado: Termina siempre con una sola pregunta corta y natural en francés fácil que invite a seguir charlando.
4. Corrección amable: Si comete un fallo en francés, valora su intento con cariño y muestra la forma natural dentro de tu frase sin cortar el ritmo.
5. Pronunciación: Cuando introduzcas una expresión nueva útil, puedes añadir opcionalmente una pista fonética muy breve entre paréntesis.

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
 * Normalizes turns for Gemini: ensures alternating user/model roles and starts with user.
 */
function normalizeContents(rawMessages, studentName, studentFacts) {
  const contents = [];
  const recentTurns = rawMessages.slice(-10);

  for (const turn of recentTurns) {
    const text = extractTurnText(turn);
    if (!text) continue;

    const role = turn.role === 'assistant' || turn.role === 'model' || turn.role === 'ai' ? 'model' : 'user';
    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) {
      prev.parts[0].text += `\n${text}`;
    } else {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: 'Bonjour !' }],
    });
  }

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

  return contents;
}

/**
 * Classifies Gemini API errors to decide whether to abort immediately or fail over to next model.
 */
function isFatalKeyError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  const status = err?.status || err?.statusCode;
  if (status === 401 || status === 403) return true;
  if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('permission_denied')) {
    return true;
  }
  return false;
}

const unavailableModels = new Set();

function isModelUnavailableError(err) {
  const status = err?.status || err?.statusCode;
  const msg = String(err?.message || err || '').toLowerCase();
  return status === 404 || msg.includes('not_found') || msg.includes('no longer available');
}

/**
 * Runs prioritized models using hedged requests:
 * - Starts primary (gemini-4-hydrogen) immediately.
 * - Only launches next fallback if the current one fails fast OR exceeds its hedge delay.
 * - Keeps slower models running within the overall deadline so the best or fastest valid reply wins.
 */
async function generateWithHedgedFallback({ ai, contents, systemInstruction }) {
  const activeModels = MODEL_PRIORITY_CHAT.filter((m) => !unavailableModels.has(m.id));
  const modelsToTry = activeModels.length > 0 ? activeModels : MODEL_PRIORITY_CHAT;
  const isVercel = Boolean(process.env.VERCEL);
  const totalBudgetMs = isVercel ? 13500 : 22000;

  return new Promise((resolve, reject) => {
    let settled = false;
    let lastError = null;
    let inFlight = 0;
    let nextIndex = 0;
    const controllers = new Set();
    const timers = new Set();

    const cleanupAll = () => {
      for (const t of timers) clearTimeout(t);
      timers.clear();
      for (const c of controllers) {
        try {
          c.abort();
        } catch {
          // ignore abort errors
        }
      }
      controllers.clear();
    };

    const masterTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanupAll();
      const timeoutErr = new Error(
        lastError || `Tiempo de espera agotado (${totalBudgetMs} ms) al esperar respuesta de Gemini.`
      );
      timeoutErr.isBudgetTimeout = true;
      reject(timeoutErr);
    }, totalBudgetMs);
    timers.add(masterTimer);

    const launchModel = (index) => {
      if (settled || index >= modelsToTry.length || index < nextIndex) return;
      nextIndex = index + 1;

      const modelSpec = modelsToTry[index];
      const controller = new AbortController();
      controllers.add(controller);
      inFlight += 1;

      let hedgeTimer = null;
      if (index + 1 < modelsToTry.length && modelSpec.hedgeDelayMs > 0) {
        hedgeTimer = setTimeout(() => {
          if (hedgeTimer) timers.delete(hedgeTimer);
          launchModel(index + 1);
        }, modelSpec.hedgeDelayMs);
        timers.add(hedgeTimer);
      }

      const startedAt = Date.now();
      ai.models
        .generateContent({
          model: modelSpec.id,
          contents,
          config: {
            systemInstruction,
            abortSignal: controller.signal,
            thinkingConfig: {
              thinkingLevel: modelSpec.thinkingLevel,
            },
          },
        })
        .then((response) => {
          if (settled) return;
          const replyText = response.text?.trim() || '';
          if (replyText) {
            settled = true;
            cleanupAll();
            resolve({
              reply: replyText,
              usedModel: modelSpec.id,
              latencyMs: Date.now() - startedAt,
            });
            return;
          }
          lastError = `El modelo ${modelSpec.id} devolvió una respuesta vacía.`;
          console.warn(`[Tutor Chat] ${lastError}`);
        })
        .catch((err) => {
          if (settled || controller.signal.aborted) return;
          const errMessage = err?.message || String(err);
          console.warn(`[Tutor Chat] Fallo con ${modelSpec.id} (${Date.now() - startedAt}ms):`, errMessage);
          lastError = errMessage;

          if (isModelUnavailableError(err)) {
            unavailableModels.add(modelSpec.id);
          }

          if (isFatalKeyError(err)) {
            settled = true;
            cleanupAll();
            reject(err);
          }
        })
        .finally(() => {
          controllers.delete(controller);
          if (hedgeTimer) {
            clearTimeout(hedgeTimer);
            timers.delete(hedgeTimer);
          }
          inFlight -= 1;
          if (settled) return;

          if (nextIndex < modelsToTry.length) {
            launchModel(nextIndex);
          } else if (inFlight === 0) {
            settled = true;
            cleanupAll();
            reject(new Error(lastError || 'Los modelos de Gemini no pudieron responder.'));
          }
        });
    };

    launchModel(0);
  });
}

/**
 * Core chat executor supporting both Vercel Web Standard and Node/Express
 */
async function processChatRequest(rawMessages, rawApiKey, studentName, studentFacts, supportLanguage, immersionLevel = 'high') {
  const apiKey = (rawApiKey || '').replace(/['"\s]+/g, '').trim();

  if (!apiKey) {
    return {
      status: 500,
      data: {
        success: false,
        error: 'GEMINI_API_KEY no configurada en el servidor.',
        details: 'Configura GEMINI_API_KEY en Settings > Secrets (o en Vercel Environment Variables).',
      },
    };
  }

  if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
    return {
      status: 400,
      data: { success: false, error: 'No se enviaron mensajes en la petición.' },
    };
  }

  const contents = normalizeContents(rawMessages, studentName, studentFacts);
  const systemInstruction = buildSystemInstruction(studentName, studentFacts, supportLanguage, immersionLevel);

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  try {
    const result = await generateWithHedgedFallback({ ai, contents, systemInstruction });
    return {
      status: 200,
      data: {
        success: true,
        reply: result.reply,
        usedModel: result.usedModel,
        latencyMs: result.latencyMs,
      },
    };
  } catch (err) {
    const errMessage = err?.message || String(err);
    if (isFatalKeyError(err)) {
      return {
        status: 403,
        data: {
          success: false,
          error: 'La clave GEMINI_API_KEY no es válida o no tiene permisos.',
          details: errMessage,
        },
      };
    }

    return {
      status: 503,
      data: {
        success: false,
        error: 'No se pudo obtener respuesta del tutor IA.',
        details: errMessage,
      },
    };
  }
}

/**
 * Standard Vercel Serverless Function (Node.js runtime)
 */
export default async function handler(req, res) {
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
    const { messages, studentName, studentFacts, supportLanguage, immersionLevel } = req.body || {};
    const result = await processChatRequest(messages, apiKey, studentName, studentFacts, supportLanguage, immersionLevel);
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
    const { messages, studentName, studentFacts, supportLanguage, immersionLevel } = body || {};
    const result = await processChatRequest(messages, apiKey, studentName, studentFacts, supportLanguage, immersionLevel);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
