export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Tu es une API qui répond uniquement en JSON. Instruction: ${prompt}. Format: {"path": "test.js", "code": "alert(1)", "explanation": "test"}` }] }]
      })
    });

    const data = await response.json();
    
    // Si Google renvoie une erreur, on la transmet proprement pour la voir dans ta console orange
    if (data.error) return res.status(200).json({ explanation: "Erreur Google: " + data.error.message, path: "error.log", code: "" });

    const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(text));
  } catch (e) {
    res.status(200).json({ explanation: "Erreur Script: " + e.message, path: "error.log", code: "" });
  }
}
