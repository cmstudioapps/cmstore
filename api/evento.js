// api/eventos.js - Endpoint dedicado para gerenciamento de eventos
export default function handler(req, res) {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Verificação de segurança
    const origem = req.headers.origin || req.headers.referer || "";
    const userAgent = req.headers["user-agent"] || "";

    if (!userAgent.includes("Catrobatbot") && !origem.includes("https://cm-store.vercel.app")) {
        return res.status(403).send("Acesso não autorizado");
    }

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { acao, nomeJogo, nomeEvento, minutos } = req.query;

    // Validação básica
    if (!nomeJogo || !nomeEvento) {
        return res.status(400).send("Parâmetros obrigatórios faltando: nomeJogo e nomeEvento");
    }

    const urlEvento = `https://meu-diario-79efa-default-rtdb.firebaseio.com/${nomeJogo}/eventos/${nomeEvento}.json`;
    const urlTodosEventos = `https://meu-diario-79efa-default-rtdb.firebaseio.com/${nomeJogo}/eventos.json`;

    switch (req.method) {
        case 'POST':
            return criarEvento(req, res, urlEvento, urlTodosEventos);
        case 'GET':
            return consultarEvento(req, res, urlEvento);
        default:
            return res.status(405).send("Método não permitido");
    }
}

// Função para criar um novo evento
async function criarEvento(req, res, urlEvento, urlTodosEventos) {
    const { minutos } = req.query;

    if (!minutos || isNaN(minutos)) {
        return res.status(400).send("Parâmetro 'minutos' inválido ou faltando");
    }

    try {
        // Verificar limite de eventos
        const respostaEventos = await fetch(urlTodosEventos);
        const eventos = await respostaEventos.json();
        const totalEventos = eventos ? Object.keys(eventos).length : 0;

        if (totalEventos >= 5) {
            const todosFinalizados = eventos ? Object.values(eventos).every(e => e.status === "off") : true;
            
            if (!todosFinalizados) {
                return res.status(429).send("Limite de eventos atingido (5). Finalize os eventos ativos antes de criar novos.");
            }
            
            // Limpa eventos antigos se todos estiverem finalizados
            await fetch(urlTodosEventos, { method: 'DELETE' });
        }

        // Cria o novo evento
        const agora = Date.now();
        const duracaoMs = parseInt(minutos) * 60 * 1000;

        const dadosEvento = {
            criadoEm: agora,
            minutos: parseInt(minutos),
            fim: agora + duracaoMs,
            status: "on",
            atualizadoEm: agora
        };

        const resposta = await fetch(urlEvento, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosEvento)
        });

        if (!resposta.ok) throw new Error("Falha ao criar evento");

        return res.status(201).json({
            success: true,
            message: `Evento '${req.query.nomeEvento}' criado com sucesso`,
            data: dadosEvento
        });

    } catch (erro) {
        console.error("Erro ao criar evento:", erro);
        return res.status(500).json({
            success: false,
            message: "Erro interno ao processar a criação do evento"
        });
    }
}

// Função para consultar um evento
async function consultarEvento(req, res, urlEvento) {
    try {
        // Verificar intervalo entre consultas (2 horas)
        const ultimaConsulta = req.cookies?.ultimaConsultaEvento || 0;
        const agora = Date.now();
        const intervaloMinimo = 2 * 60 * 60 * 1000; // 2 horas em milissegundos

        if (agora - ultimaConsulta < intervaloMinimo) {
            const tempoRestante = Math.ceil((intervaloMinimo - (agora - ultimaConsulta)) / 60000);
            return res.status(429).json({
                success: false,
                message: `Aguarde ${tempoRestante} minutos para consultar novamente`
            });
        }

        // Consultar o evento no Firebase
        const resposta = await fetch(urlEvento);
        const dadosEvento = await resposta.json();

        if (!dadosEvento) {
            return res.status(404).json({
                success: false,
                message: "Evento não encontrado"
            });
        }

        // Atualizar status se necessário
        const statusAtual = agora >= dadosEvento.fim ? "off" : "on";
        let statusModificado = false;

        if (dadosEvento.status !== statusAtual) {
            await fetch(`${urlEvento}/status.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(statusAtual)
            });
            statusModificado = true;
        }

        // Atualizar cookie da última consulta
        res.setHeader('Set-Cookie', `ultimaConsultaEvento=${agora}; Max-Age=${intervaloMinimo/1000}; Path=/`);

        return res.status(200).json({
            success: true,
            data: {
                ...dadosEvento,
                status: statusAtual,
                statusModificado
            }
        });

    } catch (erro) {
        console.error("Erro ao consultar evento:", erro);
        return res.status(500).json({
            success: false,
            message: "Erro interno ao consultar o evento"
        });
    }
}