// api/teste-notificacao.js
export default function handler(req, res) {
  // Mensagens pré-definidas em português
  const MENSAGENS = {
    sucesso: "Notificação simulada enviada com sucesso!",
    erro_metodo: "Este endpoint só aceita requisições GET",
    parametros_invalidos: "Parâmetros inválidos na URL",
    exemplos: {
      titulo: "Promoção de Verão",
      mensagem: "Descontos de até 50% em itens selecionados!",
      url: "https://exemplo.com/promocao"
    }
  };

  // 1. Verifica o método HTTP (aceita apenas GET)
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: "erro",
      mensagem: MENSAGENS.erro_metodo,
      metodo_aceito: "GET"
    });
  }

  // 2. Simula parâmetros de query
  const { teste, titulo, mensagem, url } = req.query;

  // 3. Modo de teste simples
  if (teste === "sim") {
    return res.status(200).json({
      status: "sucesso",
      mensagem: MENSAGENS.sucesso,
      dados_simulados: {
        titulo: titulo || MENSAGENS.exemplos.titulo,
        mensagem: mensagem || MENSAGENS.exemplos.mensagem,
        url: url || MENSAGENS.exemplos.url,
        segmento: 0,
        imagem: "",
        timestamp: new Date().toISOString()
      },
      observacao: "Esta é uma simulação - nenhuma notificação real foi enviada"
    });
  }

  // 4. Exemplo de erro
  if (teste === "erro") {
    return res.status(400).json({
      status: "erro",
      mensagem: "Erro simulado - Campos obrigatórios faltando",
      detalhes: {
        erro_simulado: true,
        campos_obrigatorios: ["titulo", "mensagem", "url"],
        parametros_recebidos: req.query
      }
    });
  }

  // 5. Rota de ajuda/documentação
  return res.status(200).json({
    status: "info",
    mensagem: "Endpoint de teste para notificações PushAlert",
    como_usar: {
      metodo: "GET",
      parametros: {
        teste: "sim (para sucesso) ou erro (para simular erro)",
        titulo: "Opcional - Título da notificação",
        mensagem: "Opcional - Corpo da mensagem",
        url: "Opcional - URL de destino"
      },
      exemplos: {
        sucesso: "/api/teste-notificacao?teste=sim&titulo=Promoção&mensagem=Confira&url=https...",
        erro: "/api/teste-notificacao?teste=erro"
      },
      mensagens_predefinidas: MENSAGENS.exemplos
    }
  });
}