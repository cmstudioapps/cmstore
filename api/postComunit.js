export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Configuração para GET - Listar publicações
  if (req.method === 'GET') {
    try {
      const response = await fetch("https://jogos-a1a46-default-rtdb.firebaseio.com/cm/.json");
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Erro ao buscar publicações");
      }

      // Converter o objeto de publicações em array ordenado por timestamp
      const publicacoes = data ? Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];

      return res.status(200).json(publicacoes);

    } catch (error) {
      return res.status(500).json({ erro: "Erro ao carregar publicações: " + error.message });
    }
  }

  // Configuração para POST - Criar publicação
  if (req.method === 'POST') {
    const dados = req.body;

    // Validações básicas
    if (!dados || !dados.texto) {
      return res.status(400).json({ message: "Texto da publicação é obrigatório" });
    }

    if (dados.texto.length < 100) {
      return res.status(400).json({ message: "A publicação precisa ter pelo menos 100 caracteres" });
    }

    try {
      // Adiciona timestamp à publicação
      dados.timestamp = new Date().toISOString();

      // Salva no Realtime Database
      const saveResponse = await fetch("https://jogos-a1a46-default-rtdb.firebaseio.com/cm/.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      if (!saveResponse.ok) {
        throw new Error("Erro ao salvar publicação");
      }

      // Se tiver texto, envia notificação (não precisa mais de imagem)
      if (dados.texto) {
        const textoLimitado = dados.texto.length > 100 
          ? dados.texto.substring(0, 100) + "..." 
          : dados.texto;

        await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic os_v2_app_bbokkq4cnjhqjgbuwznbkiownitgq65d3bxeype2owlhizj2mpssgw55rwb3dhgvlw3fal47ozqpvbpbo46xfegudi2btyl4yctrowa"
          },
          body: JSON.stringify({
            app_id: "085ca543-826a-4f04-9834-b65a1521d66a",
            included_segments: ["All"],
            headings: { pt: "Nova publicação na CM STORE", en: "New post in CM STORE" },
            contents: { pt: textoLimitado, en: textoLimitado },
            url: "https://cm-store.vercel.app/"
          })
        });
      }

      return res.status(200).json({ success: true, message: "Publicação criada com sucesso!" });

    } catch (error) {
      return res.status(500).json({ success: false, erro: "Erro no servidor: " + error.message });
    }
  }

  // Se o método não for GET nem POST
  return res.status(405).json({ message: "Método não permitido" });
}