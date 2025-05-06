// due_diligence.js atualizado com suporte a upload de arquivo

const apiKey = 'patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6';
const baseId = 'appaq7tR3vt9vrN6y';
const tableEmpresas = 'Empresas';
const tableDD = 'Due Diligence';

const headers = {
  Authorization: `Bearer ${apiKey}`
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
const urlParams = new URLSearchParams(window.location.search);
const empresaSelecionada = urlParams.get('id');

async function carregarEmpresas() {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableEmpresas}`, { headers });
  const data = await res.json();
  const select = document.getElementById('empresa');

  data.records.forEach(record => {
    const opt = document.createElement('option');
    opt.value = record.id;
    opt.textContent = record.fields["Nome da Empresa"];
    if (empresaSelecionada && record.id === empresaSelecionada) {
      opt.selected = true;
      listarAnalises(record.id); // já lista as análises dessa empresa
    }
    select.appendChild(opt);
  });
}

// Enviar arquivo e retornar array de attachment
async function uploadArquivo(arquivo) {
  const formData = new FormData();
  formData.append('file', arquivo);

  const res = await fetch('https://upload.airtable.com/v0/' + baseId + '/' + tableDD, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  });

  const data = await res.json();
  return data && data["id"] ? [{ url: data.url, filename: arquivo.name }] : [];
}

// Salvar nova análise
async function salvarAnalise() {
  const arquivo = document.getElementById('evidencia').files[0];
  let evidencia = [];
  if (arquivo) {
    evidencia = [{ url: URL.createObjectURL(arquivo), filename: arquivo.name }];
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
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  listarAnalises(document.getElementById('empresa').value);
}

// Listar análises para empresa
async function listarAnalises(idEmpresa) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableDD}?filterByFormula=FIND(\"${idEmpresa}\", ARRAYJOIN({Empresa DD}))`, { headers });
  const data = await res.json();
  const lista = document.getElementById('lista-dd');
  lista.innerHTML = '';

  data.records.forEach(record => {
    const item = document.createElement('div');
    item.className = 'analise-item';
    item.innerHTML = `
      <strong>${record.fields["Tipo de Diligencia"]}</strong> - ${record.fields["item analisado"]}<br>
      Status: <b>${record.fields["Status da análise"]}</b> | Risco: <b>${record.fields["Classificação de risco"]}</b><br>
      <em>${record.fields["Comentarios"] ?? ''}</em><br>
      ${record.fields["Evidência"] ? `<a href="${record.fields["Evidência"][0].url}" target="_blank">Ver Evidência</a>` : ''}
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
