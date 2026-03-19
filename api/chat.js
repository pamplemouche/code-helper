export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Interdit');

  const { prompt, context } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Tu es Pamplemouche-Dev-AI. 
                  CONTEXTE OS: ${context}
                  INSTRUCTION: ${prompt}
                  
                  Réponds UNIQUEMENT avec le code brut (JS, HTML ou CSS). 
                  Pas de balises markdown type \`\`\`javascript, juste le texte du code.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      res.status(200).json({ completion: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: "Réponse vide de Gemini", details: data });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion à Gemini" });
  }
}
