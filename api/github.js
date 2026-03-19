export default async function handler(req, res) {
  const { path, content, message, repo, createRepo } = req.body;
  const GH_TOKEN = process.env.GH_TOKEN;

  try {
    if (createRepo) {
      const [user, name] = repo.split('/');
      await fetch(`https://api.github.com/user/repos`, {
        method: "POST",
        headers: { "Authorization": `token ${GH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, auto_init: true })
      });
      await new Promise(r => setTimeout(r, 2000));
    }

    const getFile = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { "Authorization": `token ${GH_TOKEN}` }
    });
    
    let sha = null;
    if (getFile.status === 200) {
      const fileData = await getFile.json();
      sha = fileData.sha;
    }

    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: { "Authorization": `token ${GH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message || "Update via Pamplemouche AI",
        content: btoa(unescape(encodeURIComponent(content))),
        sha: sha
      })
    });

    if (response.ok) res.status(200).json({ success: true });
    else res.status(500).json({ error: "Erreur GitHub" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
