export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history || [],
        generationConfig: { temperature: 0.7 },
        system_instruction: {
          parts: [{ text: `Tu es le partenaire de dev de Pamplemouche. 
            Réponds normalement en texte. 
            Quand tu génères du code, indique TOUJOURS le chemin du fichier juste avant le bloc de code sous la forme "Fichier: USER/REPO/path/to/file.ext".
            Exemple :
            Fichier: pamplemouche/code-helper/README.md
            \`\`\`markdown
            contenu...
            \`\`\` ` }]
        }
      })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    res.status(200).json({ text, fullResponse: data.candidates[0].content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
