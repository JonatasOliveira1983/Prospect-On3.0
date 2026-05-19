# 📜 RULES — Prospect-On 3.0 (Sniper Sovereignty)
## Documento de Contexto, Padrões e Regras do Sistema

> **Versão:** 3.2 (Sniper Sovereignty + DeepSeek) — Última atualização: 19 de Maio de 2026
> Este documento é a fonte da verdade sobre a arquitetura de **Agentes Sniper** e estabilidade do sistema. Obedece estritamente ao **Protocolo GSD (Get Shit Done)**.

---

## 🎯 1. IDENTIDADE E MISSÃO
**Prospect-On** é um Motor de Inteligência Comercial de alta performance. Sua missão é localizar, qualificar e gerar propostas premium para a **Otto Pinturas** através de extração automatizada de dados ricos via DOM Scraping e IA generativa.

---

## 🏗️ 2. ARQUITETURA SNIPER (13 Agentes Especialistas)

O sistema opera com agentes Python desacoplados, orquestrados pelo Manager Agent:

### Agentes Core (Pipeline Sniper-First)

1. **ManagerAgent** — Orquestrador central. Coordena o fluxo Sniper-First, mantém loop ativo até atingir meta de leads válidos.
2. **BrowserScoutAgent** — Motor principal de descoberta. Extrai do Google Maps via Playwright/DOM Scraping: Nome, Endereço, Telefone, E-mail, Instagram, Websites e capturas de fachada.
3. **HunterAgent** — Fallback geográfico via OpenStreetMap (usado apenas se o motor principal falhar).
4. **AnalystAgent** — Cérebro NLP. Calcula Score de Match Otto e Urgência de Pintura baseado em perfil do lead.
5. **SurveyorAgent** — Auditoria visual via Gemini 2.5 Flash. Conta torres, andares, estima m² de fachada e veta leads sem confirmação visual.
6. **ClosingAgent** — Consolida dados e gera propostas editoriais (padrão Diagram Design).
7. **ContactAgent** — Enriquecimento de canais de contato (telefone, e-mail, WhatsApp, site).
8. **LeadEnrichmentAgent** — Enriquecimento textual com DeepSeek Chat. Classifica porte/padrão e gera copy de prospecção personalizada.
9. **DemandScraperAgent** — Raspagem de demandas externas e licitações.
10. **GeosampaAgent** — Enriquecimento com idade do prédio e dados de IPTU (Foco São Paulo).

### Agentes de Suporte

11. **HealthAgent** — Monitoramento de saúde do sistema e disponibilidade dos agentes.
12. **ExtensionLauncher** — Lançador da extensão Chrome para captura manual de leads.
13. **ScoutAgent** — Scout auxiliar para tarefas de reconhecimento secundário.

### Engine de Inteligência
- **SmartEnrichment** — Pipeline de enriquecimento inteligente
- **Scoring** — Motor de cálculo de scores (Match Otto, Urgência, Potencial)
- **Pricing** — Motor de precificação de propostas
- **ROI** — Cálculo de retorno sobre investimento

---

## ⚡ 3. STACK TECNOLÓGICA & ESTABILIDADE

| Camada | Tecnologia | Porta | Observação |
|--------|-----------|-------|------------|
| Frontend | Next.js 16 (Turbopack) | 3000 | Padrão Slate-950 + Cyan-400 |
| Backend API | FastAPI (Python 3.10+) | **8002** | Uvicorn Worker + WebSocket |
| IA Primária | **DeepSeek Chat** (deepseek-chat) | cloud | Enriquecimento textual e copy |
| IA Secundária | **Google Gemini 2.5 Flash** | cloud | Auditoria visual de fachada |
| Discovery | **Playwright (DOM Scraping)** | local | Google Maps — fonte primária |
| Banco Dados | SQLite v7.0 (Bunker Mode) | local | Schema com contatos ricos |
| WhatsApp | Evolution API v2 | 8080 | Envio de mensagens (opcional) |
| Extensão | Chrome Extension (google-maps-scraper) | — | Captura manual de leads |

---

## 🛡️ 4. PROTOCOLOS DE DESENVOLVIMENTO (GSD)

### 4.1 Protocolo GSD (Get Shit Done)
Nenhuma linha de código deve ser escrita sem seguir o fluxo:
1. **/gsd-new:** Leitura de memória (.gsd/) e alinhamento de expectativas.
2. **/gsd-plan:** Criação do plano técnico no `implementation_plan.md`.
3. **/gsd-exec:** Execução focada na tarefa, sem distrações.
4. **/gsd-verify:** QA e testes contra critérios de aceitação.
5. **/gsd-ship:** Consolidação e atualização do STATE.md.

### 4.2 Estabilidade do Frontend
- **Zero Crash UI:** Usar optional chaining (`?.`) extensivamente. Leads mal formatados ou sem dados não podem quebrar a renderização.
- **Tailwind Only:** Estilização exclusiva via Tailwind CSS. Evitar CSS puro a menos que indispensável.
- **Componentes Resilientes:** Todo componente deve ter fallback visual para estados de erro e loading.

### 4.3 Soberania Sniper
- **Sniper-First:** O Playwright (Google Maps DOM) é a fonte primária de descoberta.
- **Hunter Fallback:** OpenStreetMap só é acionado se o BrowserScoutAgent falhar completamente.
- **Filtro de Elite:** Leads de imobiliárias, corretores, comércios e prestadores de serviço são automaticamente descartados.
- **Veto Visual:** Leads sem validação de fachada pelo SurveyorAgent não entram no pipeline.
- **Lead Rico:** Todo lead deve possuir o máximo de canais de contato (e-mail, telefone, site) sempre que possível.

### 4.4 Separação de Responsabilidades (Agentic Separation)
- Agentes não compartilham estado diretamente — comunicação via Manager Agent.
- Nenhuma "função Deus" (God Object) — cada agente tem responsabilidade única e bem definida.
- Dados fluem em pipeline unidirecional: Discovery → Enrichment → Scoring → Closing.

---

## 🎨 5. PADRÕES DE DESIGN (Premium Diagram)
- **Sistema Visual:** Inspirado no *Diagram Design* (Cathryn Lavery).
- **Estética:** Foco editorial, grid de 4px, tipografia limpa.
- **Cores:** Slate-950 (Fundo), Cyan-400 (Destaque), Emerald-400 (Success/Verified), Slate-400 (Muted).
- **Tipografia:** Instrument Serif (títulos), Geist Sans (corpo), Geist Mono (dados/técnico).
- **Bordas:** Máximo 6px de arredondamento — sem exageros visuais.

---

## 🚀 6. COMANDOS RÁPIDOS

### Iniciar Sistema
```powershell
# Terminal 1 — Backend
cd backend
python api.py

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Parar Sistema
```powershell
Get-Process -Name "python","node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Manutenção
- **Migração DB:** `cd backend ; python src/utils/migrate_v7.py`
- **Verificar DB:** `cd backend ; python check_db.py`
- **Teste Sniper:** `cd backend ; python test_sniper.py`
- **Verificar Uso de API:** `cd backend ; python check_usage.py`
- **Teste Gemini:** `cd backend ; python test_gemini.py`
- **Injetar Mock:** `cd backend ; python inject_mock.py`

### Health Check
- **Backend:** http://localhost:8002/docs
- **Frontend:** http://localhost:3000
- **System Health:** http://localhost:3000/api/system/health

---

*Atualizado em: 19 de Maio de 2026 — Versão 3.2*