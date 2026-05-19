# 📍 Google Maps Business Scraper

Extensão para Chrome que coleta dados de empresas listadas no Google Maps e exporta em `.csv`.

---

## 📦 Estrutura de Arquivos

```
google-maps-scraper/
├── manifest.json       # Configuração da extensão (Manifest V3)
├── popup.html          # Interface do usuário (popup)
├── popup.css           # Estilos da interface
├── popup.js            # Lógica do popup e exportação CSV
├── content.js          # Script de scraping (roda dentro do Maps)
├── background.js       # Service Worker (MV3)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 🚀 Instalação no Chrome (Modo Desenvolvedor)

1. Abra o Chrome e acesse: `chrome://extensions/`
2. Ative o **"Modo do desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta `google-maps-scraper`
5. A extensão aparecerá na barra de ferramentas do Chrome ✅

---

## 🎯 Como Usar

### Método 1 — Usar busca atual do Maps
1. Abra o [Google Maps](https://www.google.com/maps)
2. Faça uma busca (ex: *"pizzarias em Curitiba"*)
3. Aguarde os resultados aparecerem na barra lateral
4. Clique no ícone 📍 da extensão na barra do Chrome
5. Configure o **limite de empresas** e o **delay**
6. Clique em **"Iniciar Coleta"**
7. Aguarde a barra de progresso completar
8. Clique em **"Baixar CSV"**

### Método 2 — Busca personalizada via extensão
1. No campo **"Busca personalizada"** do popup, digite o que deseja buscar
   - Exemplo: `restaurantes em São Paulo`
   - Exemplo: `academias em Belo Horizonte`
2. A extensão navegará automaticamente para essa busca
3. Siga os passos 4–8 acima

---

## 📊 Dados Coletados

| Campo     | Descrição                        |
|-----------|----------------------------------|
| Nome      | Nome da empresa                  |
| Website   | URL do site oficial              |
| Telefone  | Número de telefone               |
| Email     | E-mail (se disponível no Maps)   |
| Endereço  | Endereço completo                |

> **Nota:** Campos não disponíveis são preenchidos com `"Sem info"`.

---

## ⚙️ Configurações

| Configuração       | Padrão | Descrição                                           |
|--------------------|--------|-----------------------------------------------------|
| Limite de empresas | 20     | Máximo de 100 empresas por sessão                   |
| Delay (ms)         | 1200ms | Tempo entre cada coleta (500ms–3000ms)              |

> ⚠️ **Delays menores** = coleta mais rápida, mas maior risco de detecção.  
> ✅ **Delays maiores** = mais seguro e respeitoso com os servidores do Google.

---

## 📁 Formato do CSV

```csv
Nome,Website,Telefone,Email,Endereço
"Pizzaria do João","https://pizzariadojoao.com.br","(11) 99999-0000","Sem info","Rua das Flores, 123 - São Paulo, SP"
```

- **Codificação:** UTF-8 com BOM (compatível com Excel)
- **Separador:** vírgula `,`
- **Delimitador de texto:** aspas duplas `"`
- **Quebra de linha:** CRLF (`\r\n`)

---

## 🔧 Solução de Problemas

### "Não foi possível conectar ao Google Maps"
- Recarregue a página do Maps (F5) e tente novamente.

### "Nenhuma lista de resultados encontrada"
- Certifique-se de que há resultados visíveis na barra lateral do Maps antes de iniciar.

### A coleta para sozinha
- O Google pode ter detectado atividade automatizada. Aumente o delay para 2000ms+.

### Dados faltando (muitos "Sem info")
- O Google atualiza frequentemente o DOM do Maps. Os seletores CSS no `content.js` podem precisar de atualização.

---

## ⚖️ Aviso Legal

> Esta extensão acessa dados do Google Maps via DOM scraping. O uso pode violar os  
> [Termos de Uso do Google Maps](https://maps.google.com/help/terms_maps/).  
>
> **Use apenas para fins legítimos e pessoais.**  
> Não use para coleta em massa, revenda de dados ou atividades comerciais sem autorização.  
> O autor não se responsabiliza pelo uso indevido desta ferramenta.

---

## 🛠️ Tecnologias

- JavaScript ES6+
- Chrome Extensions Manifest V3
- Chrome APIs: `tabs`, `scripting`, `storage`, `downloads`
- Content Scripts + MutationObserver
- CSV export com BOM UTF-8
