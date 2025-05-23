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
    // 1. Faz a requisição para a API do PushAlert
    const response = await fetch("https://pushalert.co/api/v1/send", { // 👈 Note a mudança no endpoint
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PUSHALERT_API_KEY || '60a78f90a87cca4b9908cde4ff1e323d'}`, // Formato corrigido
        "Content-Type": "application/json",
        "Accept": "application/json" // Forçamos resposta JSON
      },
      body: JSON.stringify(notificationData)
    });

    // 2. Verifica o tipo de conteúdo da resposta
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const jsonResponse = await response.json();
      
      if (response.ok) {
        res.status(200).json({
          status: "success",
          data: jsonResponse
        });
      } else {
        res.status(response.status).json({
          status: "error",
          message: jsonResponse.message || "Erro na API PushAlert",
          details: jsonResponse
        });
      }
    } else {
      const textResponse = await response.text();
      console.error("Resposta inesperada:", textResponse);
      
      res.status(500).json({
        status: "error",
        message: "Formato de resposta inesperado da API",
        rawResponse: textResponse
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