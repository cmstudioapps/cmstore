export default function handler(req, res) {
  // Permite acesso de qualquer site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // URL do banco de dados no Firebase
  const firebaseUrl = "https://jogos-a1a46-default-rtdb.firebaseio.com/jogos";
  
  // Pega os parâmetros da URL
  const { games, gameId, developerId } = req.query;

  // Se pedir todos os jogos
  if (games === "true") {
    fetch(`${firebaseUrl}/.json`)
      .then(resposta => resposta.json())
      .then(dados => {
        // Converte de objeto para array
        const jogosArray = dados ? Object.keys(dados).map(id => ({
          ...dados[id],
          id // Adiciona o ID em cada jogo
        })) : [];
        
        res.status(200).json(jogosArray);
      })
      .catch(erro => {
        console.error("Erro:", erro);
        res.status(500).json({ erro: "Falha ao buscar jogos" });
      });
  } 
  
  // Se pedir um jogo específico
  else if (gameId) {
    fetch(`${firebaseUrl}/${gameId}/.json`)
      .then(resposta => resposta.json())
      .then(jogo => {
        if (!jogo) {
          return res.status(404).json({ erro: "Jogo não existe" });
        }
        res.status(200).json({ ...jogo, id: gameId });
      })
      .catch(erro => {
        console.error("Erro:", erro);
        res.status(500).json({ erro: "Falha ao buscar o jogo" });
      });
  }
  
  // Se pedir jogos de um desenvolvedor
  else if (developerId) {
    fetch(`${firebaseUrl}/.json?orderBy="idUser"&equalTo="${developerId}"`)
      .then(resposta => resposta.json())
      .then(dados => {
        const jogosDev = dados ? Object.keys(dados).map(id => ({
          ...dados[id],
          id
        })) : [];
        
        res.status(200).json(jogosDev);
      })
      .catch(erro => {
        console.error("Erro:", erro);
        res.status(500).json({ erro: "Falha ao buscar jogos do dev" });
      });
  }
  
  // Se não passar parâmetro válido
  else {
    res.status(400).json({ 
      erro: "Use: ?games=true OU ?gameId=ID OU ?developerId=ID" 
    });
  }
}