export default function handler (req, res) {

res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET');

const origin = req.headers.origin || req.headers.referer || "";

if (!origin.includes("cm-store.vercel.app")) {
  return res.status(403).send("Acesso negado");
}

const url = "https://jogos-a1a46-default-rtdb.firebaseio.com/"
const { games } = req.query 

if(games === "true") {

fetch(url+"jogos/.json").then(response => response.json()).then(data => {

res.status(200).send(data)

})

}



}