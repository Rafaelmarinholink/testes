import { buscarEmpresas } from './airtable.js';

const listaContainer = document.getElementById('lista-inteligencia');
let dadosParaExportar = [];

// Função auxiliar para buscar status das Due Diligences
async function buscarStatusDD(empresaId) {
  const baseId = 'appaq7tR3vt9vrN6y';
  const tableDD = 'Due%20Diligence';
  const apiKey = 'patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6';

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const url = `https://api.airtable.com/v0/${baseId}/${tableDD}?filterByFormula={EmpresaID} = "${empresaId}"`;
  const res = await fetch(url, { headers });
  const data = await res.json();

  const registros = data.records;
  const total = registros.length;

  const riscos = registros.map(r => r.fields["Classificação de risco"] || "").join(" ");
  let risco = "Nenhum";
  if (riscos.includes("Alto")) risco = "Alto";
  else if (riscos.includes("Médio")) risco = "Médio";
  else if (riscos.includes("Baixo")) risco = "Baixo";

  let quantidadeTexto = "Nenhuma";
  if (total === 1) quantidadeTexto = "Uma diligência";
  else if (total === 2) quantidadeTexto = "Duas diligências";
  else if (total > 2) quantidadeTexto = `${total} diligências`;

  return `${quantidadeTexto} – ${risco}`;
}

// Função principal
async function carregarInteligencia() {
  const empresas = await buscarEmpresas();
  const urlParams = new URLSearchParams(window.location.search);
  const idEmpresa = urlParams.get('id');

  const empresa = empresas.find(emp => emp.id === idEmpresa);
  if (!empresa) return;

  const rating = empresa.rating || '-';
  const status = rating === 'A' ? 'Aprovada' : (rating === 'B' ? 'Em Análise' : 'Não Aprovada');
  const crescimento = empresa.crescimento_yoy ? (parseFloat(empresa.crescimento_yoy) * 100).toFixed(1) + '%' : '-';
  const margem = empresa.margem_ebitda ? (parseFloat(empresa.margem_ebitda) * 100).toFixed(1) + '%' : '-';
  const notas = empresa.notas || '-';
  const statusDD = await buscarStatusDD(empresa.id);

  const div = document.createElement('div');
  div.className = 'empresa-inteligencia';
  div.innerHTML = `
    <h3>${empresa.nome} (${empresa.ticker})</h3>
    <p><strong>Rating:</strong> ${rating} | <strong>Status:</strong> ${status}</p>
    <p><strong>Crescimento:</strong> ${crescimento} | <strong>Margem EBITDA:</strong> ${margem}</p>
    <p><strong>Notas:</strong> ${notas}</p>
    <p><strong>Diligências:</strong> ${statusDD}</p>
  `;
  listaContainer.appendChild(div);

  dadosParaExportar.push({
    'Nome da empresa': empresa.nome,
    'Ticker': empresa.ticker,
    'Rating': rating,
    'Crescimento YoY': crescimento,
    'Margem EBITDA': margem,
    'Notas': notas,
    'Status DD': statusDD
  });
}

// Exportação CSV
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

// Exportação TXT
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

// Baixar arquivo (usado nas duas exportações)
function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
}

// Voltar para empresa
function voltarParaEmpresa() {
  const idEmpresa = new URLSearchParams(window.location.search).get('id');
  if (idEmpresa) {
    window.location.href = `empresa.html?id=${idEmpresa}`;
  } else {
    window.location.href = 'index.html';
  }
}

carregarInteligencia();

// Tornar funções globais para o HTML poder acessá-las
window.exportarCSV = exportarCSV;
window.exportarTXT = exportarTXT;
window.voltarParaEmpresa = voltarParaEmpresa;
