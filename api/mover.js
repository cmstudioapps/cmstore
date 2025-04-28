export default function handler (req, res) {

const url = "https://palavras-22e2c-default-rtdb.firebaseio.com/"

const { x1, y1, x2, y2, sala, ver} = req.query 

if(ver === "true") {
fetch(url+sala+"/.json")
.then(response => response.json())
.then(data => {

const X1 = data.x1
const X2 = data.x2
const Y1 = data.y1
const Y2 = data.y2


})
}

}