import { buscarEmpresas, buscarDiligencias } from './airtable.js';

const listaContainer = document.getElementById('lista-inteligencia');

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

function exportarCSV() {
  const checkboxes = document.querySelectorAll('.checkboxes input[type="checkbox"]:checked');
  const camposSelecionados = Array.from(checkboxes).map(cb => cb.value);

  const linhas = [];
  linhas.push(camposSelecionados.join(';'));

  dadosParaExportar.forEach(dado => {
    const linha = camposSelecionados.map(campo => dado[campo] || '').join(';');
    linhas.push(linha);
  });

  const csvContent = linhas.join('\n');
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  baixarArquivo(blob, 'relatorio_inteligencia.csv');
}

function exportarTXT() {
  const checkboxes = document.querySelectorAll('.checkboxes input[type="checkbox"]:checked');
  const camposSelecionados = Array.from(checkboxes).map(cb => cb.value);

  const blocos = dadosParaExportar.map(dado => {
    return camposSelecionados.map(campo => `${campo}: ${dado[campo] || '-'}`).join('\n');
  });

  const txtContent = blocos.join('\n\n-------------------------\n\n');
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  baixarArquivo(blob, 'relatorio_inteligencia.txt');
}

function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
}


carregarInteligencia();
window.exportarCSV = exportarCSV;
window.exportarTXT = exportarTXT;

function voltarParaEmpresa() {
  const idEmpresa = new URLSearchParams(window.location.search).get('id');
  if (idEmpresa) {
    window.location.href = `empresa.html?id=${idEmpresa}`;
  } else {
    window.location.href = 'index.html';
  }
}

window.voltarParaEmpresa = voltarParaEmpresa;
