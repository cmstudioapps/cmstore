export default function handler (req, res) {

const {sala} = req.query 
const url = "https://palavras-22e2c-default-rtdb.firebaseio.com/"
fetch (url+sala+"/.json")
.then(response => response.json())
.then(data => {

 let msg = data.msg.toString()
 let nome = data.nome.toString()

 res.status(200).send(`${nome}: ${msg}`)

}).catch (error => {
 res.status(400).send("ouve um erro ao tentar ler")
})

}