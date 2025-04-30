import { buscarEmpresas } from './airtable.js';

document.getElementById('empresa-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const campos = document.querySelectorAll('#empresa-form input[required]');
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

  const data = {
    fields: {
      "Nome da Empresa": document.getElementById('nome').value,
      "Ticker": document.getElementById('ticker').value,
      "Receita Anual (USD)": parseFloat(document.getElementById('receita').value),
      "EBITDA (USD)": parseFloat(document.getElementById('ebitda').value),
      "Valuation (USD)": parseFloat(document.getElementById('valuation').value),
      "Crescimento YoY": parseFloat(document.getElementById('crescimento_yoy').value),
      "Margem Bruta": parseFloat(document.getElementById('margem_bruta').value),
      "S&M": parseFloat(document.getElementById('sm').value),
      "SG&A": parseFloat(document.getElementById('sga').value),
      "Consistência Crescimento YoY": document.getElementById('consistencia_yoy').value,
      "Notas": document.getElementById('notas').value
    }
  };

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

buscarEmpresas().then(empresas => carregarTopEmpresas(empresas));