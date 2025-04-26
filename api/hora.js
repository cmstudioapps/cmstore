export default async function handler(req, res) {
  try {
    const resposta = await fetch('https://worldtimeapi.org/api/ip');
    const dados = await resposta.json();

    // Separar data e hora
    const [data, horaCompleta] = dados.datetime.split('T');
    const hora = horaCompleta.split('.')[0]; // Remove milissegundos

    // Função para formatar a data no formato brasileiro (dd/mm/aaaa)
    const formatarDataBrasil = (dataISO) => {
      const [ano, mes, dia] = dataISO.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    // Informações disponíveis (com nomes em português)
    const tudo = {
      "data_completa": dados.datetime,
      "apenas_data": data,
      "apenas_data_br": formatarDataBrasil(data), // Data no formato brasileiro
      "apenas_hora": hora,
      "dia_da_semana": dados.day_of_week,
      "dia_do_ano": dados.day_of_year,
      "fuso_horario": dados.timezone,
      "diferenca_utc": dados.utc_offset,
      "semana_do_ano": dados.week_number
    };

    // Pegar o parâmetro "dados" da URL
    const { dados: parametros } = req.query;

    // Se o Dev pedir dados específicos
    if (parametros) {
      const chavesPedidas = parametros.split(',').map(item => item.trim());
      const respostaFiltrada = {};
      const chavesInvalidas = [];

      chavesPedidas.forEach(chave => {
        if (tudo[chave] !== undefined) {
          respostaFiltrada[chave] = tudo[chave];
        } else {
          chavesInvalidas.push(chave);
        }
      });

      if (chavesInvalidas.length > 0) {
        return res.status(400).json({
          erro: `Os seguintes dados não existem: ${chavesInvalidas.join(', ')}.`,
          dicas: "Use apenas: data_completa, apenas_data, apenas_data_br, apenas_hora, dia_da_semana, dia_do_ano, fuso_horario, diferenca_utc, semana_do_ano."
        });
      }

      return res.status(200).json(respostaFiltrada);
    }

    // Se não pediu nada específico, retorna tudo
    return res.status(200).json(tudo);

  } catch (erro) {
    return res.status(500).json({
      erro: 'Não foi possível obter as informações de horário.'
    });
  }
}