export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history || [], 
        generationConfig: { 
          response_mime_type: "application/json", 
          temperature: 0.1 
        },
        system_instruction: {
          parts: [{ text: `Tu es l'Engine de Déploiement Universel.
            Tu maîtrises tous les langages et peux créer des dépôts GitHub.
            Si l'utilisateur demande un OS Web, génère un système avec VFS et Kernel.
            Si la demande ne nécessite pas de code, laisse les champs 'code' et 'path' vides dans ton JSON, mais remplis toujours 'explanation'.
            
            Format JSON obligatoire :
            {
              "repo": "USER/REPO",
              "path": "chemin/fichier.ext",
              "code": "CONTENU",
              "createRepo": true/false,
              "explanation": "DESCRIPTION"
            }` }]
        }
      })
    });

    const data = await response.json();
    
    // Sécurité anti-crash
    if (!data.candidates || !data.candidates[0]) {
      throw new Error("L'IA n'a pas répondu correctement.");
    }

    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ 
      ...JSON.parse(text), 
      fullResponse: data.candidates[0].content 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
