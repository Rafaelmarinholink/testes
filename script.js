import { buscarEmpresas } from './airtable.js';

document.getElementById('empresa-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const campos = document.querySelectorAll('#empresa-form input, #empresa-form textarea');
  let valido = true;

  campos.forEach(campo => {
    if (campo.hasAttribute('required') && !campo.value.trim()) {
      campo.classList.add('error');
      valido = false;
    } else {
      campo.classList.remove('error');
    }
  });

  if (!valido) {
    document.getElementById('popupErro').style.display = 'block';
    return;
  } else {
    document.getElementById('popupErro').style.display = 'none';
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

  const ratingCalculado = calcularRating(dados);

  const data = {
    fields: {
      "Nome da Empresa": document.getElementById('nome').value,
      "Ticker": document.getElementById('ticker').value,
      "Receita Anual (USD)": dados.receita,
      "EBITDA (USD)": parseFloat(document.getElementById('ebitda').value),
      "Valuation (USD)": parseFloat(document.getElementById('valuation').value),
      "Crescimento YoY": dados.crescimento_yoy,
      "Retenção NRR": dados.nrr,
      "LTV": dados.ltv,
      "Churn": dados.churn,
      "Margem de Contribuição": dados.margem_contribuicao,
      "CAC": dados.cac,
      "Notas": document.getElementById('notas').value,
      "Rating": ratingCalculado
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

  buscarEmpresas().then(empresas => carregarTopEmpresas(empresas));
  e.target.reset();
});

function carregarTopEmpresas(empresas) {
  const top3 = empresas.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  const listaTop = document.getElementById('top-empresas');
  listaTop.innerHTML = '';
  top3.forEach(emp => {
    const card = document.createElement('div');
    card.className = 'empresa-card';
    card.innerHTML = `
      <strong>${emp.nome}</strong><br>
      Rating: ${emp.rating ?? 'N/A'}<br>
      Receita: $${Number(emp.receita).toLocaleString('pt-BR')}M
    `;
    card.style.cursor = 'pointer';
    card.onclick = () => window.location.href = `empresa.html?id=${emp.id}`;
    listaTop.appendChild(card);
  });
}

buscarEmpresas().then(empresas => carregarTopEmpresas(empresas));

function calcularRating(dados) {
  let nota = 0;

  if (dados.crescimento_yoy > 25) nota += 20;
  else if (dados.crescimento_yoy >= 10) nota += 15;
  else if (dados.crescimento_yoy >= 0) nota += 10;

  if (dados.nrr > 110) nota += 20;
  else if (dados.nrr >= 95) nota += 15;
  else if (dados.nrr >= 85) nota += 10;

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
