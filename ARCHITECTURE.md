# Arquitetura Prospect-On 3.2

Motor de Inteligência Comercial da **Otto Pinturas** — descoberta automatizada, qualificação e contato para prospecção de pintura predial e comercial.

---

## Stack Tecnológica

| Camada | Tecnologia | Porta | Observação |
|--------|-----------|-------|------------|
| **Frontend** | Next.js 16 (Turbopack), TypeScript, Tailwind CSS v3.4 | 3000 | Landing + Dashboard + CRM + Documentos |
| **Backend API** | FastAPI (Python 3.10+), Uvicorn | 8002 | REST + WebSocket |
| **IA** | **DeepSeek Chat** | cloud | Enriquecimento textual, scoring, copy |
| **Discovery** | **Playwright Stealth** (Chromium) | local | GetNinjas, oHub, Google Maps |
| **Discovery** | **Apify** (Google Maps Extractor) | cloud | 990+ leads de administradoras/síndicos |
| **Discovery** | **DuckDuckGo** | cloud | Editais públicos (gov.br/PNCP) |
| **Banco** | SQLite (`data/prospecton.db`) | local | Leads, leads_quentes, lead_messages, users |
| **WhatsApp** | Evolution API v2 | 8080 | Configurado (opcional) |

---

## Estrutura do Projeto

### Backend (`/backend`)
```
backend/
├── api.py                          # FastAPI — rotas REST
├── requirements.txt                # Dependências Python
├── data/
│   └── prospecton.db               # Banco SQLite
├── src/
│   ├── agents/
│   │   ├── pillar_a_agent.py       # Pilar A — Condomínios (GetNinjas)
│   │   ├── pillar_b_agent.py       # Pilar B — Editais Públicos (DuckDuckGo → gov.br)
│   │   └── pillar_c_agent.py       # Pilar C — Corporativo (oHub)
│   └── utils/
│       ├── database.py             # Interface SQLite
│       ├── apify_client.py         # Integração Apify Google Maps
│       └── logger.py               # Logger centralizado
```

### Frontend (`/frontend`)
```
frontend/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── (landing)/
│   │   └── components/
│   │       ├── HomeHeader.tsx      # Header com login
│   │       ├── HomeHero.tsx        # Hero com Ponte Estaiada SP + Spline 3D
│   │       ├── HomeServices.tsx    # Seção de serviços
│   │       ├── HomePortfolio.tsx   # Portfólio
│   │       ├── HomePartners.tsx    # Parceiros
│   │       ├── HomeFooter.tsx      # Footer
│   │       └── NeighborhoodInteractive.tsx  # Simulador de fachadas
│   ├── (system)/
│   │   ├── layout.tsx              # Layout autenticado (sidebar + mobile nav)
│   │   ├── dashboard/page.tsx      # Cockpit: zonas, bairros, filtros, importação Apify
│   │   ├── leads-quentes/page.tsx  # Leads Elite: favoritos + chat + criação manual
│   │   ├── documentos/page.tsx     # Documentos: upload/download/lista
│   │   └── usuarios/page.tsx       # Gerenciamento de usuários (admin)
│   └── components/
│       ├── Sidebar.tsx             # Sidebar desktop + badge de mensagens
│       ├── LeadTable.tsx           # Tabela paginada de leads
│       ├── LeadDetailModal.tsx     # Modal de detalhes + CRM + chat
│       └── ChatPanel.tsx           # Chat em tempo real por lead
├── lib/
│   └── api.ts                      # Cliente API
└── public/
    └── AquivosOtto/
        ├── Logo/                   # Logos da Otto
        ├── img/                    # Imagens (ponte-estaiada.png)
        └── documentos/             # PDFs de documentos
```

---

## Fluxos Principais

### 1. Descoberta de Leads

```
Dashboard → Seleciona pilares → Dispara scan
         ↓
Pilar A (GetNinjas) ─────┐
Pilar B (DuckDuckGo) ────┤ asyncio.gather
Pilar C (oHub) ──────────┘
         ↓
Leads qualificados → SQLite → Dashboard
```

### 2. Importação Apify (Google Maps)

```
Dashboard → Botão "Importar do Apify"
         ↓
ApifyClient.run_google_maps_scraper(regions)
         ↓
990+ leads de administradoras/síndicos → SQLite
```

### 3. CRM — Chat em Tempo Real

```
Leads Elite → Seleciona lead → Abre chat
            ↓
Envia mensagem → POST /api/messages/{leadId}
            ↓
Backend salva em lead_messages → Polling GET a cada 5s
            ↓
Admin recebe badge de não lidos no sidebar
```

### 4. Gestão de Documentos

```
Página Documentos → Lista PDFs do diretório
                  ↓
Admin: Upload/Deletar | Todos: Download/Visualizar/Imprimir
```

---

## Banco de Dados (SQLite)

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `leads` | Leads descobertos via scraping (Pilares A/B/C) |
| `leads_quentes` | Leads qualificados + favoritos + criação manual |
| `lead_messages` | Mensagens de chat por lead |
| `users` | Usuários do sistema |

### lead_messages (Chat)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | ID da mensagem |
| `lead_id` | INTEGER | ID do lead (leads ou leads_quentes) |
| `user_id` | INTEGER | ID do usuário que enviou |
| `user_name` | TEXT | Nome do usuário |
| `message` | TEXT | Conteúdo da mensagem |
| `created_at` | DATETIME | Data/hora do envio |
| `is_read` | BOOLEAN | Lida ou não |

---

## Regras de Chat

- Cada lead tem seu próprio thread de mensagens
- Mensagens estilo WhatsApp com separadores de data
- Deletar: apenas suas próprias mensagens
- **Admin** pode conversar em qualquer lead
- **Vendedor** só conversa em leads favoritos
- Badge de não lidos: admin vê todos, vendedor vê apenas seus favoritos
- Polling a cada 5 segundos

---

## Permissões

| Ação | Admin | Vendedor |
|------|-------|----------|
| Ver dashboard | ✅ | ✅ |
| Ver leads | ✅ | ✅ |
| Favoritar lead | ✅ | ✅ |
| Chat em qualquer lead | ✅ | ❌ (apenas favoritos) |
| Criar lead manual | ✅ | ✅ |
| Deletar lead | ✅ | ❌ |
| Upload documento | ✅ | ❌ |
| Deletar documento | ✅ | ❌ |
| Ver/baixar documento | ✅ | ✅ |
| Gerenciar usuários | ✅ | ❌ |

---

## Mobile Responsivo

- **Header mobile**: logo (linka para home)
- **Nav inferior**: Cockpit, Elite, Docs, Vendedores (admin), Sair
- **Sidebar**: oculta no mobile, substituída pela nav inferior
- **Touch targets**: mínimo 44px
- **Landing**: 3D oculto no mobile, conteúdo adaptado

---

## APIs Externas

| API | Uso | Status |
|-----|-----|--------|
| **DeepSeek Chat** | Enriquecimento textual, scoring, copy | ✅ Ativo |
| **Apify** | Google Maps Extractor (leads administradoras) | ✅ Ativo |
| **Playwright Stealth** | GetNinjas, oHub, Google Search | ✅ Ativo |
| **DuckDuckGo** | Busca de editais públicos | ✅ Ativo |
| **Evolution API** | WhatsApp (configurado) | ⏳ Opcional |

---

*Atualizado em: Junho 2026 — Versão 3.2*
