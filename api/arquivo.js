export default function handler(req, res) {
    // Permite CORS apenas para o domínio especificado
    res.setHeader('Access-Control-Allow-Origin', '*'); // Substitua '*' por um domínio específico.
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const banco = "https://meu-diario-79efa-default-rtdb.firebaseio.com/arquivos";

    // Pré-flight CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { acao, nomeJogo, nomeArquivo, valor } = req.query;

const jogoURL = encodeURIComponent(nomeJogo);
const arquivoURL = encodeURIComponent(nomeArquivo);

    if (!acao || !nomeJogo || !nomeArquivo) {
        return res.status(200).send("Erro: falta informações");
    }

    if (acao === "ler" && !valor) {
        fetch(`${banco}/${jogoURL}/${arquivoURL}.json`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    res.status(200).send(data.valor);
                } else {
                    res.status(200).send("Erro: nada encontrado");
                }
            })
            .catch(error => res.status(200).send("Erro ao ler dados: " + error.message));
    }

    if (acao === "salvar") {
   const content = {valor}
   
        fetch(`${banco}/${jogoURL}/${arquivoURL}.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(content)
        })
            .then(response => response.json())
            .then(data => {
                res.status(200).send("Salvo com sucesso");
            })
            .catch(error => res.status(200).send("Erro ao salvar: " + error.message));
    }
}