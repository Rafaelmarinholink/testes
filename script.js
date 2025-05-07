import { buscarEmpresas } from './airtable.js';

function calcularRating(dados) {
  const pesos = {
    crescimento_yoy: 10,
    margem_bruta: 5,
    sm: 5,
    sga: 5,
    consistencia_crescimento: 15,
    ebitda: 30,
    receita: 30
  };

  const camposNumericos = ['crescimento_yoy', 'margem_bruta', 'sm', 'sga', 'ebitda', 'receita'];
  const preenchidos = camposNumericos.filter(key =>
    dados[key] !== null && dados[key] !== '' && !isNaN(dados[key])
  );

  if (['Crescimento positivo', 'Declínio acentuado'].includes(dados.consistencia_crescimento)) {
    preenchidos.push('consistencia_crescimento');
  }

  const pesoTotal = preenchidos.reduce((acc, key) => acc + pesos[key], 0);
  const redistribuido = {};
  preenchidos.forEach(key => {
    redistribuido[key] = (pesos[key] / pesoTotal) * 100;
  });

  let nota = 0;

  if ('crescimento_yoy' in redistribuido) {
    if (dados.crescimento_yoy >= 20) nota += redistribuido.crescimento_yoy;
    else if (dados.crescimento_yoy >= 5) nota += redistribuido.crescimento_yoy * 0.7;
    else if (dados.crescimento_yoy > 0) nota += redistribuido.crescimento_yoy * 0.5;
  }

  if ('margem_bruta' in redistribuido) {
    if (dados.margem_bruta >= 60) nota += redistribuido.margem_bruta;
    else if (dados.margem_bruta >= 40) nota += redistribuido.margem_bruta * 0.7;
    else if (dados.margem_bruta >= 20) nota += redistribuido.margem_bruta * 0.5;
  }

  if ('sm' in redistribuido) {
    if (dados.sm <= 20) nota += redistribuido.sm;
    else if (dados.sm <= 40) nota += redistribuido.sm * 0.7;
  }

  if ('sga' in redistribuido) {
    if (dados.sga <= 25) nota += redistribuido.sga;
    else if (dados.sga <= 35) nota += redistribuido.sga * 0.7;
  }

  if ('consistencia_crescimento' in redistribuido) {
    if (dados.consistencia_crescimento === 'Crescimento positivo') nota += redistribuido.consistencia_crescimento;
    else if (dados.consistencia_crescimento === 'Declínio acentuado') nota += redistribuido.consistencia_crescimento * 0.3;
  }

  if ('ebitda' in redistribuido && dados.ebitda > 0) nota += redistribuido.ebitda;
  if ('receita' in redistribuido && dados.receita > 100) nota += redistribuido.receita;
  else if ('receita' in redistribuido) nota += redistribuido.receita * 0.7;

  return Math.round(Math.min(nota, 100));
}

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
    consistencia_crescimento: document.getElementById('consistencia_crescimento').value,
    ebitda: parseFloat(document.getElementById('ebitda').value),
    receita: parseFloat(document.getElementById('receita').value)
  };

  const ratingCalculado = calcularRating(dados);

  const data = {
    fields: {
      "Nome da Empresa": document.getElementById('nome').value,
      "Ticker": document.getElementById('ticker').value,
      "Receita Anual (USD)": dados.receita,
      "EBITDA (USD)": dados.ebitda,
      "Valuation (USD)": parseFloat(document.getElementById('valuation').value),
      "Crescimento YoY": dados.crescimento_yoy / 100,
      "Margem Bruta": dados.margem_bruta / 100,
      "S&M": dados.sm / 100,
      "SG&A": dados.sga / 100,
      "Consistência Crescimento YoY": dados.consistencia_crescimento,
      "Notas": document.getElementById('notas').value,
      "Rating": ratingCalculado
    }
  };

  const response = await fetch("https://api.airtable.com/v0/appaq7tR3vt9vrN6y/Empresas", {
    method: 'POST',
    headers: {
      Authorization: "Bearer patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const erro = await response.json();
    console.error("Erro ao enviar para Airtable:", erro);
  }

  const empresas = await buscarEmpresas();
  carregarTopEmpresas(empresas);
  e.target.reset();
});

async function buscarStatusDD(empresaId) {
  const baseId = 'appaq7tR3vt9vrN6y';
  const tableDD = 'Due Diligence';
  const headers = {
    Authorization: "Bearer patAOGNbJyOQrbHPB.22dd0a4309dc09867d31612922b5616a0a83965352599929e3566187a84607c6"
  };

  const url = `https://api.airtable.com/v0/${baseId}/${tableDD}?filterByFormula=ARRAYJOIN({Empresa DD}) = "${empresaId}"`;
  const res = await fetch(url, { headers });
  const data = await res.json();

  const registros = data.records;
  const total = registros.length;

  const riscos = registros.map(r => r.fields["Classificação de risco"] || "").join(" ");
  let risco = "Nenhum";
  if (riscos.includes("Alto")) risco = "Alto";
  else if (riscos.includes("Médio")) risco = "Médio";
  else if (riscos.includes("Baixo")) risco = "Baixo";

  let quantidadeTexto = "Nenhum";
  if (total === 1) quantidadeTexto = "Uma diligência";
  else if (total === 2) quantidadeTexto = "Duas diligências";
  else if (total > 2) quantidadeTexto = `${total} diligências`;

  return `${quantidadeTexto} – ${risco}`;
}

function carregarTopEmpresas(empresas) {
  const top3 = empresas
    .filter(emp => emp.rating !== undefined && emp.rating !== null)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const listaTop = document.getElementById('top-empresas');
  listaTop.innerHTML = '';

  top3.forEach(async emp => {
    const statusTexto = await buscarStatusDD(emp.id);

    let cor = '#ccc';
    if (statusTexto.includes('Alto')) cor = '#ef4444';
    else if (statusTexto.includes('Médio')) cor = '#facc15';
    else if (statusTexto.includes('Baixo')) cor = '#22c55e';

    const card = document.createElement('div');
    card.className = 'empresa-card';
    card.innerHTML = `
      <strong>${emp.nome}</strong><br>
      Rating: ${emp.rating ?? 'N/A'}<br>
      Receita: R$ ${Number(emp.receita).toLocaleString('pt-BR')} Milhões<br>
      <div class="badge-due" style="background-color:${cor}33; color:${cor};">Due Diligence: ${statusTexto}</div>
      <div class="botao-duplo">
        <button onclick="window.location.href='empresa.html?id=${emp.id}'">Ver Análise</button>
        <button onclick="window.location.href='due_diligence.html?id=${emp.id}'">Due Diligence</button>
      </div>
    `;
    listaTop.appendChild(card);
  });
}

buscarEmpresas().then(empresas => carregarTopEmpresas(empresas));
