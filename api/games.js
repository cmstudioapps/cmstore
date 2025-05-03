// api/games.js
export default function handler(req, res) {

res.setHeader('Access-Control-Allow-Origin', 'https://cm-store.vercel.app');

  const firebaseUrl = "https://jogos-a1a46-default-rtdb.firebaseio.com/jogos";
  const { games, gameId } = req.query;

  if (games === "true") {
    fetch(`${firebaseUrl}/.json`)
      .then(response => response.json())
      .then(data => res.status(200).json(data))
      .catch(error => res.status(500).json({ error }));
  } 
  else if (gameId) {
    fetch(`${firebaseUrl}/${gameId}/.json`)
      .then(response => response.json())
      .then(data => res.status(200).json(data))
      .catch(error => res.status(500).json({ error }));
  }
  else {
    res.status(400).json({ error: "Parâmetros inválidos" });
  }
}