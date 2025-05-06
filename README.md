# 📊 Saber Capital

Saber Capital é um aplicativo web desenvolvido como parte do desafio da disciplina **Concentration Seminar**, com foco em Search Funds e análise de empresas de microcap do setor de educação.

---

## 🚀 Objetivo

Permitir que fundos de busca (Search Funds) tomem decisões mais inteligentes e ágeis com base em dados estruturados sobre empresas-alvo. A aplicação funciona como um **scanner de oportunidades**, avaliando indicadores financeiros, sinais de crescimento e alertas de risco.

---

## 🧠 Funcionalidades Desenvolvidas nesta Semana

### ✅ Página Inicial (`index.html`)
- Cadastro de novas empresas com os seguintes campos:
  - Nome da empresa
  - Ticker
  - Receita Anual (em milhões de dólares)
  - EBITDA (em milhões de dólares)
  - Valuation (em milhões de dólares)
  - Notas adicionais
- Busca em tempo real por nome da empresa
- Ordenação dinâmica por Nome, Valuation, EBITDA ou Receita
- Lista interativa de empresas cadastradas
- Integração total com a base Airtable via API

---

### ✅ Análise Individual (`empresa.html`)
- Exibe dados financeiros da empresa selecionada
- Calcula:
  - Margem EBITDA (%)
  - Múltiplo EV/EBITDA
- Compara indicadores com benchmarks do setor educacional
- Gera diagnóstico de saúde financeira automatizado com base nos dados
- Gráficos horizontais comparando empresa e benchmark
- Botão para voltar à lista ou iniciar uma comparação

---

### ✅ Comparação de Empresas (`comparar.html`)
- Permite comparar duas empresas lado a lado
- Mostra gráficos verticais individuais para:
  - Receita
  - EBITDA
  - Valuation
  - Margem EBITDA
- Avaliação automatizada da saúde financeira
- Interface interativa com:
  - Busca da segunda empresa
  - Botão para inverter empresas
  - Botão para iniciar nova comparação

---

## 🖼 Identidade Visual
- Fonte personalizada: **Archivo Black**
- Logo institucional aplicado no topo de todas as páginas
- Favicon personalizado
- Cores inspiradas em tons institucionais (azul escuro, branco e ciano)

---

## 🔗 Tecnologias Utilizadas

- **HTML, CSS e JavaScript (puro)**
- **Airtable API** para armazenamento e leitura de dados
- **Vercel** para deploy
- **GitHub** para versionamento
- **Google Fonts** para tipografia
- **canva** para sitemap e wireframe

---

## 📁 Estrutura de Arquivos
/saber-capital/ ├── index.html ├── empresa.html ├── comparar.html ├── style.css ├── airtable.js ├── favicon.ico ├── logo bg removed.png

---

## 🛠️ Próximos Passos
- Adicionar inteligência artificial com análise baseada em texto
- Implementar filtros avançados e alertas automáticos
- Exportação de relatórios em PDF
- Dashboard resumido por métricas
- segurança com cadastro e login

---

## 👨‍💻 Desenvolvido por
Rafael Marinho  CEO e CTO do Saber capital

