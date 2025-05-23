export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.pushalert.co/rest/v1/send", {
      method: "POST",
      headers: {
        "Authorization": "60a78f90a87cca4b9908cde4ff1e323d",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Notificação de Teste",
        message: "Isso é um teste com PushAlert",
        url: "https://multiversando.vercel.app",
        image: ""
      })
    });

    const text = await response.text();
    console.log("Resposta PushAlert:", text);

    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch (e) {
      res.status(200).send(text);
    }

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: err.message });
  }
}