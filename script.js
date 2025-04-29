// script.js
import { buscarEmpresas } from './airtable.js';

const listaTop = document.getElementById('top-empresas');
const form = document.getElementById('empresa-form');
const sucessoAlert = document.getElementById('sucesso-alert');
const erroAlert = document.getElementById('erro-alert');

function calcularRating(dados) {
  let nota = 0;
  if (dados.crescimento_yoy > 25) nota += 20;
  else if (dados.crescimento_yoy >= 10) nota += 15;
  else if (dados.crescimento_yoy >= 0) nota += 10;

  if (dados.nrr > 110) nota += 20;
  else if (dados.nrr >= 95) nota += 15;
  else if (dados.nrr >= 85) nota += 10;
  else nota += 5;

  if (dados.ltv > 1000) nota += 15;
  else if (dados.ltv >= 500) nota += 10;
  else nota += 5;

  if (dados.churn < 5) nota += 15;
  else if (dados.churn <= 10) nota += 10;
  else nota += 5;

  if (dados.margem_contribuicao > 40) nota += 10;
  else if (dados.margem_contribuicao >= 20) nota += 7;
  else nota += 5;

  if (dados.ev_ebitda >= 9 && dados.ev_ebitda <= 14) nota += 10;
  else nota += 5;

  if (dados.cac < 100) nota += 5;
  else if (dados.cac <= 300) nota += 3;
  else nota += 2;

  if (dados.receita > 100) nota += 5;
  else if (dados.receita >= 50) nota += 3;
  else nota += 2;

  return Math.min(nota, 100);
}

function mostrarToast(elemento) {
  elemento.style.display = 'block';
  setTimeout(() => elemento.style.display = 'none', 3000);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const campos = form.querySelectorAll('input[required]');
  let valido = true;
  campos.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      valido = false;
    } else {
      input.classList.remove('error');
    }
  });

  if (!valido) {
    mostrarToast(erroAlert);
    return;
  }

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

  const rating = calcularRating(dados);

  const data = {
    fields: {
      "Nome da Empresa": document.getElementById('nome').value,
      "Ticker": document.getElementById('ticker').value,
      "Receita Anual (USD)": dados.receita,
      "EBITDA (USD)": parseFloat(document.getElementById('ebitda').value),
      "Valuation (USD)": parseFloat(document.getElementById('valuation').value),
      "Notas": document.getElementById('notas').value,
      "Rating": rating,
      "Crescimento YoY (%)": dados.crescimento_yoy,
      "Retenção / NRR (%)": dados.nrr,
      "LTV (USD)": dados.ltv,
      "Taxa de Churn (%)": dados.churn,
      "Margem de Contribuição (%)": dados.margem_contribuicao,
      "EV/EBITDA": dados.ev_ebitda,
      "CAC (USD)": dados.cac
    }
  };

  await fetch("https://api.airtable.com/v0/appaq7tR3vt9vrN6y/Empresas", {
    method: 'POST',
    headers: {
      Authorization: "Bearer patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  mostrarToast(sucessoAlert);
  e.target.reset();
  carregarTopEmpresas();
});

function carregarTopEmpresas() {
  buscarEmpresas().then(empresas => {
    const top3 = empresas.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
    listaTop.innerHTML = '';
    top3.forEach(emp => {
      const card = document.createElement('div');
      card.className = 'empresa-card';
      card.innerHTML = `
        <strong>${emp.nome}</strong><br/>
        Rating: ${emp.rating ?? 'N/A'}<br/>
        Receita: $${Number(emp.receita).toLocaleString('pt-BR')}M
      `;
      card.style.cursor = 'pointer';
      card.onclick = () => {
        window.location.href = `empresa.html?id=${emp.id}`;
      };
      listaTop.appendChild(card);
    });
  });
}

carregarTopEmpresas();
