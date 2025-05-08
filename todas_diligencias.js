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
    const tipo = f["Tipo de Diligencia"] ?? "-";
    const item = f["item analisado"] ?? "-";
    const status = f["Status da análise"] ?? "-";
    const risco = f["Classificação de risco"] ?? "-";
    const comentarios = f["Comentarios"] ?? "-";
    const empresaNome = Array.isArray(f["Empresa DD_Nome"]) ? f["Empresa DD_Nome"][0] : f["Empresa DD_Nome"] ?? "Empresa";
    const empresaId = f["Empresa DD"] ?? null;
    const evidencia = f["Evidência"]?.[0]?.url ?? null;

    let cor = "#ccc";
    if (risco === "Alto") cor = "#ef4444";
    else if (risco === "Médio") cor = "#facc15";
    else if (risco === "Baixo") cor = "#22c55e";

    const div = document.createElement("div");
    div.className = "analise-item";
    div.innerHTML = `
      <p><strong>Tipo de diligência:</strong> ${tipo}</p>
      <p><strong>Item analisado:</strong> ${item}</p>
      <p><strong>Empresa:</strong> ${
        empresaId 
          ? `<a href="empresa.html?id=${empresaId}" class="btn-white-outline">${empresaNome}</a>` 
          : empresaNome
      }</p>
      <p><strong>Status:</strong> ${status} 
        <span class="badge-due" style="background-color:${cor}33; color:${cor}; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.8rem;">
          Risco: ${risco}
        </span>
      </p>
      ${comentarios ? `<p><strong>Comentários:</strong> <em>${comentarios}</em></p>` : ''}
      ${evidencia ? `<a href="${evidencia}" target="_blank" class="btn-white-outline">Ver Evidência</a>` : ''}
      <hr style="margin-top:1rem;">
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
