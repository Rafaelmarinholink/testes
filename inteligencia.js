import { buscarEmpresas, buscarDiligencias } from './airtable.js';

const urlParams = new URLSearchParams(window.location.search);
const idEmpresa = urlParams.get('id');
const listaContainer = document.getElementById('lista-inteligencia');
const promptContainer = document.getElementById('promptGerado');

async function carregarInteligencia() {
  const empresas = await buscarEmpresas();
  const diligencias = await buscarDiligencias();

  const empresasFiltradas = idEmpresa
    ? empresas.filter(emp => emp.id === idEmpresa)
    : empresas;

  empresasFiltradas.forEach(emp => {
    const div = document.createElement('div');
    div.className = 'empresa-inteligencia';

    const ddRelacionadas = diligencias.filter(dd => dd.fields.EmpresaID === emp.id);
    const rating = emp.fields['Rating'] || '-';
    const status = emp.fields['Aprovacao'] || 'Em Avaliação';
    const receita = emp.fields['Receita Anual (USD)'] || '-';
    const crescimento = emp.fields['Crescimento YoY'] || '-';
    const margem = emp.fields['Margem EBITDA'] || '-';
    const notas = emp.fields['Notas'] || '-';

    div.innerHTML = `
      <h3>${emp.fields['Nome da empresa']} (${emp.fields.Ticker})</h3>
      <p><strong>Rating:</strong> ${rating} | <strong>Status:</strong> ${status}</p>
      <p><strong>Receita:</strong> ${receita} | <strong>Crescimento YoY:</strong> ${crescimento} | <strong>Margem EBITDA:</strong> ${margem}</p>
      <p><strong>Notas:</strong> ${notas}</p>
      <p><strong>Diligências:</strong> ${ddRelacionadas.length} registradas</p>
    `;

    listaContainer.appendChild(div);

    const prompt = gerarPromptInteligente(emp, ddRelacionadas);
    promptContainer.textContent += prompt + "\n\n";
  });
}

function gerarPromptInteligente(emp, ddList) {
  const nome = emp.fields['Nome da empresa'];
  const ticker = emp.fields['Ticker'];
  const rating = emp.fields['Rating'] || 'Sem rating';
  const margem = emp.fields['Margem EBITDA'] || '-';
  const crescimento = emp.fields['Crescimento YoY'] || '-';
  const status = emp.fields['Aprovacao'] || 'Em Avaliação';

  const resumoDD = ddList.map(dd => {
    return `${dd.fields['Tipo de Diligencia']} (${dd.fields['Classificação de risco']})`;
  }).join(', ') || 'Nenhuma diligência registrada';

  return `A empresa ${nome} (${ticker}) possui rating ${rating}, margem EBITDA de ${margem} e crescimento anual de ${crescimento}.
Status atual: ${status}.
Diligências registradas: ${resumoDD}.
Recomenda-se reavaliação conforme evolução das análises e indicadores.`;
}

carregarInteligencia();
