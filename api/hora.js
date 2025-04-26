export default async function handler(req, res) {
  try {
    const resposta = await fetch('https://worldtimeapi.org/api/ip');
    const dados = await resposta.json();

    // Separar data e hora
    const [data, horaCompleta] = dados.datetime.split('T');
    const hora = horaCompleta.split('.')[0]; // Remove milissegundos

    // Extrair valores numéricos
    const [ano, mes, dia] = data.split('-');
    const [horaNumerica, minuto, segundo] = hora.split(':');

    // Dia da semana: 0 (domingo) a 6 (sábado)
    const diaDaSemana = dados.day_of_week;

    // Informações numéricas específicas
    const tudo = {
      "dia": dia,               // Dia do mês
      "mes": mes,               // Mês (01 a 12)
      "ano": ano,               // Ano
      "hora": horaNumerica,     // Hora (00 a 23)
      "minuto": minuto,         // Minuto (00 a 59)
      "segundo": segundo,       // Segundo (00 a 59)
      "dia_da_semana": diaDaSemana // Dia da semana (0 a 6)
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