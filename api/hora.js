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
      
      // Verifica se as chaves existem e retorna o valor
      const respostaFiltrada = chavesPedidas.map(chave => {
        if (tudo[chave] !== undefined) {
          return tudo[chave];
        }
        return null; // Se a chave não existir, retorna null
      }).filter(valor => valor !== null); // Remove valores null (caso a chave não exista)

      // Se não encontrar nada válido
      if (respostaFiltrada.length === 0) {
        return res.status(400).send('Dados não encontrados.');
      }

      // Retorna o valor pedido
      return res.status(200).send(respostaFiltrada.join(' ')); // Retorna os valores juntos, separados por espaço
    }

    // Se não pedir nada específico, retorna erro
    return res.status(400).send('Nenhum dado solicitado.');

  } catch (erro) {
    return res.status(500).send('Erro ao obter as informações de horário.');
  }
}