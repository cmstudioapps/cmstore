export default function handler (req, res) {

const { dataTime } = req.query 

const data = new Date()
const dia = data.getDate()
const mes = data.getMonth()
const ano = data.getFullYear()


if(dataTime === "dia") {

res.status(200).send(dia)


}
if(dataTime === "mes") {

res.status(200).send(mes)


}
if(dataTime === "ano") {

res.status(200).send(ano)


}

if(!dataTime && !dataTime.includes("dia","mes","ano") {

res.status(200).send("sem resposta")

}


}