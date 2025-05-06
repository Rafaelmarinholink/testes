const apiKey = 'SUA_API_KEY'; // Substitua pela sua chave real
const baseId = 'appaq7tR3vt9vrN6y';
const tableDD = 'Due Diligence';

const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};

// Elementos de filtro
const filtros = {
  empresa: document.getElementById('filtroEmpresa'),
  tipo: document.getElementById('filtroTipo'),
  status: document.getElementById('filtroStatus'),
  risco: document.getElementById('filtroRisco'),
};
const lista = document.getElementById('listaDD');

// Carregar empresas no filtro
async function carregarEmpresasFiltro() {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/Empresas`, { headers });
  const data = await res.json();
  data.records.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = emp.fields["Nome da Empresa"];
    filtros.empresa.appendChild(opt);
  });
}

// Buscar e listar diligências com filtros
async function buscarDiligencias() {
  let filtroFormula = [];

  if (filtros.empresa.value) filtroFormula.push(`FIND("${filtros.empresa.value}", ARRAYJOIN({Empresa DD}))`);
  if (filtros.tipo.value) filtroFormula.push(`{Tipo de Diligencia} = '${filtros.tipo.value}'`);
  if (filtros.status.value) filtroFormula.push(`{Status da análise} = '${filtros.status.value}'`);
  if (filtros.risco.value) filtroFormula.push(`{Classificação de risco} = '${filtros.risco.value}'`);

  const formula = filtroFormula.length ? `AND(${filtroFormula.join(',')})` : '';
  const url = `https://api.airtable.com/v0/${baseId}/${tableDD}?pageSize=100${formula ? '&filterByFormula=' + encodeURIComponent(formula) : ''}`;

  const res = await fetch(url, { headers });
  const data = await res.json();

  lista.innerHTML = '';
  if (!data.records.length) {
    lista.innerHTML = '<p>Nenhuma análise encontrada.</p>';
    return;
  }

  data.records.forEach(record => {
    const div = document.createElement('div');
    div.className = 'analise-item';
    div.innerHTML = `
      <strong>${record.fields["Tipo de Diligencia"]}</strong> - ${record.fields["item analisado"]}
      <br>Status: <b>${record.fields["Status da análise"]}</b> | Risco: <b>${record.fields["Classificação de risco"]}</b>
      <br><em>${record.fields["Comentarios"] ?? ''}</em>
      <br>${record.fields["Evidência"] ? `<a href="${record.fields["Evidência"][0].url}" target="_blank">Ver Evidência</a>` : ''}
      <hr>
    `;
    lista.appendChild(div);
  });
}

// Eventos
Object.values(filtros).forEach(el => el.addEventListener('change', buscarDiligencias));

// Inicialização
carregarEmpresasFiltro().then(buscarDiligencias);
