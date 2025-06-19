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

            if (acao === "ler" && !valor) {
                fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}.json`)
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
                // Pega a hora da última modificação
                fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}/ultimaModificacao.json`)
                    .then(response => response.json())
                    .then(ultimaMod => {
                        const agora = new Date().getTime();
                        
                        // Se tentou modificar muito rápido
                        if (ultimaMod && (agora - ultimaMod) < 10000) {
                            // Bloqueia por 30 segundos
                            const blockContent = {
                                block: true,
                                tempo: agora + 30000
                            };
                            
                            fetch(`${banco}/${jogoURL}/block.json`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(blockContent)
                            });
                            
                            return res.status(200).send("Erro: espere 10 segundos entre modificações. Jogo bloqueado por 30 segundos");
                        }

                        // Se é um arquivo novo, verifica se não criou outro recentemente
                        fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}.json`)
                            .then(response => response.json())
                            .then(dataArquivo => {
                                if (!dataArquivo) {
                                    fetch(`${banco}/${jogoURL}/${id}/ultimoArquivo.json`)
                                        .then(response => response.json())
                                        .then(ultimoArquivo => {
                                            if (ultimoArquivo && (agora - ultimoArquivo) < 20000) {
                                                // Bloqueia por 1 minuto
                                                const blockContent = {
                                                    block: true,
                                                    tempo: agora + 60000
                                                };
                                                
                                                fetch(`${banco}/${jogoURL}/block.json`, {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify(blockContent)
                                                });
                                                
                                                return res.status(200).send("Erro: espere 20 segundos para criar novo arquivo. Jogo bloqueado por 1 minuto");
                                            }
                                            
                                            // Se passou todas as verificações, salva
                                            salvarDados();
                                        });
                                } else {
                                    // Se arquivo já existe, só salva
                                    salvarDados();
                                }
                            });
                    });
            }
        });

    function salvarDados() {
        const content = {
            valor: valor,
            ultimaModificacao: new Date().getTime()
        };

        fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(content)
        })
        .then(() => {
            // Marca que criou um arquivo novo agora
            fetch(`${banco}/${jogoURL}/${id}/ultimoArquivo.json`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(new Date().getTime())
            });
            
            res.status(200).send("Salvo com sucesso");
        })
        .catch(error => res.status(200).send("Erro ao salvar: " + error.message));
    }
}