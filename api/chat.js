export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Tu es l'ingénieur système de Pamplemouche OS. 
                           Tu dois TOUJOURS générer un JSON valide.
                           Si l'utilisateur dit 'Bonjour', propose de créer un fichier d'accueil.
                           
                           Instruction: ${prompt}` }] 
        }],
        generationConfig: {
          response_mime_type: "application/json", // FORCE le format JSON
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
        return res.status(200).json({ explanation: "Erreur Google: " + data.error.message, path: "error.log", code: "" });
    }

    // Avec le mode JSON, Gemini renvoie directement le texte sans balises ```
    const text = data.candidates[0].content.parts[0].text;
    const jsonParsed = JSON.parse(text);

    // On s'assure que les champs existent pour éviter le crash de l'index.html
    res.status(200).json({
        path: jsonParsed.path || "logs/note.txt",
        code: jsonParsed.code || "// Aucun code généré",
        explanation: jsonParsed.explanation || "Action effectuée"
    });

  } catch (e) {
    res.status(200).json({ explanation: "Erreur Script: " + e.message, path: "error.log", code: "" });
  }
}
