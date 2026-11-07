export default async function handler(req, res) {
  // Manejo de CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada en las variables de entorno del servidor.' });
    }

    const systemInstruction = "Tu es Léo, un tuteur de français amical et encourageant pour les enfants. Tu réponds de manière courte, simple et bienveillante en français adaptatif. Si l'utilisateur parle espagnol ou suédois, réponds gentiment en français avec une traduction simple entre parenthèses.";

    // Modelos compatibles sugeridos por la propia API
    const models = [
      'gemini-3.8-flash',
      'gemini-1.5-flash-latest'
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
          return res.status(200).json({ reply: replyText, usedModel: model });
        }

        lastError = data.error ? JSON.stringify(data.error) : `Status ${response.status}`;
        console.log(`[Tutor Chat] Fallo con modelo ${model}:`, lastError);
      } catch (err) {
        lastError = err.message;
        console.log(`[Tutor Chat] Error en fetch con ${model}:`, err.message);
      }
    }

    return res.status(503).json({ 
      error: 'No se pudo obtener respuesta del tutor IA tras probar la cascada de modelos.', 
      details: lastError 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
