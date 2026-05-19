# 🧱 REQUISITOS TÉCNICOS E LIMITES (REQUIREMENTS)

## Stack Tecnológica Obrigatória

| Camada | Tecnologia | Porta | Versão |
|--------|-----------|-------|--------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS | 3000 | Next 16 + Tailwind 3.4 |
| **Backend** | FastAPI (Python), Uvicorn | 8002 | Python 3.10+ |
| **Banco de Dados** | SQLite | — | Schema v7.0 (contatos ricos) |
| **IA Primária** | DeepSeek Chat (deepseek-chat) | cloud | Enriquecimento textual |
| **IA Secundária** | Google Gemini 2.5 Flash | cloud | Auditoria visual (Surveyor) |
| **Discovery** | Playwright (DOM Scraping) | local | Google Maps — fonte primária |
| **WhatsApp** | Evolution API v2 | 8080 | Mensageria (opcional) |
| **Extensão** | Chrome Extension | — | Google Maps Scraper |

---

## Regras Inquebráveis de Arquitetura

1. **Bunker Mode:** Nunca destrua ou apague o banco de dados sem backup. Modificações no schema devem preservar os dados existentes. Use `migrate_v7.py` ou scripts de migração apropriados.

2. **Zero Crash UI:** O Frontend deve utilizar *optional chaining* (`?.`) extensivamente. Leads mal formatados ou sem dados não podem quebrar a renderização da tabela. Todo componente deve ter fallback visual para estados `loading`, `empty` e `error`.

3. **Sniper-First Fallback:** O Playwright (Google Maps DOM Scraping) é a fonte primária de descoberta. Se falhar completamente, existe o fallback nativo via OpenStreetMap (`HunterAgent`). A Google Places API (legacy) está com status `REQUEST_DENIED` e é mantida apenas como terceira camada de fallback.

4. **Agentic Separation:** Os 13 agentes (`ManagerAgent`, `BrowserScoutAgent`, `HunterAgent`, `AnalystAgent`, `SurveyorAgent`, `ClosingAgent`, `ContactAgent`, `LeadEnrichmentAgent`, `DemandScraperAgent`, `GeosampaAgent`, `HealthAgent`, `ExtensionLauncher`, `ScoutAgent`) devem ter responsabilidades separadas e claras.
   - Comunicação apenas via `ManagerAgent` (orquestrador central).
   - Dados fluem em pipeline unidirecional: Discovery → Enrichment → Scoring → Closing.
   - Nenhuma "função Deus" (God Object).

5. **UI Premium:** Interface "Glass-Premium" com animações suaves e paleta baseada na identidade visual Otto Pinturas.
   - **Cores:** Slate-950 (background), Cyan-400 (destaque), Emerald-400 (sucesso), Slate-400 (muted).
   - **Tipografia:** Instrument Serif (títulos), Geist Sans (corpo), Geist Mono (dados).
   - **Grid:** Todas as medidas divisíveis por 4px.
   - **Tailwind Only:** Estilização exclusiva via Tailwind CSS. Evitar CSS puro a menos que indispensável.

6. **Pipeline de Qualidade:**
   - Leads devem passar por auditoria visual (`SurveyorAgent`) antes de entrar no banco "Quente".
   - Filtro de Elite descarta automaticamente imobiliárias, corretores, comércios e prestadores de serviço.
   - Todo lead rico deve possuir máximo de canais de contato (e-mail, telefone, site, Instagram).

7. **Versionamento de Schema:** O banco de dados está na versão 7.0 com schema expandido para campos sociais, e-mail e URLs de agendamento.

8. **Resiliência de APIs:** Fallbacks implementados em cascata:
   - Camada 1: Playwright DOM Scraping (primário)
   - Camada 2: OpenStreetMap Overpass API (HunterAgent)
   - Camada 3: Google Places API legacy (desativada — mantida como fallback futuro)

---

## Limites e Restrições

- **Playwright:** Requer Chrome/Chromium instalado. No Windows, usar argumentos `--no-sandbox` para bypass de segurança.
- **DeepSeek:** Rate limit da API — monitorar via `check_usage.py`.
- **Gemini:** Uso otimizado apenas para auditoria visual (SurveyorAgent) — não usar para tarefas que o DeepSeek pode fazer.
- **SQLite:** Single-writer. Evitar concorrência pesada de escrita.
- **Tailwind:** Versão 3.4.x bloqueada. Não migrar para v4 sem testes extensivos de breaking changes.

---

*Atualizado em: 19 de Maio de 2026 — Versão 3.2*