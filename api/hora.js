export default function handler (req, res) {

const data = new Date()

res.status(200).send(data)
}