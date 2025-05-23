export default async function handler(req, res) {
  // Configuração da notificação
  const notificationData = {
    title: "Título da Notificação",
    message: "Conteúdo da mensagem da notificação",
    url: "https://cm-store.vercel.app",
    image: "", // Opcional
    segment: 0 // 0 = todos os inscritos
  };

  try {
    // 1. Faz a requisição para o endpoint CORRETO da API
    const response = await fetch("https://api.pushalert.co/rest/v1/send", { // 👈 Endpoint corrigido
      method: "POST",
      headers: {
        "Authorization": "api_key=60a78f90a87cca4b9908cde4ff1e323d", // Formato oficial
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notificationData)
    });

    // 2. Processa a resposta
    const responseText = await response.text();
    
    try {
      const jsonResponse = JSON.parse(responseText);
      
      if (response.ok) {
        res.status(200).json({
          status: "success",
          data: jsonResponse
        });
      } else {
        res.status(response.status).json({
          status: "error",
          message: jsonResponse.error || "Erro na API PushAlert",
          details: jsonResponse
        });
      }
    } catch (e) {
      res.status(500).json({
        status: "error",
        message: "Resposta inválida da API",
        rawResponse: responseText
      });
    }

  } catch (err) {
    console.error("Erro na requisição:", err);
    res.status(500).json({
      status: "error",
      message: "Falha ao conectar com o serviço de notificações",
      error: err.message
    });
  }
}