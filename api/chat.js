export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Interdit');

  const { prompt, context } = req.body;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Ou "deepseek-reasoner" pour le modèle R1 ultra puissant
        messages: [
          { role: "system", content: "Tu es Pamplemouche-Dev-AI. Code uniquement en JS/HTML/CSS. Pas de blabla." },
          { role: "user", content: `CONTEXTE: ${context}\n\nINSTRUCTION: ${prompt}` }
        ],
        stream: false
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ completion: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "Réponse vide de DeepSeek" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion à DeepSeek" });
  }
}
