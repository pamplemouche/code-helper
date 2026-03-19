export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history || [], 
        generationConfig: { response_mime_type: "application/json", temperature: 0.2 },
        system_instruction: {
          parts: [{ text: `Tu es l'unité de déploiement Pamplemouche. 
            Dès que l'utilisateur demande une modification ou une création :
            1. Remplis 'text' avec ton explication.
            2. Remplis OBLIGATOIREMENT 'code', 'path' et 'repo'.
            3. Ne mets JAMAIS de blocs de code Markdown dans le champ 'text'.
            
            JSON STRICT :
            {
              "text": "Explication ici",
              "repo": "PSEUDO/REPO",
              "path": "chemin/du/fichier.js",
              "code": "CONTENU COMPLET DU FICHIER",
              "createRepo": false
            }` }]
        }
      })
    });

    const data = await response.json();
    if (!data.candidates) throw new Error("Erreur API Google");
    
    const json = JSON.parse(data.candidates[0].content.parts[0].text);
    res.status(200).json({ ...json, fullResponse: data.candidates[0].content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
