export default async function handler(req, res) {
  const { path, content, message, repo, createRepo } = req.body;
  const GH_TOKEN = process.env.GH_TOKEN;
  const [user, repoName] = repo.split('/');

  try {
    // ÉTAPE 1 : Si l'IA demande de créer le repo
    if (createRepo) {
      await fetch(`https://api.github.com/user/repos`, {
        method: "POST",
        headers: { "Authorization": `token ${GH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: repoName, private: false, auto_init: true })
      });
      // On attend un peu que GitHub initialise le repo
      await new Promise(r => setTimeout(r, 2000));
    }

    // ÉTAPE 2 : Récupérer le SHA (pour mise à jour)
    const getFile = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { "Authorization": `token ${GH_TOKEN}` }
    });
    
    let sha = null;
    if (getFile.status === 200) {
      const fileData = await getFile.json();
      sha = fileData.sha;
    }

    // ÉTAPE 3 : Écrire le code
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: { "Authorization": `token ${GH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: sha
      })
    });

    if (response.ok) res.status(200).json({ success: true });
    else res.status(500).json({ error: "Erreur écriture" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
