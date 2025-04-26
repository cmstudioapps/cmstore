export default function handler (req, res) {

const {sala,id} = req.query 
const url = "https://palavras-22e2c-default-rtdb.firebaseio.com/"
let p;
fetch (url+sala+"/.json")
.then(response => response.json())
.then(data => {
if(id === "s") {
p = true
} else {
p = false
}

 let msg = data.msg.toString()
 let nome = data.nome.toString()


 res.status(200).send(`${nome}:${p}: ${msg}`)

}).catch (error => {
 res.status(400).send("ouve um erro ao tentar ler")
})

}