
const baseId = 'appaq7tR3vt9vrN6y';
const tableName = 'Empresas';
const apiKey = 'SUA_CHAVE_AQUI'; // Substitua por sua chave real com segurança

const airtableURL = `https://api.airtable.com/v0/${baseId}/${tableName}`;
const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};

async function buscarEmpresas() {
  try {
    const response = await fetch(airtableURL, { headers });
    const data = await response.json();
    return data.records.map(record => ({
      id: record.id,
      nome: record.fields["Nome da Empresa"],
      ticker: record.fields["Ticker"],
      receita: record.fields["Receita Anual (USD)"],
      ebitda: record.fields["EBITDA (USD)"],
      valuation: record.fields["Valuation (USD)"],
      margem: record.fields["Margem EBITDA (%)"],
      ev_ebitda: record.fields["EV/EBITDA"],
      notas: record.fields["Notas"]
    }));
  } catch (error) {
    console.error("Erro ao buscar dados do Airtable:", error);
    return [];
  }
}

export { buscarEmpresas };
