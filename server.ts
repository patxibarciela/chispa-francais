import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
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
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// Resilient French Audio TTS Proxy Endpoint (bypasses browser Referer blocks and missing local OS voices)
app.get('/api/tts/fr', async (req, res) => {
  try {
    const rawText = String(req.query.text || '').replace(/<[^>]*>/g, '').trim();
    if (!rawText) {
      return res.status(400).send('Text query param is required');
    }
    const cleanText = rawText.slice(0, 200);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=fr&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    
    const upstreamRes = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/mpeg, audio/*',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('Upstream TTS error');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    const buffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error('Server TTS proxy error:', err);
    return res.status(500).send('Internal TTS error');
  }
});

// Conversational Tutor endpoint
app.post('/api/tutor/chat', async (req, res) => {
  const { messages, supportLanguage = 'es', currentUnit = 'Salutations' } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const systemInstruction = `Eres "Léo", un tutor pedagógico de francés muy simpático, alentador y dinámico para una estudiante de 13 años (årskurs 6 en Suecia, Moderna språk, nivel principiante / A1 desde cero).
Tu objetivo es ayudarla a aprender francés de forma activa y divertida, sin explicaciones teóricas aburridas.
Directrices pedagógicas:
1. Comunícate principalmente en francés sencillo y adaptado a su nivel.
2. Si comete un error, señala la falla con muchísima amabilidad, dale una pista breve en ${supportLanguage === 'sv' ? 'sueco' : 'español'} si es necesario y pídele que reformule.
3. Si lo hace bien, felicítala ("¡Bravo !", "¡Excellent !", "¡Très bien !") y haz una pregunta corta para mantener la conversación viva.
4. Mantén las respuestas breves (máximo 2-3 frases cortas), con emojis amigables.
5. Tema actual de estudio: ${currentUnit}.
6. Si la estudiante pregunta cómo se dice algo o pide explicaciones, explícaselo en francés con la traducción en ${supportLanguage === 'sv' ? 'sueco (svenska)' : 'español'}.
7. Fomenta siempre que escriba o intente hablar en francés.`;

  if (ai) {
    try {
      // Build conversation history for generateContent
      const lastMessage = messages[messages.length - 1]?.content || 'Bonjour !';
      const historySummary = messages.slice(-6).map((m: any) => `${m.role === 'user' ? 'Étudiante' : 'Léo'}: ${m.content}`).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Historial de la conversación:\n${historySummary}\n\nÚltimo mensaje de la estudiante: "${lastMessage}"\n\nResponde como Léo siguiendo las instrucciones del sistema:`,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || 'Très bien ! Continuons à pratiquer le français !';
      return res.json({ reply });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      // Fall through to smart rule-based fallback
    }
  }

  // Fallback responses when AI is unavailable or offline
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  let fallbackReply = "¡Bravo ! C'est une très bonne tentative. Comment tu t'appelles ?";
  if (lastMsg.includes('bonjour') || lastMsg.includes('salut')) {
    fallbackReply = "Bonjour ! Enchanté ! Ça va bien aujourd'hui ? Tu peux me dire : « Ça va bien, merci ! »";
  } else if (lastMsg.includes('merci')) {
    fallbackReply = "De rien ! Tu veux apprendre de nouveaux mots sur la famille, les nombres ou les animaux ?";
  } else if (lastMsg.includes('je m\'appelle') || lastMsg.includes('je mappelle')) {
    fallbackReply = "Enchanté ! Quel bel prénom ! Quel âge as-tu ? Tu peux dire : « J'ai 13 ans ! »";
  } else if (lastMsg.includes('ans') || lastMsg.includes('treize') || lastMsg.includes('13')) {
    fallbackReply = "Super ! 13 ans, c'est l'âge parfait pour commencer le français ! Tu es prête pour un petit jeu ?";
  } else if (lastMsg.includes('oui')) {
    fallbackReply = "Fantastique ! Comment dit-on « gato » en français ? Est-ce que c'est : un chien, un chat, ou un oiseau ?";
  } else {
    fallbackReply = "C'est bien essayé ! Répète avec moi : « J'apprends le français à l'école ! » ✨";
  }

  return res.json({ reply: fallbackReply });
});

// 4-Phase 30-min Structured Session Step Evaluator
app.post('/api/tutor/session-evaluate', async (req, res) => {
  const { phase, sessionTitle, userInput, history, supportLanguage = 'es' } = req.body;

  const promptLanguage = supportLanguage === 'sv' ? 'sueco' : 'español';

  if (ai) {
    try {
      if (phase === 3) {
        // Phase 3: Active Production & Roleplay with constraint escalation
        const prompt = `Actúas como tutor de francés para una estudiante de 13 años (årskurs 6, nivel A1 principiante).
Estamos en la Fase 3 de su sesión de 30 minutos sobre: "${sessionTitle}".
Respuesta actual de la estudiante: "${userInput}"
Historial previo de la fase: ${JSON.stringify(history || [])}

Instrucciones:
1. Evalúa si la respuesta en francés es comprensible y gramaticalmente aceptable para su nivel.
2. Si es CORRECTA:
   - Dale un elogio entusiasta y breve.
   - Añade una restricción para la siguiente frase para subir el nivel (ejemplo: "Ahora responde usando 'et' (y) o añade el color", o "agrega 's'il vous plaît'").
   - Plantea la siguiente situación de la simulación.
3. Si tiene un ERROR:
   - Señala el error de forma muy amable y constructiva.
   - Dale una pista breve en ${promptLanguage}.
   - Pídele amablemente que reformule la frase antes de continuar.

Devuelve un JSON con el siguiente formato exacto:
{
  "isCorrect": boolean,
  "feedback": "Texto breve de feedback amable",
  "nextPrompt": "La siguiente pregunta o reto con restricción",
  "hint": "Pista opcional en ${promptLanguage}"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const jsonStr = (response.text ?? '{}').trim();
        const data = JSON.parse(jsonStr);
        return res.json(data);
      } else if (phase === 4) {
        // Phase 4: Exit ticket evaluation (2 key points: what went well, what to review)
        const prompt = `Actúas como tutor de francés para una estudiante de 13 años.
Estamos en la Fase 4 (Reto de salida) de su sesión de 30 minutos: "${sessionTitle}".
La estudiante ha escrito como resumen final: "${userInput}"

Evalúa su desempeño y devuelve un JSON con:
1. "puntosFuertes": breve resumen de lo que hizo bien hoy (en ${promptLanguage}).
2. "paraRevisar": 1 o 2 aspectos concretos a repasar mañana (en ${promptLanguage}).
3. "frenchComment": una frase final motivadora en francés fácil para cerrar la sesión con orgullo.
4. "scoreXP": un número entre 30 y 50 de puntos XP ganados.

Formato JSON exacto:
{
  "puntosFuertes": "...",
  "paraRevisar": "...",
  "frenchComment": "...",
  "scoreXP": 45
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const jsonStr = (response.text ?? '{}').trim();
        const data = JSON.parse(jsonStr);
        return res.json(data);
      }
    } catch (err: any) {
      console.error('Session evaluate Gemini error:', err);
    }
  }

  // Graceful rule-based fallback
  if (phase === 3) {
    const isGood = userInput.trim().length > 3;
    return res.json({
      isCorrect: isGood,
      feedback: isGood ? '¡Très bien ! Has respondido muy bien en francés.' : 'Buen intento. Recuerda usar las palabras que vimos antes.',
      nextPrompt: isGood
        ? 'Ahora responde añadiendo un detalle más con la palabra « et » (y) o « avec » (con).'
        : 'Intenta reescribirlo usando « Je m\'appelle... » o « J\'ai... »',
      hint: isGood ? 'Ejemplo: « ... et j\'aime la pizza »' : 'Recuerda que en francés se dice « Je » para yo.',
    });
  } else {
    return res.json({
      puntosFuertes: 'Has completado los ejercicios de producción activa y usado el vocabulario clave de la sesión.',
      paraRevisar: 'Repasa la concordancia de género (le / la / un / une) y la pronunciación.',
      frenchComment: 'Félicitations pour cette superbe séance de 30 minutes ! Tu fais de grands progrès ! 🌟',
      scoreXP: 45,
    });
  }
});

// Setup Vite dev server or static file serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
