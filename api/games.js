export default function handler (req, res) {

const url = ""
const { games } = req.query 

if(games === "true") {

fetch(url+"jogos/.json").then(response => response.json()).then(data => {

res.status(200).send(data)

})

}



}