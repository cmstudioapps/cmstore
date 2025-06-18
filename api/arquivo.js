export default function handler(req,res) {

    // Permite CORS apenas para o domínio especificado
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');


  
  const banco = "https://meu-diario-79efa-default-rtdb.firebaseio.com/arquivos/";

  // Pré-flight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

const { acao, nomeJogo, nomeArquivo, valor } = req.query 

if(!acao || !nomeJogo || !nomeArquivo || !valor) {

res.status(200).send("Erro: falta informações")

}

}