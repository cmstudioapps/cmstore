export default function handler (req, res) {

const url = ""
const { games } = req.query 

if(games === "true") {

fetch(url+"jogos/.json")

}



}