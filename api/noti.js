export default async function handler(req, res) {
  // Mensagens pré-definidas
  const MESSAGES = {
    method_not_allowed: "Este endpoint só aceita requisições POST",
    missing_fields: "Campos obrigatórios faltando",
    invalid_url: "URL fornecida é inválida",
    api_error: "Erro ao enviar notificação",
    success: "Notificação enviada com sucesso",
    server_error: "Erro interno no servidor"
  };

  // 1. Verifica o método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: "error",
      message: MESSAGES.method_not_allowed
    });
  }

  try {
    // 2. Dados pré-definidos com fallback para valores padrão
    const notificationData = {
      title: req.body.title || "Novo Aviso Importante",
      message: req.body.message || "Temos uma atualização importante para você!",
      url: req.body.url || "https://cm-store.vercel.app",
      image: req.body.image || "",
      segment: req.body.segment || 0
    };

    // 3. Validação básica da URL
    try {
      new URL(notificationData.url);
    } catch (e) {
      return res.status(400).json({
        status: "error",
        message: MESSAGES.invalid_url,
        details: {
          url_provided: notificationData.url
        }
      });
    }

    // 4. Envio para a API PushAlert
    const response = await fetch("https://api.pushalert.co/rest/v1/send", {
      method: "POST",
      headers: {
        "Authorization": `api_key=${process.env.PUSHALERT_API_KEY || '60a78f90a87cca4b9908cde4ff1e323d'}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notificationData)
    });

    const responseData = await response.json();

    // 5. Tratamento da resposta
    if (!response.ok) {
      return res.status(response.status).json({
        status: "error",
        message: MESSAGES.api_error,
        details: {
          api_response: responseData,
          sent_data: notificationData
        }
      });
    }

    // 6. Resposta de sucesso
    return res.status(200).json({
      status: "success",
      message: MESSAGES.success,
      data: responseData,
      notification: {
        title: notificationData.title,
        message: notificationData.message,
        url: notificationData.url
      }
    });

  } catch (err) {
    // 7. Tratamento de erros inesperados
    console.error("Erro no servidor:", err);
    return res.status(500).json({
      status: "error",
      message: MESSAGES.server_error,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}