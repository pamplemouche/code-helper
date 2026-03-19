export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Interdit');

  const { prompt, context } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Tu es Pamplemouche-Dev-AI. Tu dois TOUJOURS répondre au format JSON strict.
                  Même si l'utilisateur te dit bonjour, invente une tâche ou propose une amélioration.
                  
                  INSTRUCTION: ${prompt}
                  CONTEXTE: ${context}
                  
                  FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement) :
                  {
                    "path": "chemin/du/fichier",
                    "code": "contenu",
                    "explanation": "explication"
                  }`
          }]
        }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;

    // Nettoyage radical des balises markdown si Gemini en met quand même
    const jsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const parsed = JSON.parse(jsonString);
        res.status(200).json(parsed);
    } catch (parseError) {
        // Si Gemini a envoyé du texte au lieu du JSON, on crée un JSON manuellement
        res.status(200).json({
            path: "logs/ai.txt",
            code: rawText,
            explanation: "L'IA a répondu hors format, voici sa réponse brute."
        });
    }

  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion Gemini" });
  }
}
