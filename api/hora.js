export default async function handler(req, res) {
  try {
    // Configura o fuso horário padrão (Brasília) se não for especificado
    const timeZone = req.query.timezone || 'America/Sao_Paulo';
    const timeApiUrl = `https://timeapi.io/api/Time/current/zone?timeZone=${encodeURIComponent(timeZone)}`;

    // Faz a requisição à TimeAPI
    const resposta = await fetch(timeApiUrl, {
      headers: { 'Accept': 'application/json' }, // Garante que a resposta seja JSON
    });

    if (!resposta.ok) {
      throw new Error(`TimeAPI retornou erro: ${resposta.status} - ${resposta.statusText}`);
    }

    const dados = await resposta.json();

    // Formata os dados para o padrão esperado
    const tudo = {
      "dia": String(dados.day).padStart(2, '0'),       // Ex: "03" (dia)
      "mes": String(dados.month).padStart(2, '0'),     // Ex: "05" (mês)
      "ano": dados.year,                               // Ex: 2025
      "hora": String(dados.hour).padStart(2, '0'),     // Ex: "15" (hora)
      "minuto": String(dados.minute).padStart(2, '0'), // Ex: "30" (minuto)
      "segundo": String(dados.seconds).padStart(2, '0'), // Ex: "22" (segundo)
      "dia_da_semana": getDiaDaSemanaNumerico(dados.dayOfWeek) // 0 (Domingo) a 6 (Sábado)
    };

    // Se o usuário pedir dados específicos (ex: ?dados=hora,minuto)
    if (req.query.dados) {
      const camposRequisitados = req.query.dados.split(',').map(campo => campo.trim());
      const resultadoFiltrado = camposRequisitados
        .filter(campo => tudo[campo] !== undefined)
        .map(campo => tudo[campo]);

      if (resultadoFiltrado.length === 0) {
        return res.status(400).json({ erro: "Campos inválidos solicitados." });
      }

      // Retorna os valores separados por espaço (ex: "15 30")
      return res.status(200).send(resultadoFiltrado.join(' '));
    }

    // Retorna todos os dados se nenhum filtro for aplicado
    return res.status(200).json(tudo);

  } catch (erro) {
    console.error('Erro na API de horário:', erro);
    return res.status(500).json({ 
      erro: "Falha ao obter horário",
      detalhes: erro.message 
    });
  }
}

// Helper: Converte dia da semana (string) para número (0-6)
function getDiaDaSemanaNumerico(diaSemanaString) {
  const dias = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dias.indexOf(diaSemanaString); // Retorna 0 (Domingo) a 6 (Sábado)
}