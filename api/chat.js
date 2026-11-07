export async function POST(request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key no configurada en el servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemInstruction = "Tu es Léo, un tuteur de français amical et encourageant pour les enfants. Tu réponds de manière courte, simple et bienveillante en français adaptatif. Si l'utilisateur parle espagnol ou suédois, réponds gentiment en français avec une traduction simple entre parenthèses.";

    // Lista de modelos ordenados por velocidad y compatibilidad actual
    const models = [
      'gemini-1.5-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-3.1-pro-preview'
    ];

    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: messages
            })
          }
        );

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const replyText = data.candidates[0].content.parts[0].text;
          return new Response(JSON.stringify({ reply: replyText, usedModel: model }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        lastError = data.error ? JSON.stringify(data.error) : `Status ${response.status}`;
        console.log(`[Tutor Chat] Fallo con modelo ${model}:`, lastError);
      } catch (err) {
        lastError = err.message;
        console.log(`[Tutor Chat] Error en fetch con ${model}:`, err.message);
      }
    }

    return new Response(JSON.stringify({ 
      error: 'No se pudo conectar con los modelos de IA.', 
      details: lastError 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handler compatible con Express y entornos Node serverless
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = `${req.protocol || 'http'}://${req.get?.('host') || 'localhost'}${req.originalUrl || req.url || '/api/chat'}`;
    const webRequest = new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    });

    const webResponse = await POST(webRequest);
    const status = webResponse.status;
    const data = await webResponse.json();

    res.setHeader('Content-Type', 'application/json');
    return res.status(status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Error en el servidor' });
  }
}
