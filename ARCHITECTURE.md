# 🏗️ Arquitetura Prospect-On 3.0 (Sniper Sovereignty)

Este documento descreve a arquitetura técnica, os fluxos de dados e as integrações do sistema **Prospect-On**, unificado sob a soberania do motor Sniper.

---

## 🚀 1. Stack Tecnológica

O sistema opera em uma estrutura de microsserviços desacoplados e orquestração de agentes especialistas.

| Camada | Tecnologia | Porta | Observação |
|--------|-----------|-------|------------|
| **Frontend** | Next.js 16 (Turbopack), TypeScript, Tailwind CSS v3.4 | 3000 | Landing Page + Dashboard Glass-Premium |
| **Backend API** | FastAPI (Python 3.10+), Uvicorn | 8002 | REST + WebSocket para logs ativos |
| **IA Primária** | **DeepSeek Chat** (deepseek-chat) | cloud | Qualificação, enriquecimento textual e copy de prospecção |
| **IA Secundária** | **Google Gemini 2.5 Flash** | cloud | Auditoria visual de fachada (Surveyor) e análise de imagens |
| **Discovery Engine** | **BrowserScoutAgent** (Playwright + DOM Scraping) | local | Extração gratuita do Google Maps |
| **Banco de Dados** | SQLite v7.0 (Bunker Mode) | local | Schema expandido com contatos ricos (e-mail, social, booking) |

---

## 📁 2. Estrutura do Projeto (v3.2)

### Backend (`/backend`)
```
backend/
├── api.py                          # Servidor FastAPI — rotas REST e WebSocket
├── main.py                         # Entry point legado (radar)
├── auto_prospect.py                # Prospecção autônoma (Auto-Pilot V3)
├── requirements.txt                # Dependências Python
├── .env                            # Chaves de API e configurações
├── data/
│   ├── prospecton.db               # Banco SQLite v7.0
│   └── images/                     # Capturas de fachada (.jpg)
├── reports/                        # Relatórios PDF gerados
├── static/                         # Arquivos estáticos servidos
└── src/
    ├── agents/                     # Agentes especialistas (13 agentes)
    │   ├── manager_agent.py        # Orquestrador central Sniper-First
    │   ├── browser_scout_agent.py  # Motor principal — Playwright/Google Maps DOM
    │   ├── hunter_agent.py         # Fallback geográfico via OpenStreetMap
    │   ├── analyst_agent.py        # Cérebro NLP — qualificação e Match Otto
    │   ├── surveyor_agent.py       # Auditoria visual — contagem de torres/andares
    │   ├── closing_agent.py        # Consolidação e geração de propostas
    │   ├── contact_agent.py        # Enriquecimento de contatos
    │   ├── lead_enrichment_agent.py# Enriquecimento com DeepSeek
    │   ├── demand_scraper_agent.py # Raspagem de demandas externas
    │   ├── geosampa_agent.py       # Dados da prefeitura de SP (IPTU, idade)
    │   ├── health_agent.py         # Monitoramento de saúde do sistema
    │   ├── extension_launcher.py   # Lançador da extensão Chrome
    │   └── scout_agent.py          # Scout auxiliar
    ├── engine/                     # Motor de inteligência
    │   ├── smart_enrichment.py     # Enriquecimento inteligente
    │   ├── scoring.py              # Cálculo de scores
    │   ├── pricing.py              # Precificação
    │   └── roi.py                  # Cálculo de ROI
    └── utils/                      # Utilitários
        ├── database.py             # Interface SQL v7.0
        ├── vision_analyzer.py      # Análise de imagens via Gemini
        ├── deepseek_client.py      # Cliente da API DeepSeek
        ├── places_client.py        # Cliente Google Places (legado/fallback)
        ├── report_generator.py     # Gerador de relatórios PDF
        ├── usage_monitor.py        # Monitor de uso de APIs
        ├── webhook_client.py       # Cliente webhook (WhatsApp/Evolution)
        ├── diagram_templates.py    # Templates de diagramas
        ├── csv_processor.py        # Processamento CSV
        ├── logger.py               # Logger centralizado
        ├── migrate_db.py           # Migração de banco de dados
        └── migrate_v7.py           # Migração para schema v7.0
```

### Frontend (`/frontend`)
```
frontend/
├── package.json                    # Next.js 16 + dependências
├── next.config.ts                  # Configuração Turbopack
├── tailwind.config.ts              # Tema Slate-950 + Cyan-400
├── tsconfig.json                   # TypeScript strict
└── app/
    ├── layout.tsx                  # Root layout
    ├── page.tsx                    # Landing Page (raiz)
    ├── globals.css                 # Estilos globais Glass-Premium
    ├── (landing)/                  # Grupo: Landing Page
    │   └── components/
    │       ├── HomeHeader.tsx      # Header com navegação
    │       ├── HomeHero.tsx        # Hero section
    │       ├── HomeServices.tsx    # Serviços Otto Pinturas
    │       ├── HomePillars.tsx     # Pilares/Diferenciais
    │       ├── HomePortfolio.tsx   # Portfólio de obras
    │       ├── HomePartners.tsx    # Parceiros
    │       ├── NeighborhoodInteractive.tsx  # Quadra Otto interativa
    │       └── HomeFooter.tsx      # Footer
    ├── (system)/                   # Grupo: Dashboard (autenticado)
    │   ├── layout.tsx              # Sidebar + layout do sistema
    │   ├── dashboard/              # Página inicial do dashboard
    │   ├── leads-quentes/          # Leads quentes (tabela Sniper)
    │   ├── mapa-radar/             # Mapa radar de prospecção
    │   ├── comissoes/              # Gestão de comissões
    │   ├── relatorios/             # Relatórios e PDFs
    │   └── configuracoes/          # Configurações do sistema
    ├── components/                 # Componentes compartilhados
    │   ├── Sidebar.tsx             # Navegação lateral
    │   ├── LeadTable.tsx           # Tabela de leads
    │   ├── LeadDetailModal.tsx     # Modal de detalhe do lead
    │   ├── VistoriaManualModal.tsx # Modal de vistoria técnica
    │   ├── AgentConsole.tsx        # Console de logs dos agentes
    │   ├── UsageIndicator.tsx      # Indicador de uso de API
    │   ├── SystemHealth.tsx        # Monitor de saúde do sistema
    │   ├── ReportViewer.tsx        # Visualizador de relatórios
    │   └── StatCard.tsx            # Card de estatísticas
    ├── api/                        # API Routes (Next.js)
    │   ├── analyze-lead/           # Análise de lead individual
    │   ├── leads/                  # CRUD de leads
    │   ├── scan/                   # Gatilho de scan
    │   ├── status/                 # Status do sistema
    │   ├── system/health/          # Health check
    │   └── usage/                  # Métricas de uso
    └── condo/                      # Páginas públicas de condomínio
        └── [slug]/                 # Página dinâmica por slug
```

---

## ⚡ 3. Fluxo de Inteligência Sniper (Persistent Hunter Pipeline v7.1)

O pipeline prioriza **Alta Fidelidade** sobre quantidade:

1. **Persistent Discovery**: `BrowserScoutAgent` busca até 50 candidatos no Google Maps via DOM Scraping (Playwright). Aplica filtro agressivo de "Negativos" (pula imobiliárias, corretores, comércios) em tempo real.
2. **Visual Proof (Fachada)**: Captura da melhor foto da fachada usando múltiplos seletores CSS.
3. **IA Veto Audit**: `SurveyorAgent` (Gemini 2.5 Flash) analisa a foto. Se a IA não confirmar que é um prédio/condomínio real, o lead é **vetado** e descartado.
4. **Context Enrichment**: `LeadEnrichmentAgent` usa DeepSeek Chat para qualificar o lead, classificar porte/padrão e gerar copy de prospecção personalizada.
5. **Scoring**: `AnalystAgent` calcula o Match Otto e Urgency Score baseado em sinais de desgaste, idade do prédio (Geosampa) e potencial comercial.
6. **Persistence & Target Goal**: `ManagerAgent` mantém loop ativo até atingir a meta de leads válidos.
7. **Dashboard Rendering**: Leads auditados aparecem no dashboard com score real e diagnóstico completo.

---

## 🛡️ 4. Protocolos de Estabilidade & Filtros

- **Camada 1 (Google Places API)**: API legada — atualmente retorna `REQUEST_DENIED`. Mantida como fallback.
- **Camada 2 (Playwright DOM Scraping)**: Fonte primária ativa. Extrai dados 100% gratuitos do Google Maps.
- **Filtro de Elite**: Descarte automático de >20 categorias de "leads lixo" (Imobiliárias, Padarias, Hospitais).
- **Veto de Auditoria**: Leads sem imagem ou com imagens não validadas pela IA não entram no banco "Quente".
- **Bunker Mode**: Migrações de schema preservam dados existentes. Backup antes de qualquer alteração estrutural.

---

## 🔌 5. APIs Externas Integradas

| API | Uso | Status |
|-----|-----|--------|
| **DeepSeek Chat** | Enriquecimento textual, scoring, copy de vendas | ✅ Ativo |
| **Google Gemini 2.5 Flash** | Auditoria visual de fachada (Surveyor) | ✅ Ativo |
| **Google Maps (Places Legacy)** | Busca de estabelecimentos | ❌ REQUEST_DENIED |
| **Brasil API (CNPJ)** | Consulta de CNPJ | ⏳ Configurado |
| **Evolution API (WhatsApp)** | Envio de mensagens WhatsApp | ⏳ Configurado |

---

## 🖥️ 6. Como Iniciar o Sistema

### Backend (FastAPI)
```powershell
cd backend
pip install -r requirements.txt
python api.py
# Servidor em: http://localhost:8002
# Swagger UI: http://localhost:8002/docs
```

### Frontend (Next.js)
```powershell
cd frontend
npm install
npm run dev
# Servidor em: http://localhost:3000
```

### Parar os Servidores
```powershell
Get-Process -Name "python","node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 📊 7. Rotas da API (Backend)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health check do sistema |
| `POST` | `/api/scan` | Inicia scan Sniper |
| `POST` | `/api/analyze-lead` | Analisa lead individual |
| `GET` | `/api/leads` | Lista todos os leads |
| `GET` | `/api/leads/{id}` | Detalhe do lead |
| `GET` | `/api/leads/hot` | Leads quentes (qualificados) |
| `GET` | `/api/reports/{filename}` | Download de relatório PDF |
| `GET` | `/api/images/{filename}` | Download de imagem de fachada |
| `GET` | `/api/usage` | Métricas de uso das APIs |
| `WS` | `/ws/logs` | WebSocket para logs em tempo real |

---

*Atualizado em: 19 de Maio de 2026 — Versão 3.2 (Sniper Sovereignty + DeepSeek Integration)*