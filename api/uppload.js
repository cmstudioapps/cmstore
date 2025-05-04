export default async function handler(req, res) {
    // Permite CORS apenas para o domínio especificado
res.setHeader('Access-Control-Allow-Origin', 'https://cm-store.vercel.app');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Credentials', 'true'); // Opcional, se usar cookies/auth

  // Chaves e URLs
  const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "0863e0eee12396e6097628c10fdc5228";
  const FIREBASE_URL = process.env.FIREBASE_URL || "https://jogos-a1a46-default-rtdb.firebaseio.com";

  // Pré-flight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Aceita apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { gameData, images, packageId } = req.body;

    // Validação dos dados
    if (!packageId || !gameData || !gameData.nome || !gameData.idUser) {
      return res.status(400).json({ error: 'Dados incompletos. Package ID e dados do jogo são obrigatórios.' });
    }

    // Valida link Mediafire
    if (gameData.link && !gameData.link.includes('mediafire.com')) {
      return res.status(400).json({ error: 'Apenas links do MediaFire são aceitos para download' });
    }

    // Converte link do YouTube para embed se existir
    if (gameData.video && gameData.video.includes('youtube.com')) {
      gameData.video = gameData.video
        .replace('watch?v=', 'embed/')
        .replace('youtu.be/', 'youtube.com/embed/');
    }

    // Upload das imagens para o ImgBB
    let uploadedIcon = null;
    let uploadedPrints = [];
    
    if (images && images.length > 0) {
      // Primeira imagem é sempre o ícone
      if (images[0]) {
        const iconFormData = new FormData();
        iconFormData.append('image', images[0].split(',')[1]);

        const iconResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: iconFormData
        });

        const iconData = await iconResponse.json();
        if (iconData.success) {
          uploadedIcon = iconData.data.url;
        }
      }

      // As demais imagens são screenshots (prints)
      for (let i = 1; i < images.length; i++) {
        const image = images[i];
        const formData = new FormData();
        formData.append('image', image.split(',')[1]);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        });

        const imgbbData = await imgbbResponse.json();
        if (imgbbData.success) {
          uploadedPrints.push(imgbbData.data.url);
        }
      }
    }

    // Prepara dados para o Firebase
    const gameToSave = {
      ...gameData,
      icone: uploadedIcon,  // Ícone vai para a chave específica
      prints: uploadedPrints, // Screenshots vão para a chave prints
      dataEnvio: new Date().toISOString(),
      dev: gameData.dev || 'Desenvolvedor não especificado'
    };

    // Envia para o Firebase usando o packageId como chave
    const firebaseResponse = await fetch(`${FIREBASE_URL}/jogos/${packageId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameToSave)
    });

    const firebaseData = await firebaseResponse.json();

    if (!firebaseResponse.ok) {
      throw new Error('Erro ao salvar no banco de dados');
    }

    // Retorna sucesso
    res.status(200).json({ 
      success: true, 
      gameId: packageId
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      details: error.message 
    });
  }
}