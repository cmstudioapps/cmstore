export default async function handler(req, res) {
  try {
    const response = await fetch("https://pushalert.co/rest/v1/send", {
      method: "POST",
      headers: {
        "Authorization": "60a78f90a87cca4b9908cde4ff1e323d",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Título da Notificação",
        message: "Conteúdo da mensagem da notificação",
        url: "https://seusite.com",
        image: "https://seusite.com/imagem.jpg", // pode ser deixado em branco se não quiser imagem
        segment: 0 // 0 significa enviar para todos os inscritos
      })
    });

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch {
      res.status(200).send(text);
    }

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: err.message });
  }
}