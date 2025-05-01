import { buscarEmpresas } from './airtable.js';

document.getElementById('empresa-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const campos = document.querySelectorAll('#empresa-form input[required], #empresa-form select[required]');
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
    margem_bruta: parseFloat(document.getElementById('margem_bruta').value),
    sm: parseFloat(document.getElementById('sm').value),
    sga: parseFloat(document.getElementById('sga').value),
    consistencia_crescimento: document.getElementById('consistencia').value,
    receita: parseFloat(document.getElementById('receita').value),
    ebitda: parseFloat(document.getElementById('ebitda').value),
    valuation: parseFloat(document.getElementById('valuation').value),
  };

  const ratingCalculado = calcularRating(dados);

  const data = {
    fields: {
      "Nome da Empresa": document.getElementById('nome').value,
      "Ticker": document.getElementById('ticker').value,
      "Receita Anual (USD)": dados.receita,
      "EBITDA (USD)": dados.ebitda,
      "Valuation (USD)": dados.valuation,
      "Crescimento YoY": dados.crescimento_yoy,
      "Margem Bruta (%)": dados.margem_bruta,
      "S&M (%)": dados.sm,
      "SG&A (%)": dados.sga,
      "Consistência Crescimento YoY": dados.consistencia_crescimento,
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
      Receita: R$ ${Number(emp.receita).toLocaleString('pt-BR')} Milhões
    `;
    card.style.cursor = 'pointer';
    card.onclick = () => window.location.href = `empresa.html?id=${emp.id}\`;
    listaTop.appendChild(card);
  });
}

buscarEmpresas().then(empresas => carregarTopEmpresas(empresas));

function calcularRating(dados) {
  let nota = 0;
  let pesos = {
    crescimento_yoy: 20,
    margem_bruta: 20,
    sm: 10,
    sga: 10,
    consistencia_crescimento: 20,
    ebitda: 10,
    receita: 10
  };

  const preenchidos = Object.keys(pesos).filter(key => dados[key] !== null && dados[key] !== undefined && dados[key] !== '');
  const pesoTotal = preenchidos.reduce((acc, key) => acc + pesos[key], 0);

  const redistribuido = {};
  preenchidos.forEach(key => {
    redistribuido[key] = (pesos[key] / pesoTotal) * 100;
  });

  if (dados.crescimento_yoy >= 20) nota += redistribuido.crescimento_yoy;
  else if (dados.crescimento_yoy >= 5) nota += redistribuido.crescimento_yoy * 0.7;
  else if (dados.crescimento_yoy >= 0) nota += redistribuido.crescimento_yoy * 0.5;

  if (dados.margem_bruta >= 60) nota += redistribuido.margem_bruta;
  else if (dados.margem_bruta >= 40) nota += redistribuido.margem_bruta * 0.7;
  else if (dados.margem_bruta >= 20) nota += redistribuido.margem_bruta * 0.5;

  if (dados.sm <= 20) nota += redistribuido.sm;
  else if (dados.sm <= 40) nota += redistribuido.sm * 0.7;

  if (dados.sga <= 25) nota += redistribuido.sga;
  else if (dados.sga <= 35) nota += redistribuido.sga * 0.7;

  if (dados.consistencia_crescimento === 'Alta') nota += redistribuido.consistencia_crescimento;
  else if (dados.consistencia_crescimento === 'Média') nota += redistribuido.consistencia_crescimento * 0.6;

  if (dados.ebitda > 0) nota += redistribuido.ebitda;

  if (dados.receita > 100) nota += redistribuido.receita;

  return Math.round(Math.min(nota, 100));
}
