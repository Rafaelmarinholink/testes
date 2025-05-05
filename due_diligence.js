const apiKey = 'patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6';
const baseId = 'appaq7tR3vt9vrN6y';
const tableEmpresas = 'Empresas';
const tableDD = 'Due Diligence';

const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};

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

async function salvarAnalise() {
  const fileInput = document.getElementById('evidencia');
  let evidencia = [];

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch('https://api.airtable.com/v0/attachments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData
    });

    const uploadData = await uploadRes.json();
    evidencia = [{ url: uploadData.url }];
  }

  const dados = {
    fields: {
      "Empresa DD": [document.getElementById('empresa').value],
      "Tipo de Diligencia": document.getElementById('tipo').value,
      "item analisado": document.getElementById('item').value,
      "Status da análise": document.getElementById('status').value,
      "Classificação de risco": document.getElementById('risco').value,
      "Comentarios": document.getElementById('comentario').value,
      "Evidência": evidencia
    }
  };

  await fetch(`https://api.airtable.com/v0/${baseId}/${tableDD}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dados)
  });

  listarAnalises(document.getElementById('empresa').value);
}

async function listarAnalises(idEmpresa) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableDD}?filterByFormula=FIND("${idEmpresa}", ARRAYJOIN({Empresa DD}))`, { headers });
  const data = await res.json();
  const lista = document.getElementById('lista-dd');
  lista.innerHTML = '';

  data.records.forEach(record => {
    const item = document.createElement('div');
    item.className = 'analise-item';
    item.innerHTML = `
      <strong>${record.fields["Tipo de Diligencia"]}</strong> - ${record.fields["item analisado"]}
      <br>Status: <b>${record.fields["Status da análise"]}</b> | Risco: <b>${record.fields["Classificação de risco"]}</b>
      <br><em>${record.fields["Comentarios"] ?? ''}</em>
      <br>${record.fields["Evidência"]?.[0]?.url ? `<a href="${record.fields["Evidência"][0].url}" target="_blank">Ver Evidência</a>` : ''}
      <hr>
    `;
    lista.appendChild(item);
  });
}

document.getElementById('empresa').addEventListener('change', (e) => {
  listarAnalises(e.target.value);
});
document.getElementById('salvar-dd').addEventListener('click', salvarAnalise);
carregarEmpresas();
