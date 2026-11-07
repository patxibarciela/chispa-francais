// Lista de modelos ordenada por velocidad y estabilidad en Tier Gratuito
const MODEL_FALLBACK_LIST = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest'
];

/**
 * Llama a un modelo mediante fetch nativo con timeout estricto de 6.5s
 */
async function callModelWithTimeout(modelName, contents, systemInstruction, apiKey, timeoutMs = 6500) {
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
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );

    const data = await response.json();

    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error(data.error ? JSON.stringify(data.error) : `Status ${response.status}`);
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  // 1. Cabeceras CORS completas
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    }

    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'No se han enviado mensajes' });
    }

    // 2. Normalizar historial: últimos 8 mensajes
    const recentMessages = messages.slice(-8);
    const contents = recentMessages.map((m) => ({
      role: m.role === 'assistant' || m.role === 'ai' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }]
    }));

    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    const systemInstruction = `Tu es Léo (ou Camille), un tuteur de français amical et encourageant pour les enfants. Tu réponds de manière courte, simple et bienveillante en français adaptatif. Si l'utilisateur parle espagnol ou suédois, réponds gentiment en français avec une traduction simple entre parenthèses.`;

    let replyText = null;
    let lastError = null;

    // 3. Fallback inteligente con timeout
    for (const model of MODEL_FALLBACK_LIST) {
      try {
        replyText = await callModelWithTimeout(model, contents, systemInstruction, apiKey, 6500);
        if (replyText && replyText.trim()) {
          return res.status(200).json({
            success: true,
            reply: replyText.trim(),
            usedModel: model
          });
        }
      } catch (err) {
        console.warn(`Fallo en modelo ${model}:`, err?.message || err);
        lastError = err;

        if (String(err?.message || '').includes('429')) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }

    return res.status(503).json({
      success: false,
      error: 'No se pudo obtener respuesta a tiempo.',
      details: lastError?.message || lastError
    });

  } catch (error) {
    console.error('Error general:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
