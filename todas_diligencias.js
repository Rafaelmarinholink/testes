const baseId = 'appaq7tR3vt9vrN6y';
const table = 'Due Diligence';
const apiKey = 'patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6';

async function buscarDiligencias() {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${table}?pageSize=100`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });
  const data = await res.json();
  return data.records;
}

function aplicarFiltros(dados) {
  const empresa = document.getElementById('filtroEmpresa').value;
  const tipo = document.getElementById('filtroTipo').value;
  const status = document.getElementById('filtroStatus').value;
  const risco = document.getElementById('filtroRisco').value;

  return dados.filter(r => {
    const f = r.fields;
    return (!empresa || f['Empresa DD']?.includes(empresa)) &&
           (!tipo || f['Tipo de Diligencia'] === tipo) &&
           (!status || f['Status da análise'] === status) &&
           (!risco || f['Classificação de risco'] === risco);
  });
}

function renderizarLista(dados) {
  const lista = document.getElementById('listaDD');
  lista.innerHTML = '';

  if (dados.length === 0) {
    lista.innerHTML = '<p>Nenhuma análise encontrada.</p>';
    return;
  }

  dados.forEach(r => {
    const f = r.fields;
    const div = document.createElement('div');
    div.className = 'analise-item';
    div.innerHTML = `
      <strong>${f["Tipo de Diligencia"]}</strong> - ${f["item analisado"]}<br>
      Empresa: <a href="empresa.html?id=${f["Empresa DD"]}">${f["Empresa DD_Nome"] || 'Ver empresa'}</a><br>
      Status: <b>${f["Status da análise"]}</b> | Risco: <b>${f["Classificação de risco"]}</b><br>
      <em>${f["Comentarios"] ?? ''}</em><br>
      ${f["Evidência"] ? `<a href="${f["Evidência"][0].url}" target="_blank">Ver Evidência</a>` : ''}
    `;
    lista.appendChild(div);
  });
}

function atualizarLista(dados) {
  const filtrados = aplicarFiltros(dados);
  renderizarLista(filtrados);
}

function preencherDropdownEmpresas(dados) {
  const select = document.getElementById('filtroEmpresa');
  const nomes = new Set();

  dados.forEach(r => {
    if (r.fields["Empresa DD_Nome"]) {
      nomes.add(r.fields["Empresa DD"]);
    }
  });

  [...nomes].forEach(id => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = id;
    select.appendChild(option);
  });
}

buscarDiligencias().then(dados => {
  preencherDropdownEmpresas(dados);
  renderizarLista(dados);

  ['filtroEmpresa', 'filtroTipo', 'filtroStatus', 'filtroRisco'].forEach(id =>
    document.getElementById(id).addEventListener('change', () => atualizarLista(dados))
  );
});
