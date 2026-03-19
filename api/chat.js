export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body; // <-- On reçoit l'historique maintenant

  try {
    const messages = history || []; // On initialise l'historique
    messages.push({ role: "user", parts: [{ text: prompt }] }); // Ajoute la nouvelle instruction

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages, // <-- On envoie TOUT l'historique
        generationConfig: {
          response_mime_type: "application/json",
        },
      })
    });

    const data = await response.json();
    
    if (data.error) {
        return res.status(200).json({ explanation: "Erreur Google: " + data.error.message, path: "error.log", code: "" });
    }

    const geminiResponseText = data.candidates[0].content.parts[0].text;
    const jsonParsed = JSON.parse(geminiResponseText);

    res.status(200).json({
        path: jsonParsed.path || "logs/note.txt",
        code: jsonParsed.code || "// Aucun code généré",
        explanation: jsonParsed.explanation || "Action effectuée",
        fullResponse: data.candidates[0].content // <-- On renvoie la réponse complète pour l'historique
    });

  } catch (e) {
    res.status(200).json({ explanation: "Erreur Script: " + e.message, path: "error.log", code: "" });
  }
}
