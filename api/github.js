export default async function handler(req, res) {
  const { path, content, message, repo } = req.body;
  const GH_TOKEN = process.env.GH_TOKEN;

  try {
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
      headers: {
        "Authorization": `token ${GH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: sha
      })
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const err = await response.json();
      res.status(500).json({ error: err.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
