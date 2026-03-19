export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body;

  try {
    // On utilise le modèle PRO pour plus de précision
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history || [], 
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1 // Très bas pour éviter les erreurs de syntaxe
        },
        system_instruction: {
          parts: [{ text: "Tu es l'ingénieur principal de Pamplemouche OS. Tu génères du code JS/HTML/CSS robuste. Réponds TOUJOURS au format JSON: {'path': 'string', 'code': 'string', 'explanation': 'string'}" }]
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
        return res.status(500).json({ error: "Erreur Google: " + data.error.message });
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonParsed = JSON.parse(text);

    res.status(200).json({
        path: jsonParsed.path,
        code: jsonParsed.code,
        explanation: jsonParsed.explanation,
        fullResponse: data.candidates[0].content 
    });

  } catch (e) {
    res.status(500).json({ error: "Erreur : " + e.message });
  }
}
