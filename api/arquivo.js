export default function handler(req, res) {
    // Configurações de CORS (mantidas iguais)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const banco = "https://meu-diario-79efa-default-rtdb.firebaseio.com/arquivos";

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { acao, nomeJogo, id, nomeArquivo, valor } = req.query;

    const jogoURL = encodeURIComponent(nomeJogo);
    const arquivoURL = encodeURIComponent(nomeArquivo);

    if (!acao || !nomeJogo || !nomeArquivo || !id) {
        return res.status(200).send("Erro: falta informações");
    }

    // Verifica se o jogo está bloqueado
    fetch(`${banco}/${jogoURL}/block.json`)
        .then(response => response.json())
        .then(blockData => {
            if (blockData && blockData.block === true) {
                const agora = new Date().getTime();
                if (agora < blockData.tempo) {
                    return res.status(200).send("Erro: jogo bloqueado por " + Math.round((blockData.tempo - agora)/1000) + " segundos");
                }
            }

            if (acao === "ler") {
                fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}.json`)
                    .then(response => response.json())
                    .then(data => {
                        res.status(200).send(data?.valor || "Erro: nada encontrado");
                    })
                    .catch(error => res.status(200).send("Erro ao ler: " + error.message));
            } 
            else if (acao === "salvar") {
                if (!valor) return res.status(200).send("Erro: valor vazio");
                
                // Verificação do intervalo de 3 segundos
                fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}/ultimaModificacao.json`)
                    .then(response => response.json())
                    .then(ultimaMod => {
                        const agora = new Date().getTime();
                        
                        // Bloqueia se tentar modificar em menos de 3 segundos
                        if (ultimaMod && (agora - ultimaMod) < 3000) {
                            const blockContent = {
                                block: true,
                                tempo: agora + 10000 // Bloqueia por 10 segundos
                            };
                            
                            fetch(`${banco}/${jogoURL}/block.json`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(blockContent)
                            });
                            
                            return res.status(200).send("Erro: espere 3 segundos entre modificações. Jogo bloqueado por 10 segundos");
                        }

                        // Se passou a verificação, salva os dados
                        const content = {
                            valor: valor,
                            ultimaModificacao: agora
                        };

                        fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}.json`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(content)
                        })
                        .then(() => res.status(200).send("Salvo com sucesso"))
                        .catch(error => res.status(200).send("Erro ao salvar: " + error.message));
                    });
            }
        });
}