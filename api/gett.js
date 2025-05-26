export default function handler(req, res) {
  const { id } = req.query;
  const Realtime = "https://jogos-a1a46-default-rtdb.firebaseio.com/cm/.json"; // coloque a URL correta aqui

  fetch(Realtime)
    .then(response => response.json())
    .then(data => {
      const lista = Object.values(data); // transforma em array
      const post = lista.filter(postagem => postagem.id === id);
      res.status(200).send(post);
    })
    .catch(error => {
      console.error(error);
      res.status(400).send("erro");
    });
}