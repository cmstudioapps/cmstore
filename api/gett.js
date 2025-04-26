/*Tratando requisição get como se fosse um envio de dados*/


export default function handler(req, res) {

const {acao, valor} = req.query

if(acao === "salvar") {

res.status(200).json({

mensagem: `Olá ${valor}! Tudo bem?`

})

} else {
 
res.status(400).json({erro: "Não conseguimos identificar"})

}

}