export default function handler (req, res) {

const { data } = req.query 

const data = new Date()
const dia = data.getDate()
const mes = data.getMonth()
const ano = data.getFullYear()


if(data === "dia") {

res.status(200).send(dia)


}
if(data === "mes") {

res.status(200).send(mes)


}
if(data === "ano") {

res.status(200).send(ano)


}


}