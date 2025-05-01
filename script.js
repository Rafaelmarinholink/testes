import { buscarEmpresas } from './airtable.js';

document.getElementById('empresa-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const campos = document.querySelectorAll('#empresa-form input[required], #empresa-form textarea[required]');
  let valido = true;

  campos.forEach(campo => {
    if (!campo.value.trim()) {
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
    margem_bruta: parseFloat(document.getElementById('margem_bruta').value),
    sm: parseFloat(document.getElementById('sm').value),
    sga: parseFloat(document.getElementById('sga').value),
    consistencia_yoy: document.getElementById('consistencia_yoy').value,
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
      "Margem EBITDA": parseFloat(document.getElementById('margem_ebitda').value),
      "EV/EBITDA": parseFloat(document.getElementById('ev_ebitda').value),
      "Notas": document.getElementById('notas').value,
      "Rating": ratingCalculado,
      "Crescimento YoY": dados.crescimento_yoy,
      "Margem Bruta": dados.margem_bruta,
      "S&M": dados.sm,
      "SG&A": dados.sga,
      "Consistência Crescimento YoY": dados.consistencia_yoy
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
  const top3 = empresas
    .filter(e => typeof e.rating === 'number' && !isNaN(e.rating))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const listaTop = document.getElementById('top-empresas');
  listaTop.innerHTML = '';

  top3.forEach(emp => {
    const card = document.createElement('div');
    card.className = 'empresa-card';
    card.innerHTML = `
      <strong>${emp.nome}</strong><br>
      Rating: ${emp.rating ?? 'N/A'}<br>
      Receita: R$ ${Number(emp.receita).toLocaleString('pt-BR')} Milhões
    `;
    card.style.cursor = 'pointer';
    card.onclick = () => window.location.href = `empresa.html?id=${emp.id}`;
    listaTop.appendChild(card);
  });
}

buscarEmpresas().then(empresas => carregarTopEmpresas(empresas));
