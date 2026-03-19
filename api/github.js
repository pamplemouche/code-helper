export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Interdit');

  const { path, content, message } = req.body;
  const GH_TOKEN = process.env.GH_TOKEN;
  const REPO = "TON_PSEUDO_GITHUB/pamplemouche-os"; // <--- CHANGE CECI

  try {
    // 1. On vérifie si le fichier existe déjà pour récupérer son "sha" (obligatoire pour modifier)
    const getFile = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      headers: { "Authorization": `token ${GH_TOKEN}` }
    });
    
    let sha = null;
    if (getFile.status === 200) {
      const fileData = await getFile.json();
      sha = fileData.sha;
    }

    // 2. On envoie le nouveau contenu
    const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message || "🛠️ Pamplemouche Dev: Mise à jour automatique",
        content: btoa(unescape(encodeURIComponent(content))), // Encodage propre pour GitHub
        sha: sha // Si null, GitHub crée le fichier. Si présent, il le modifie.
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      res.status(200).json({ success: true, url: result.content.html_url });
    } else {
      res.status(500).json({ error: "Erreur GitHub", details: result });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion à GitHub" });
  }
}
