export default async function handler(req, res) {
  const MENSAGENS = {
    sucesso: "Notificação enviada com sucesso!",
    erro_metodo: "Este endpoint só aceita requisições GET",
    parametros_invalidos: "Parâmetros inválidos na URL",
    exemplos: {
      titulo: "Promoção de Verão",
      mensagem: "Descontos de até 50% em itens selecionados!",
      url: "https://exemplo.com/promocao"
    }
  };

  if (req.method !== 'GET') {
    return res.status(405).json({
      status: "erro",
      mensagem: MENSAGENS.erro_metodo,
      metodo_aceito: "GET"
    });
  }

  const { titulo, mensagem, url } = req.query;

  if (!titulo || !mensagem) {
    return res.status(400).json({
      status: "erro",
      mensagem: MENSAGENS.parametros_invalidos,
      campos_obrigatorios: ["titulo", "mensagem"],
      recebidos: req.query
    });
  }

  try {
    const resposta = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic os_v2_app_sratmhknejadjay5dyvabk4nydupaus6t3ze7yeogi3xutnl6tkhqcmrwxdugfna6gvwcsdox5o4sugnxabty5ufpdeuyc3thx7df3a"
      },
      body: JSON.stringify({
        app_id: "9441361d-4d22-4034-831d-1e2a00ab8dc0",
        included_segments: ["All"],
        headings: { pt: titulo },
        contents: { pt: mensagem },
        url: url || "https://cmstore.com"
      })
    });

    const dados = await resposta.json();

    return res.status(200).json({
      status: "sucesso",
      mensagem: MENSAGENS.sucesso,
      resposta_onesignal: dados
    });
  } catch (erro) {
    return res.status(500).json({
      status: "erro",
      mensagem: "Erro ao enviar notificação",
      detalhes: erro.message
    });
  }
}