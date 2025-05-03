export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const firebaseUrl = "https://jogos-a1a46-default-rtdb.firebaseio.com/jogos";
  const { games, gameId } = req.query;

  if (games === "true") {
    fetch(`${firebaseUrl}/.json`)
      .then(response => {
        if (!response.ok) throw new Error("Erro ao buscar jogos");
        return response.json();
      })
      .then(data => {
        // Converte objeto do Firebase em array
        const gamesArray = data ? Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) : [];
        res.status(200).json(gamesArray);
      })
      .catch(error => {
        console.error("Erro Firebase:", error);
        res.status(500).json({ error: error.message });
      });
  } 
  else if (gameId) {
    fetch(`${firebaseUrl}/${gameId}/.json`)
      .then(response => {
        if (!response.ok) throw new Error("Erro ao buscar jogo");
        return response.json();
      })
      .then(data => {
        if (!data) {
          return res.status(404).json({ error: "Jogo não encontrado" });
        }
        res.status(200).json({ ...data, id: gameId });
      })
      .catch(error => {
        console.error("Erro Firebase:", error);
        res.status(500).json({ error: error.message });
      });
  }
  else {
    res.status(400).json({ error: "Parâmetro inválido. Use ?games=true ou ?gameId=ID" });
  }
}