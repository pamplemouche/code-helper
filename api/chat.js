export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history || [], 
        generationConfig: { 
            response_mime_type: "application/json", 
            temperature: 0.7 
        },
        system_instruction: {
          parts: [{ text: `Tu es le partenaire de dev de Pamplemouche. 
            Tu peux discuter normalement (champ 'text') et générer du code (champs 'code', 'path', 'repo').
            
            Format JSON obligatoire :
            {
              "text": "Ta réponse textuelle ici (obligatoire)",
              "repo": "USER/REPO",
              "path": "chemin/fichier.js",
              "code": "le code ici",
              "createRepo": false
            }` }]
        }
      })
    });

    const data = await response.json();
    const rawOutput = data.candidates[0].content.parts[0].text;
    const json = JSON.parse(rawOutput);

    res.status(200).json({ 
      ...json, 
      fullResponse: data.candidates[0].content 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
