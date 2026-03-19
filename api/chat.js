export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Interdit');

  const { prompt } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: "Clé API manquante dans Vercel !" });
  }

  try {
    // URL mise à jour vers la version stable v1
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Tu es Pamplemouche-Dev-AI. Réponds UNIQUEMENT au format JSON strict : 
            {"path": "chemin/du/fichier.js", "code": "contenu du code", "explanation": "action faite"}. 
            
            Instruction : ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: "Google refuse : " + data.error.message });
    }

    // Extraction du texte de la réponse
    let rawText = data.candidates[0].content.parts[0].text;
    
    // Nettoyage des balises de code markdown si présentes
    const jsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(jsonString);
    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({ error: "Erreur de traitement : " + error.message });
  }
}
