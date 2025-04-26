/*Tratando requisição get como se fosse um envio de dados*/


export default function handler(req, res) {

const {acao, valor} = req.query
const userAgent = req.headers['user-agent'];
if(acao === "salvar") {

res.status(200).json({

mensagem: `Olá ${valor}! Tudo bem? vejo que a requisição veio de ${userAgent}`

})

} else {
 
res.status(400).json({erro: "Não conseguimos identificar"})

}

}