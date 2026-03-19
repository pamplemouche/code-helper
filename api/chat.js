export default async function handler(req, res) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body;

  // On injecte un rappel de contexte pour que l'IA ne dévie jamais
  const systemPrompt = `Tu es une unité de commande GitHub. 
  Tu ne parles JAMAIS sans remplir les champs techniques.
  Même pour dire "Bonjour", tu dois proposer une action sur un repo.
  
  STRUCTURE JSON STRICTE :
  {
    "text": "Ton message ici",
    "repo": "TON_PSEUDO/NOM_DU_REPO",
    "path": "chemin/fichier.ext",
    "code": "CONTENU",
    "createRepo": false
  }`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history || [],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.1 // On baisse au minimum pour la précision
        },
        system_instruction: { parts: [{ text: systemPrompt }] }
      })
    });

    const data = await response.json();
    const output = JSON.parse(data.candidates[0].content.parts[0].text);

    // Sécurité : si l'IA oublie le repo, on force le dernier connu ou un défaut
    if (!output.repo || output.repo === "aucun") {
        output.repo = "TON_PSEUDO/code-helper"; 
    }

    res.status(200).json({ ...output, fullResponse: data.candidates[0].content });
  } catch (e) {
    res.status(500).json({ error: "L'IA a buggé sur le format JSON" });
  }
}
