// api/eventos.js - Endpoint final para gerenciamento de eventos por usuário
export default async function handler(req, res) {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Verificação de segurança
    const origem = req.headers.origin || req.headers.referer || "";
    const userAgent = req.headers["user-agent"] || "";

    if (!userAgent.includes("Catrobatbot") && !origem.includes("https://cm-store.vercel.app")) {
        return res.status(403).json({ 
            success: false,
            message: "Acesso não autorizado" 
        });
    }

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { nomeJogo, id, nomeEvento, minutos } = req.query;

    // Validação básica dos parâmetros
    if (!nomeJogo || !id) {
        return res.status(400).json({
            success: false,
            message: "Parâmetros obrigatórios faltando: nomeJogo e id (do usuário)"
        });
    }

    // URLs do Firebase
    const basePath = `https://meu-diario-79efa-default-rtdb.firebaseio.com/${nomeJogo}/usuarios/${id}/eventos`;
    const urlEvento = `${basePath}/${nomeEvento}.json`;
    const urlTodosEventos = `${basePath}.json`;

    try {
        switch (req.method) {
            case 'POST':
                if (!nomeEvento || !minutos) {
                    return res.status(400).json({
                        success: false,
                        message: "Parâmetros obrigatórios faltando: nomeEvento e minutos"
                    });
                }
                return await criarEvento();
            
            case 'GET':
                if (!nomeEvento) {
                    return res.status(400).json({
                        success: false,
                        message: "Parâmetro obrigatório faltando: nomeEvento"
                    });
                }
                return await consultarEvento();
            
            case 'DELETE':
                if (!nomeEvento) {
                    return res.status(400).json({
                        success: false,
                        message: "Parâmetro obrigatório faltando: nomeEvento"
                    });
                }
                return await removerEvento();
            
            default:
                return res.status(405).json({
                    success: false,
                    message: "Método não permitido"
                });
        }
    } catch (erro) {
        console.error("Erro na API de eventos:", erro);
        return res.status(500).json({
            success: false,
            message: "Erro interno no servidor"
        });
    }

    // Funções auxiliares
    async function criarEvento() {
        const duracao = parseInt(minutos);
        if (isNaN(duracao) {
            return res.status(400).json({
                success: false,
                message: "Parâmetro 'minutos' deve ser um número válido"
            });
        }

        // Verificar limite de eventos (máximo 5 por usuário)
        const eventosResponse = await fetch(urlTodosEventos);
        const eventos = await eventosResponse.json();
        const totalEventos = eventos ? Object.keys(eventos).length : 0;

        if (totalEventos >= 5) {
            const eventosAtivos = eventos ? Object.values(eventos).filter(e => e.status === "on") : [];
            if (eventosAtivos.length > 0) {
                return res.status(429).json({
                    success: false,
                    message: "Limite de 5 eventos atingido. Finalize os eventos ativos antes de criar novos.",
                    eventosAtivos: eventosAtivos.map(e => e.nomeEvento)
                });
            }
            
            // Se todos estiverem inativos, limpa antes de criar
            await fetch(urlTodosEventos, { method: 'DELETE' });
        }

        // Criar novo evento
        const agora = Date.now();
        const dadosEvento = {
            nomeEvento,
            criadoEm: agora,
            minutos: duracao,
            fim: agora + (duracao * 60000),
            status: "on",
            atualizadoEm: agora,
            criadoPor: id
        };

        const resposta = await fetch(urlEvento, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosEvento)
        });

        if (!resposta.ok) throw new Error("Falha ao criar evento no Firebase");

        return res.status(201).json({
            success: true,
            message: `Evento '${nomeEvento}' criado com sucesso para o usuário ${id}`,
            data: dadosEvento
        });
    }

    async function consultarEvento() {
        // Controle de frequência (2 horas entre consultas)
        const ultimaConsulta = req.cookies ? req.cookies[`ultimaConsulta_${id}_${nomeEvento}`] : null;
        const agora = Date.now();
        const intervaloMinimo = 2 * 60 * 60 * 1000; // 2 horas

        if (ultimaConsulta && (agora - parseInt(ultimaConsulta)) < intervaloMinimo) {
            const minutosRestantes = Math.ceil((intervaloMinimo - (agora - parseInt(ultimaConsulta))) / 60000;
            return res.status(429).json({
                success: false,
                message: `Aguarde ${minutosRestantes} minutos para consultar este evento novamente`
            });
        }

        // Consultar evento
        const resposta = await fetch(urlEvento);
        const dadosEvento = await resposta.json();

        if (!dadosEvento) {
            return res.status(404).json({
                success: false,
                message: `Evento '${nomeEvento}' não encontrado para este usuário`
            });
        }

        // Atualizar status se necessário
        const statusAtual = agora >= dadosEvento.fim ? "off" : "on";
        let atualizado = false;

        if (dadosEvento.status !== statusAtual) {
            await fetch(`${urlEvento}/status.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(statusAtual)
            });
            atualizado = true;
        }

        // Atualizar cookie
        res.setHeader('Set-Cookie', 
            `ultimaConsulta_${id}_${nomeEvento}=${agora}; Max-Age=${intervaloMinimo/1000}; Path=/; SameSite=Lax`);

        return res.status(200).json({
            success: true,
            data: {
                ...dadosEvento,
                status: statusAtual,
                statusAtualizado: atualizado,
                tempoRestante: statusAtual === "on" ? dadosEvento.fim - agora : 0
            }
        });
    }

    async function removerEvento() {
        // Verificar se o evento existe
        const respostaConsulta = await fetch(urlEvento);
        const evento = await respostaConsulta.json();

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: `Evento '${nomeEvento}' não encontrado`
            });
        }

        // Remover o evento
        const resposta = await fetch(urlEvento, { method: 'DELETE' });

        if (!resposta.ok) throw new Error("Falha ao remover evento");

        return res.status(200).json({
            success: true,
            message: `Evento '${nomeEvento}' removido com sucesso`,
            data: evento
        });
    }
}