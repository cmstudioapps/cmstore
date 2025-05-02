// Se estiver em Node.js puro (não Next.js), descomente:
// const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Configurações
  const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
  const WORLD_TIME_API_URL = `http://worldtimeapi.org/api/timezone/${DEFAULT_TIMEZONE}`;
  const TIMEOUT_MS = 3000; // 3 segundos para timeout

  try {
    // --- Passo 1: Tentar WorldTimeAPI (fonte confiável) ---
    let dados;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const resposta = await fetch(WORLD_TIME_API_URL, {
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (!resposta.ok) {
        throw new Error(`WorldTimeAPI retornou erro: ${resposta.status}`);
      }

      dados = await resposta.json();

      // Validação adicional: horário não pode ser futuro
      const horarioAPI = new Date(dados.datetime);
      const horarioServidor = new Date();
      
      if (horarioAPI > new Date(horarioServidor.getTime() + 60000)) { // +1 minuto de tolerância
        throw new Error("Horário da API é inválido (futuro)");
      }
    } catch (erroApi) {
      console.warn('Falha na WorldTimeAPI, usando fallback:', erroApi.message);
      
      // --- Passo 2: Fallback para horário do servidor (não do usuário!) ---
      const agora = new Date();
      dados = {
        datetime: agora.toISOString(),
        day: agora.getDate(),
        month: agora.getMonth() + 1,
        year: agora.getFullYear(),
        hour: agora.getHours(),
        minute: agora.getMinutes(),
        seconds: agora.getSeconds(),
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][agora.getDay()],
      };
    }

    // --- Formatação dos dados ---
    const tudo = {
      dia: String(dados.day).padStart(2, '0'),
      mes: String(dados.month).padStart(2, '0'),
      ano: dados.year,
      hora: String(dados.hour).padStart(2, '0'),
      minuto: String(dados.minute).padStart(2, '0'),
      segundo: String(dados.seconds ?? dados.second).padStart(2, '0'), // Compatibilidade
      dia_da_semana: dados.dayOfWeek ? 
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dados.dayOfWeek) : 
        0,
    };

    // --- Passo 3: Filtrar dados se necessário (ex: ?dados=hora,minuto) ---
    if (req.query.dados) {
      const camposRequisitados = req.query.dados.split(',').map(campo => campo.trim());
      const resultadoFiltrado = camposRequisitados
        .filter(campo => tudo[campo] !== undefined)
        .map(campo => tudo[campo]);

      if (resultadoFiltrado.length === 0) {
        return res.status(400).json({ erro: "Nenhum campo válido foi solicitado." });
      }

      return res.status(200).send(resultadoFiltrado.join(' '));
    }

    // --- Passo 4: Retornar todos os dados ---
    return res.status(200).json(tudo);

  } catch (erro) {
    console.error('Erro crítico na API de horário:', erro);
    return res.status(500).json({
      erro: "Falha ao obter horário",
      detalhes: erro.message,
      sugestao: "Verifique se o servidor está online ou tente novamente mais tarde.",
    });
  }
}