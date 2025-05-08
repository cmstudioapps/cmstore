export default function handler(req, res) {

res.setHeader('Access-Control-Allow-Origin', '*');

const { nome } = req.query 


res.status(200).send("OPA iae "+nome)

}