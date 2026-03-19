export default async function handler(req, res) {
  const { prompt, context } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Tu es Pamplemouche-Dev-AI. 
                  Tu dois analyser l'instruction suivante et décider quel fichier modifier.
                  
                  INSTRUCTION: ${prompt}
                  
                  Réponds UNIQUEMENT au format JSON suivant, sans balises markdown :
                  {
                    "path": "le/chemin/du/fichier.js",
                    "code": "le contenu complet du code",
                    "explanation": "une courte phrase sur ce que tu as fait"
                  }`
          }]
        }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    // On nettoie la réponse au cas où Gemini ajoute des ```json
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    res.status(500).json({ error: "Erreur d'analyse JSON de l'IA" });
  }
}
