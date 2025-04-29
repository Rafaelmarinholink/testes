function calcularRating(dados) {
  let nota = 0;

  // Crescimento YoY (20%)
  if (dados.crescimento_yoy > 25) nota += 20;
  else if (dados.crescimento_yoy >= 10) nota += 15;
  else if (dados.crescimento_yoy >= 0) nota += 10;
  else nota += 0;

  // Retenção / NRR (20%)
  if (dados.nrr > 110) nota += 20;
  else if (dados.nrr >= 95) nota += 15;
  else if (dados.nrr >= 85) nota += 10;
  else nota += 5;

  // LTV (15%)
  if (dados.ltv > 1000) nota += 15;
  else if (dados.ltv >= 500) nota += 10;
  else nota += 5;

  // Churn Rate (15%)
  if (dados.churn < 5) nota += 15;
  else if (dados.churn <= 10) nota += 10;
  else nota += 5;

  // Margem de Contribuição (10%)
  if (dados.margem_contribuicao > 40) nota += 10;
  else if (dados.margem_contribuicao >= 20) nota += 7;
  else nota += 5;

  // EV/EBITDA (10%)
  if (dados.ev_ebitda >= 9 && dados.ev_ebitda <= 14) nota += 10;
  else nota += 5;

  // CAC (5%)
  if (dados.cac < 100) nota += 5;
  else if (dados.cac <= 300) nota += 3;
  else nota += 2;

  // Receita Anual (5%)
  if (dados.receita > 100) nota += 5;
  else if (dados.receita >= 50) nota += 3;
  else nota += 2;

  return Math.min(nota, 100);
}

import { buscarEmpresas } from './airtable.js';

const lista = document.getElementById('empresa-lista');
const searchInput = document.getElementById('search');
const ordenarPor = document.getElementById('ordenarPor');
const ordem = document.getElementById('ordem');
let todasEmpresas = [];

function renderizar(empresas) {
  lista.innerHTML = '';
  empresas.forEach(empresa => {
    const card = document.createElement('div');
    card.className = 'empresa-card';
    card.innerHTML = `
      <strong>${empresa.nome}</strong>
      Valuation: $${Number(empresa.valuation).toLocaleString('pt-BR')}M<br/>
      EBITDA: $${Number(empresa.ebitda).toLocaleString('pt-BR')}M<br/>
      Receita: $${Number(empresa.receita).toLocaleString('pt-BR')}M
    `;
    card.onclick = () => {
      window.location.href = `empresa.html?id=${empresa.id}`;
    };
    lista.appendChild(card);
  });
}

function filtrarEBuscar() {
  const texto = searchInput.value.toLowerCase();
  const coluna = ordenarPor.value;
  const sentido = ordem.value;

  let filtradas = todasEmpresas.filter(e =>
    e.nome.toLowerCase().includes(texto)
  );

  filtradas.sort((a, b) => {
    const valA = a[coluna] ?? 0;
    const valB = b[coluna] ?? 0;
    if (typeof valA === 'string') {
      return sentido === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sentido === 'asc' ? valA - valB : valB - valA;
    }
  });

  renderizar(filtradas);
}

document.getElementById('empresa-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    fields: {
      "Nome da Empresa": document.getElementById('nome').value,
      "Ticker": document.getElementById('ticker').value,
      "Receita Anual (USD)": parseFloat(document.getElementById('receita').value),
      "EBITDA (USD)": parseFloat(document.getElementById('ebitda').value),
      "Valuation (USD)": parseFloat(document.getElementById('valuation').value),
      "Notas": document.getElementById('notas').value
    }
  };
const dados = {
  crescimento_yoy: parseFloat(document.getElementById('crescimento_yoy').value),
  nrr: parseFloat(document.getElementById('nrr').value),
  ltv: parseFloat(document.getElementById('ltv').value),
  churn: parseFloat(document.getElementById('churn').value),
  margem_contribuicao: parseFloat(document.getElementById('margem_contribuicao').value),
  ev_ebitda: parseFloat(document.getElementById('ev_ebitda').value),
  cac: parseFloat(document.getElementById('cac').value),
  receita: parseFloat(document.getElementById('receita').value)
};

const ratingCalculado = calcularRating(dados);

  await fetch("https://api.airtable.com/v0/appaq7tR3vt9vrN6y/Empresas", {
    method: 'POST',
    headers: {
      Authorization: "Bearer patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  buscarEmpresas().then(empresas => {
    todasEmpresas = empresas;
    filtrarEBuscar();
  });

  e.target.reset();
});

buscarEmpresas().then(empresas => {
  todasEmpresas = empresas;
  filtrarEBuscar();
});

searchInput.addEventListener('input', filtrarEBuscar);
ordenarPor.addEventListener('change', filtrarEBuscar);
ordem.addEventListener('change', filtrarEBuscar);

"fields": {
  ...
  "Rating": ratingCalculado
}
