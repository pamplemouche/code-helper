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
          temperature: 0.2
        },
        system_instruction: {
          parts: [{ text: `Tu es un Engine de Développement Universel. 
            Tu ne poses pas de questions, tu n'analyses pas le langage : tu PRODUIS.
            Si l'utilisateur demande un OS Web, conçois une architecture de Machine Virtuelle (VFS, Kernel, Interface de gestion de processus).
            
            Tu dois extraire le repo cible du contexte ou utiliser 'TON_PSEUDO/pamplemouche-os' par défaut.
            
            RÉPONSE JSON STRICTE :
            {
              "repo": "user/repo",
              "path": "chemin/du/fichier",
              "code": "CONTENU_BRUT_DU_CODE",
              "explanation": "DESCRIPTION_COURTE"
            }` }]
        }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const jsonParsed = JSON.parse(data.candidates[0].content.parts[0].text.trim());

    res.status(200).json({
        repo: jsonParsed.repo,
        path: jsonParsed.path,
        code: jsonParsed.code,
        explanation: jsonParsed.explanation,
        fullResponse: data.candidates[0].content 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
