export default async function handler(req, res) {
   // Configurações de CORS seguras

  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', '*');
res.setHeader('Access-Control-Allow-Headers', '*');

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
    const { gameData, images } = req.body;

    // Validação dos dados
    if (!gameData || !gameData.nome || !gameData.idUser) {
      return res.status(400).json({ error: 'Dados do jogo incompletos' });
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
    let uploadedImages = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const formData = new FormData();
        formData.append('image', image.split(',')[1]);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        });

        const imgbbData = await imgbbResponse.json();
        if (imgbbData.success) {
          uploadedImages.push(imgbbData.data.url);
        }
      }
    }

    // Prepara dados para o Firebase
    const gameToSave = {
      ...gameData,
      prints: uploadedImages,
      dataEnvio: new Date().toISOString(),
      dev: gameData.dev || 'Desenvolvedor não especificado'
    };

    // Envia para o Firebase
    const firebaseResponse = await fetch(`${FIREBASE_URL}/jogos.json`, {
      method: 'POST',
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
      gameId: firebaseData.name
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      details: error.message 
    });
  }
}