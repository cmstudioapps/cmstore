/*Tratando requisição get como se fosse um envio de dados*/


export default function handler(req, res) {

const {acao, valor} = req.query
const userAgent = req.headers['user-agent'];
if(acao === "salvar") {

res.status(200).send(`Oie ${valor} Beleza?`)

} else {
 
res.status(400).json({erro: "Não conseguimos identificar"})

}

}