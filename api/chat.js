export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Interdit');

  const { prompt } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  // VERIFICATION 1 : La clé existe ?
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: "Clé API manquante dans Vercel !" });
  }

  try {
    // Utilisation du modèle stable 1.5 Flash (souvent plus fiable sur le palier gratuit)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Réponds uniquement en JSON : {"path": "chemin", "code": "contenu", "explanation": "quoi"}. 
                  Tâche : ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();

    // VERIFICATION 2 : Erreur retournée par Google ?
    if (data.error) {
      return res.status(500).json({ error: "Google refuse : " + data.error.message });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const jsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    res.status(200).json(JSON.parse(jsonString));

  } catch (error) {
    // VERIFICATION 3 : Problème de réseau
    res.status(500).json({ error: "Crash connexion : " + error.message });
  }
}
