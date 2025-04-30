const baseId = 'appaq7tR3vt9vrN6y';
const tableName = 'Empresas';
const apiKey = 'patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6';

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
      margem_ebitda: record.fields["Margem EBITDA"],
      ev_ebitda: record.fields["EV/EBITDA"],
      crescimento_yoy: record.fields["Crescimento YoY"],
      margem_bruta: record.fields["Margem Bruta"],
      consistencia_yoy: record.fields["Consistência Crescimento YoY"],
      notas: record.fields["Notas"],
      rating: record.fields["Rating"]
    }));
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return [];
  }
}

export { buscarEmpresas };
