export default function handler (req, res) {

const {sala} = req.query 

fetch (url+sala+"/.json")
.then(data => response.js))
.then(data => {

 let msg = data.msg
 let nome = data.nome

 res.status(200).send(`${nome}: nome `)

}).catch (error => ({
 res.status(400).send("ouve um erro ao tentar ler")
})

}