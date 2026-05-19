# 📍 ESTADO ATUAL DO PROJETO (STATE)

## Versão Atual: 3.2 (Sniper Sovereignty + DeepSeek)

## Resumo
O sistema Prospect-On está totalmente funcional na versão 3.2. O motor Sniper utiliza DOM Scraping via Playwright como fonte primária de descoberta, com enriquecimento textual via **DeepSeek Chat** e auditoria visual de fachada via **Google Gemini 2.5 Flash**.

---

## Componentes Ativos

### Backend (FastAPI — Porta 8002)
| Componente | Status | Observação |
|-----------|--------|------------|
| `api.py` | ✅ Ativo | Servidor REST + WebSocket (`/ws/logs`) |
| `BrowserScoutAgent` | ✅ Ativo | Playwright DOM Scraping — fonte primária |
| `HunterAgent` | ✅ Ativo | Fallback OpenStreetMap |
| `SurveyorAgent` | ✅ Ativo | Gemini 2.5 Flash — auditoria de fachada |
| `AnalystAgent` | ✅ Ativo | Qualificação e Match Otto |
| `LeadEnrichmentAgent` | ✅ Ativo | DeepSeek Chat — copy e enriquecimento |
| `ClosingAgent` | ✅ Ativo | Consolidação e propostas |
| `ContactAgent` | ✅ Ativo | Enriquecimento de contatos |
| `DemandScraperAgent` | ✅ Ativo | Demandas externas |
| `GeosampaAgent` | ✅ Ativo | Dados SP (IPTU, idade) |
| `HealthAgent` | ✅ Ativo | Monitoramento |
| `ManagerAgent` | ✅ Ativo | Orquestrador central |
| `ExtensionLauncher` | ✅ Ativo | Extensão Chrome |
| `ScoutAgent` | ✅ Ativo | Scout auxiliar |
| Banco SQLite v7.0 | ✅ Ativo | `data/prospecton.db` |
| Migração v7 | ✅ Concluído | Schema expandido com contatos ricos |

### Frontend (Next.js 16 — Porta 3000)
| Página/Componente | Status | Observação |
|-------------------|--------|------------|
| Landing Page (`/`) | ✅ Ativo | Hero + Quadra Otto interativa |
| Dashboard (`/dashboard`) | ✅ Ativo | Visão geral do sistema |
| Leads Quentes (`/leads-quentes`) | ✅ Ativo | Tabela Sniper com filtros |
| Mapa Radar (`/mapa-radar`) | ✅ Ativo | Mapa de prospecção |
| Comissões (`/comissoes`) | ✅ Ativo | Gestão de comissões |
| Relatórios (`/relatorios`) | ✅ Ativo | Relatórios e PDFs |
| Configurações (`/configuracoes`) | ✅ Ativo | Configurações do sistema |
| `Sidebar` | ✅ Ativo | Navegação lateral |
| `LeadTable` | ✅ Ativo | Tabela com dados ricos |
| `LeadDetailModal` | ✅ Ativo | Modal de detalhe |
| `AgentConsole` | ✅ Ativo | WebSocket logs |
| `VistoriaManualModal` | ✅ Ativo | Vistoria técnica manual |
| `SystemHealth` | ✅ Ativo | Monitor de saúde |
| `UsageIndicator` | ✅ Ativo | Indicador de uso de API |
| API Routes | ✅ Ativo | Proxy para backend |

---

## APIs Externas

| API | Status | Uso |
|-----|--------|-----|
| **DeepSeek Chat** | ✅ Ativo | Enriquecimento textual, scoring, copy |
| **Google Gemini 2.5 Flash** | ✅ Ativo | Auditoria visual de fachada |
| **Google Maps Places (legacy)** | ❌ REQUEST_DENIED | Mantida como fallback |
| **Evolution API (WhatsApp)** | ⏳ Configurado | Mensageria |
| **Brasil API (CNPJ)** | ⏳ Configurado | Consulta de CNPJ |

---

## Problemas Conhecidos e Observações

1. **Google Places API (Camada 1):** A API Key retorna `REQUEST_DENIED` para a Places API legacy. O fallback automático para Playwright DOM Scraping funciona perfeitamente, trazendo 100% dos leads de forma gratuita.

2. **Filtro de Elite:** O filtro de exclusão de "leads lixo" (imobiliárias, corretores, comércios) está ativo mas pode precisar de expansão periódica conforme novos padrões de texto falso positivo surgirem.

3. **Playwright Sandbox:** No Windows, o Playwright requer argumentos `--no-sandbox` e outros flags de resiliência para bypass de segurança do Chromium.

4. **Rate Limits:** Ambos DeepSeek e Gemini possuem limites de requisição. O `UsageMonitor` rastreia o consumo. Verificar com `check_usage.py` periodicamente.

5. **SQLite Single-Writer:** Evitar concorrência pesada de escrita no banco — SQLite não escala bem com múltiplos escritores simultâneos.

6. **Turbopack no Windows:** O Next.js 16 com Turbopack pode apresentar instabilidades no Windows. Como fallback, usar `next dev --webpack` conforme documentado no RULES.md.

---

## Últimas Validações (Maio 2026)

- **Teste Sniper (`test_sniper.py`):** ✅ Motor Playwright capturando leads reais em Jundiaí (Veduta Residencial, Reserva da Serra, Casas da Toscana, Garden Resort) com telefones e websites reais.
- **Teste Gemini (`test_gemini.py`):** ✅ Gemini 2.5 Flash analisando fachadas e retornando diagnósticos de pintura.
- **Teste Demand Pipeline (`test_demand_pipeline.py`):** ✅ Pipeline de demanda funcionando.
- **API Health:** ✅ Backend respondendo em `http://localhost:8002/docs` com Swagger UI funcional.
- **Frontend:** ✅ Next.js 16 rodando em `http://localhost:3000` com todas as rotas ativas.

---

*Atualizado em: 19 de Maio de 2026 — Versão 3.2*