// Script para index.html
import { buscarEmpresas } from './airtable.js';

document.getElementById('empresa-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const campos = document.querySelectorAll('#empresa-form input[required]');
  let valido = true;

  campos.forEach(campo => {
    if ((campo.type === 'number' && !campo.value && campo.value !== '0') || 
        (campo.type === 'text' && !campo.value.trim())) {
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
    consistencia_yoy: parseFloat(document.getElementById('consistencia').value),
    margem_bruta: parseFloat(document.getElementById('margem_bruta').value),
    ebitda: parseFloat(document.getElementById('ebitda').value),
    receita: parseFloat(document.getElementById('receita').value),
    valuation: parseFloat(document.getElementById('valuation').value)
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
      "Margem Bruta": dados.margem_bruta,
      "Consistência Crescimento YoY": dados.consistencia_yoy,
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

function calcularRating(dados) {
  const kpis = [
    { chave: 'crescimento_yoy', peso: 20, nota: getNota(dados.crescimento_yoy, [0,10,25], [60,80,100]) },
    { chave: 'consistencia_yoy', peso: 15, nota: getNota(dados.consistencia_yoy, [0,5,10], [60,80,100]) },
    { chave: 'margem_bruta', peso: 10, nota: getNota(dados.margem_bruta, [0,30,50], [60,80,100]) },
    { chave: 'ebitda', peso: 10, nota: getNota(dados.ebitda, [0,10,30], [60,80,100]) },
    { chave: 'receita', peso: 10, nota: getNota(dados.receita, [0,50,100], [60,80,100]) },
    { chave: 'valuation', peso: 5, nota: getNota(dados.valuation, [0,100,200], [60,80,100]) },
  ];

  const preenchidos = kpis.filter(kpi => !isNaN(dados[kpi.chave]));
  const pesoTotal = preenchidos.reduce((acc, kpi) => acc + kpi.peso, 0);

  const rating = preenchidos.reduce((acc, kpi) => {
    const pesoNormalizado = (kpi.peso / pesoTotal);
    return acc + (kpi.nota * pesoNormalizado);
  }, 0);

  return Math.round(rating);
}

function getNota(valor, limites, notas) {
  if (isNaN(valor)) return 0;
  if (valor <= limites[0]) return notas[0];
  if (valor <= limites[1]) return notas[1];
  return notas[2];
}

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
