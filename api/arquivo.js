export default function handler(req,res) {

    // Permite CORS apenas para o domínio especificado
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');


  
  const banco = "https://jogos-a1a46-default-rtdb.firebaseio.com/Arquivos/";

  // Pré-flight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }


}