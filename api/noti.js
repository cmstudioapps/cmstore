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
    const response = await fetch("https://pushalert.co/rest/v1/send", {
      method: "POST",
      headers: {
        "Authorization": "60a78f90a87cca4b9908cde4ff1e323d", // 👈 SUA CHAVE AQUI (substitua depois!)
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notificationData)
    });

    // 2. Verifica se a resposta é JSON ou texto
    const responseText = await response.text();
    
    try {
      // Tenta parsear como JSON
      const jsonResponse = JSON.parse(responseText);
      
      // 3. Retorna sucesso ou erro da API
      if (jsonResponse.success) {
        res.status(200).json({
          status: "success",
          data: jsonResponse
        });
      } else {
        res.status(400).json({
          status: "error",
          message: jsonResponse.message || "Erro desconhecido na API",
          details: jsonResponse
        });
      }
      
    } catch (e) {
      // Se não for JSON, retorna o texto cru (para debug)
      console.error("Resposta não-JSON:", responseText);
      res.status(500).json({
        status: "error",
        message: "Resposta inválida da API",
        rawResponse: responseText
      });
    }

  } catch (err) {
    // 4. Tratamento de erros de rede/requisição
    console.error("Erro na requisição:", err);
    res.status(500).json({
      status: "error",
      message: "Falha ao conectar com o serviço de notificações",
      error: err.message
    });
  }
}