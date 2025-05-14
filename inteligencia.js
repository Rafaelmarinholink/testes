import { buscarEmpresas, buscarDiligencias } from './airtable.js';

const listaContainer = document.getElementById('lista-inteligencia');
const promptContainer = document.getElementById('promptGerado');

let dadosParaExportar = [];

async function carregarInteligencia() {
  const empresas = await buscarEmpresas();
  const diligencias = await buscarDiligencias();

 const urlParams = new URLSearchParams(window.location.search);
const idEmpresa = urlParams.get('id');
const empresasFiltradas = idEmpresa
  ? empresas.filter(emp => emp.id === idEmpresa)
  : empresas;

empresasFiltradas.forEach(emp => {

    if (!emp.nome) return;

    const ddRelacionadas = diligencias.filter(dd => dd.fields?.EmpresaID === emp.id);
    const rating = emp.rating || '-';
    const status = rating === 'A' ? 'Aprovada' : (rating === 'B' ? 'Em Análise' : 'Não Aprovada');
    const crescimento = emp.crescimento_yoy || '-';
    const margem = emp.margem_ebitda || '-';
    const notas = emp.notas || '-';

    const div = document.createElement('div');
    div.className = 'empresa-inteligencia';
    div.innerHTML = `
      <h3>${emp.nome} (${emp.ticker})</h3>
      <p><strong>Rating:</strong> ${rating} | <strong>Status:</strong> ${status}</p>
      <p><strong>Crescimento:</strong> ${crescimento} | <strong>Margem EBITDA:</strong> ${margem}</p>
      <p><strong>Notas:</strong> ${notas}</p>
      <p><strong>Diligências:</strong> ${ddRelacionadas.length}</p>
    `;
    listaContainer.appendChild(div);

    const prompt = gerarPrompt(emp, ddRelacionadas, status);
    promptContainer.textContent += prompt + "\n\n";

    dadosParaExportar.push({
      'Nome da empresa': emp.nome,
      'Ticker': emp.ticker,
      'Rating': rating,
      'Crescimento YoY': crescimento,
      'Margem EBITDA': margem,
      'Notas': notas
    });
  });
}

function gerarPrompt(emp, ddList, status) {
  const nome = emp.nome;
  const ticker = emp.ticker;
  const rating = emp.rating || 'Sem rating';
  const crescimento = emp.crescimento_yoy ? (parseFloat(emp.crescimento_yoy) * 100).toFixed(1) + '%' : '-';
  const margem = emp.margem_ebitda ? (parseFloat(emp.margem_ebitda) * 100).toFixed(1) + '%' : '-';
  const riscos = ddList.map(d => `${d.fields['Tipo de Diligencia']} (${d.fields['Classificação de risco']})`).join(', ') || 'nenhuma diligência registrada';

  return `A empresa ${nome} (${ticker}) possui rating ${rating}, margem EBITDA de ${margem}, e crescimento de ${crescimento}.
Status: ${status}. Diligências associadas: ${riscos}.
Recomenda-se reavaliação com base nos indicadores e riscos atuais.`;
}

function exportarDados() {
  const checkboxes = document.querySelectorAll('.checkboxes input[type="checkbox"]:checked');
  const camposSelecionados = Array.from(checkboxes).map(cb => cb.value);

  const linhas = [];
  linhas.push(camposSelecionados.join(',')); // Cabeçalho

  dadosParaExportar.forEach(dado => {
    const linha = camposSelecionados.map(campo => dado[campo] || '').join(',');
    linhas.push(linha);
  });

  const csvContent = linhas.join('\\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio_inteligencia.csv';
  a.click();
}

carregarInteligencia();
window.exportarDados = exportarDados;
