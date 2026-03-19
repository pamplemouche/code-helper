export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history || [], 
        generationConfig: { response_mime_type: "application/json", temperature: 0.1 },
        system_instruction: {
          parts: [{ text: `Tu es un Engine de Déploiement. 
            Tu peux créer des fichiers ET des dépôts.
            Si l'utilisateur demande un nouveau projet, définis "createRepo": true.
            
            FORMAT JSON :
            {
              "repo": "USER/REPO_NAME",
              "path": "filename.ext",
              "code": "CODE",
              "createRepo": true/false,
              "explanation": "DESCRIPTION"
            }` }]
        }
      })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ ...JSON.parse(text), fullResponse: data.candidates[0].content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
