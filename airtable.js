// script.js
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

  let filtradas = todasEmpresas.filter(e => e.nome.toLowerCase().includes(texto));

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
