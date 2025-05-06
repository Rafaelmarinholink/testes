async function salvarAnalise() {
  const arquivo = document.getElementById('evidencia').files[0];
  let evidencia = [];

  if (arquivo) {
    const formData = new FormData();
    formData.append('file', arquivo);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    if (result && result.url) {
      evidencia = [{ url: result.url, filename: result.filename }];
    }
  }

  const fields = {
    "Empresa DD": [document.getElementById('empresa').value],
    "Tipo de Diligencia": document.getElementById('tipo').value,
    "item analisado": document.getElementById('item').value,
    "Status da análise": document.getElementById('status').value,
    "Classificação de risco": document.getElementById('risco').value,
    "Comentarios": document.getElementById('comentario').value
  };

  if (evidencia.length > 0) {
    fields["Evidência"] = evidencia;
  }

  const dados = { fields };

  console.log("Payload para Airtable:", JSON.stringify(dados, null, 2));

  await fetch(`https://api.airtable.com/v0/${baseId}/${tableDD}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  listarAnalises(document.getElementById('empresa').value);
}
