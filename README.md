# Prospect-On 3.2 — Motor de Inteligência Comercial

**Otto Pinturas** — Automação de descoberta, qualificação e contato para prospecção de pintura predial e comercial.

---

## Como Rodar

### Backend (FastAPI — Porta 8002)

```powershell
cd backend
pip install -r requirements.txt
python api.py
```

- API: http://localhost:8002
- Swagger: http://localhost:8002/docs

### Frontend (Next.js 16 — Porta 3000)

```powershell
cd frontend
npm install
npm run dev
```

- Landing Page: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Leads Elite: http://localhost:3000/leads-quentes
- Documentos: http://localhost:3000/documentos

### Parar Servidores

```powershell
Get-Process -Name "python","node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Funcionalidades

### Pilares de Descoberta
| Pilar | Fonte | O que detecta |
|-------|-------|---------------|
| **A — Condomínios** | GetNinjas (Playwright) | Atas de assembleia, fundos de obra, cotações de fachada |
| **B — Editais Públicos** | DuckDuckGo → gov.br/PNCP | Pregões eletrônicos, licitações, diários oficiais |
| **C — Corporativo** | oHub (Playwright) | Vagas de pintor, facilities, cotações corporativas |
| **Google Maps** | Apify (Google Maps Extractor) | Administradoras, síndicos, construtoras — 990+ leads |

### Dashboard (Cockpit)
- 5 zonas geográficas: Sul, Norte, Leste, Oeste, Centro
- 559 bairros mapeados com contadores
- Filtros por bairro, pesquisa, categorias
- Importação de leads via Apify (Google Maps)
- Indicadores: total leads, leads quentes, mensagens não lidas, matches

### Leads Elite
- Favoritos com chat em tempo real (bate-papo) por lead
- Criação manual de leads (auto-favorita)
- Exclusão de leads
- Badge de mensagens não lidas

### CRM — Chat em Tempo Real
- Cada lead tem seu próprio thread de mensagens
- Mensagens estilo WhatsApp com separadores de data
- Deletar apenas suas próprias mensagens
- Badge de não lidos no sidebar (admin vê todos, vendedor vê apenas favoritos)
- Polling a cada 5 segundos

### Documentos
- Upload/download/visualização/impressão de PDFs
- Diretório: `public/AquivosOtto/documentos/`
- Apenas admin pode fazer upload/deletar
- Todos podem visualizar/baixar/imprimir

### Landing Page
- Background: Ponte Estaiada SP (foto real)
- Elemento 3D Spline animado
- Efeitos neon glow
- Login mobile com formulário flutuante

### Usuários
| Nome | Perfil |
|------|--------|
| Jonatas Oliveira | admin |
| Joao Otto | admin |
| Nico Otto | admin |
| Carlos Cabral | vendedor |

---

## Stack Tecnológica

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| Frontend | Next.js 16 (Turbopack), TypeScript, Tailwind CSS | 3000 |
| Backend | FastAPI (Python 3.10+), Uvicorn | 8002 |
| Banco | SQLite (`data/prospecton.db`) | local |
| IA | DeepSeek Chat | cloud |
| Scraping | Playwright Stealth + Apify | cloud/local |
| WhatsApp | Evolution API v2 (configurado) | 8080 |

---

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/leads` | Lista todos os leads (leads + leads_quentes) |
| `POST` | `/api/leads` | Cria lead manual |
| `PUT` | `/api/leads/{id}` | Atualiza lead |
| `DELETE` | `/api/leads/{id}` | Deleta lead |
| `GET` | `/api/leads/hot` | Leads quentes |
| `POST` | `/api/favorites/toggle` | Toggle favorito |
| `GET` | `/api/favorites` | Lista favoritos |
| `POST` | `/api/crm/{leadId}` | Salva notas CRM |
| `GET` | `/api/messages/{leadId}` | Mensagens do chat |
| `POST` | `/api/messages/{leadId}` | Envia mensagem |
| `GET` | `/api/messages/unread` | Contagem de não lidos |
| `GET` | `/api/documents` | Lista documentos |
| `POST` | `/api/documents/upload` | Upload de documento |
| `DELETE` | `/api/documents/{filename}` | Deleta documento |
| `POST` | `/api/apify/import` | Importa leads do Apify |
| `GET` | `/api/health` | Health check |

---

## Configuração

| Variável | Descrição |
|----------|-----------|
| `DEEPSEEK_API_KEY` | API DeepSeek (enriquecimento textual) |
| `APIFY_TOKEN` | Token Apify (Google Maps Extractor) |

---

*Versão 3.2 — Junho 2026*
