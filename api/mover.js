export default function handler(req, res) {
  const url = "https://palavras-22e2c-default-rtdb.firebaseio.com/";
  const { sala, ver, ...valores } = req.query; // Captura todos os parâmetros

  if (!sala) {
    return res.status(400).json({ error: "O parâmetro 'sala' é obrigatório." });
  }

  if (ver === "true") {
    // Lógica para recuperar dados do Firebase
    fetch(url + sala + "/.json")
      .then(response => response.json())
      .then(data => {
        let responseData = {};

        // Verifica se o usuário especificou quais valores deseja recuperar
        if (valores.valores) {
          const keys = valores.valores.split(","); // Exemplo: valores=x1,y2
          keys.forEach(key => {
            if (data[key] !== undefined) {
              responseData[key] = data[key];
            }
          });
        } else {
          // Caso não especifique, retorna todos os valores
          responseData = data;
        }

        res.status(200).json(responseData);
      })
      .catch(error => {
        res.status(500).json({ error: "Erro ao recuperar os dados.", detalhes: error.message });
      });
  } else if (ver === "false") {
    // Lógica para enviar dados ao Firebase
    fetch(url + sala + "/.json", {
      method: "PATCH", // Substitui os dados existentes no nó
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(valores), // Envia os dados recebidos na requisição
    })
      .then(response => response.json())
      .then(data => {
        res.status(200).json({ message: "Dados enviados com sucesso!", response: data });
      })
      .catch(error => {
        res.status(500).json({ error: "Erro ao enviar os dados.", detalhes: error.message });
      });
  } else {
    res.status(400).json({ error: "O parâmetro 'ver' deve ser 'true' ou 'false'." });
  }
}