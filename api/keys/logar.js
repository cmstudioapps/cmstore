export default function handler(req, res) {

const url = "https://jogos-a1a46-default-rtdb.firebaseio.com/"

const { id, senha } = req.query 
if(id && senha) {
fetch(url+id+"/.json")
.then(response => response.json())
.then(data => {

  if(data) {




   } else {

 res.status(404).send("informações não encontradas.")


  }

}).catch(erro => {
res.status(500).send("Erro ao acessar o banco de dados.")
})
} else {

res.status(200).send("Senha e id obrigatórios!.")
}

}