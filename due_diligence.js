const apiKey = 'patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6';
const baseId = 'appaq7tR3vt9vrN6y';
const tableEmpresas = 'Empresas';
const tableDD = 'Due Diligence';

const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};

// Carregar empresas no <select>
async function carregarEmpresas() {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableEmpresas}`, { headers });
  const data = await res.json();
  const select = document.getElementById('empresa');

  data.records.forEach(record => {
    const opt = document.createElement('option');
    opt.value = record.id;
    opt.textContent = record.fields["Nome da Empresa"];
    select.appendChild(opt);
  });
}

// Salvar nova análise
async function salvarAnalise() {
  const dados = {
    fields: {
      "Empresa": [document.getElementById('empresa').value],
      "Tipo de Diligência": document.getElementById('tipo').value,
      "Item Analisado": document.getElementById('item').value,
      "Status": document.getElementById('status').value,
      "Risco": document.getElementById('risco').value,
      "Comentário": document.getElementById('comentario').value,
      "Evidência": document.getElementById('evidencia').value
    }
  };

  await fetch(`https://api.airtable.com/v0/${baseId}/${tableDD}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dados)
  });

  listarAnalises(document.getElementById('empresa').value);
}

// Listar análises para empresa
async function listarAnalises(idEmpresa) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableDD}?filterByFormula=FIND("${idEmpresa}", ARRAYJOIN({Empresa}))`, { headers });
  const data = await res.json();
  const lista = document.getElementById('lista-dd');
  lista.innerHTML = '';

  data.records.forEach(record => {
    const item = document.createElement('div');
    item.className = 'analise-item';
    item.innerHTML = `
      <strong>${record.fields["Tipo de Diligência"]}</strong> - ${record.fields["Item Analisado"]}
      <br>Status: <b>${record.fields["Status"]}</b> | Risco: <b>${record.fields["Risco"]}</b>
      <br><em>${record.fields["Comentário"] ?? ''}</em>
      <br>${record.fields["Evidência"] ? `<a href="${record.fields["Evidência"]}" target="_blank">Ver Evidência</a>` : ''}
      <hr>
    `;
    lista.appendChild(item);
  });
}

// Eventos
document.getElementById('empresa').addEventListener('change', (e) => {
  listarAnalises(e.target.value);
});

document.getElementById('salvar-dd').addEventListener('click', salvarAnalise);

// Inicial
carregarEmpresas();
