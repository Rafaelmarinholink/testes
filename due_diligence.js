const apiKey = 'patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6';
const baseId = 'appaq7tR3vt9vrN6y';
const tableEmpresas = 'Empresas';
const tableDD = 'Due Diligence';

const headers = {
  Authorization: `Bearer ${apiKey}`
};

const urlParams = new URLSearchParams(window.location.search);
const empresaSelecionada = urlParams.get('id');

// Carregar empresas no <select>
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
    }
    select.appendChild(opt);
  });
}

// Salvar nova análise com link de evidência (URL pública)
async function salvarAnalise() {
  const urlEvidencia = document.getElementById('evidencia').value.trim();
  const evidencia = urlEvidencia ? [urlEvidencia] : [];

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

  alert('Due Diligence cadastrada com sucesso!');
  document.getElementById('form-dd').reset();
}

// Eventos
document.getElementById('salvar-dd').addEventListener('click', salvarAnalise);

// Inicial
carregarEmpresas();
