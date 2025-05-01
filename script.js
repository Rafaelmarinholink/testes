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

  // Captura os dados
  const dados = {
    receita: parseFloat(document.getElementById('receita').value),
    ebitda: parseFloat(document.getElementById('ebitda').value),
    valuation: parseFloat(document.getElementById('valuation').value),
    crescimento_yoy: parseFloat(document.getElementById('crescimento_yoy').value),
    margem_bruta: parseFloat(document.getElementById('margem_bruta').value),
    sm: parseFloat(document.getElementById('sm').value),
    sga: parseFloat(document.getElementById('sga').value),
    consistencia_yoy: document.getElementById('consistencia_yoy').value.trim().toLowerCase()
  };

  // Calcula o Rating com redistribuição
  const ratingCalculado = calcularRating(dados);

  const data = {
    fields: {
      "Nome da Empresa": document.getElementById('nome').value,
      "Ticker": document.getElementById('ticker').value,
      "Receita Anual (USD)": dados.receita,
      "EBITDA (USD)": parseFloat(document.getElementById('ebitda').value),
      "Valuation (USD)": parseFloat(document.getElementById('valuation').value),
      "Crescimento YoY": dados.crescimento_yoy,
      "Margem Bruta": dados.margem_bruta,
      "S&M": dados.sm,
      "SG&A": dados.sga,
      "Consistência Crescimento YoY": document.getElementById('consistencia_yoy').value,
      "Notas": document.getElementById('notas').value,
      "Rating": ratingCalculado
    }
  };

  // Envia ao Airtable
  await fetch("https://api.airtable.com/v0/appaq7tR3vt9vrN6y/Empresas", {
    method: 'POST',
    headers: {
      Authorization: "Bearer SEU_API_KEY_AQUI",
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

// Função de cálculo de rating com redistribuição
function calcularRating(dados) {
  const pesosOriginais = {
    crescimento_yoy: 20,
    margem_bruta: 15,
    sm: 15,
    sga: 10,
    consistencia_yoy: 15,
    receita: 10,
    ebitda: 10,
    valuation: 5
  };

  let totalPeso = 0;
  let nota = 0;

  for (const kpi in pesosOriginais) {
    const peso = pesosOriginais[kpi];
    const valor = dados[kpi];

    if (valor === null || valor === undefined || (typeof valor === 'number' && isNaN(valor)) || (typeof valor === 'string' && valor === '')) {
      continue; // não pontua, redistribui
    }

    totalPeso += peso;

    switch (kpi) {
      case 'crescimento_yoy':
        if (valor > 25) nota += peso;
        else if (valor >= 10) nota += peso * 0.75;
        else if (valor >= 0) nota += peso * 0.5;
        break;

      case 'margem_bruta':
        if (valor > 60) nota += peso;
        else if (valor >= 40) nota += peso * 0.75;
        else nota += peso * 0.5;
        break;

      case 'sm':
        if (valor < 10) nota += peso;
        else if (valor < 20) nota += peso * 0.75;
        else nota += peso * 0.5;
        break;

      case 'sga':
        if (valor < 15) nota += peso;
        else if (valor < 25) nota += peso * 0.75;
        else nota += peso * 0.5;
        break;

      case 'consistencia_yoy':
        if (valor === 'alta') nota += peso;
        else if (valor === 'média' || valor === 'media') nota += peso * 0.6;
        else nota += peso * 0.3;
        break;

      case 'receita':
        if (valor > 100) nota += peso;
        else if (valor >= 50) nota += peso * 0.75;
        else nota += peso * 0.5;
        break;

      case 'ebitda':
        if (valor > 30) nota += peso;
        else if (valor >= 10) nota += peso * 0.75;
        else nota += peso * 0.5;
        break;

      case 'valuation':
        if (valor >= 100 && valor <= 300) nota += peso;
        else if (valor > 300) nota += peso * 0.75;
        else nota += peso * 0.5;
        break;
    }
  }

  return Math.round(nota);
}