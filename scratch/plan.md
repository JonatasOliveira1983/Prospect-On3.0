# Plan: Real Lead Search + History Feature

## Steps
- [x] Explore project structure (backend API, pillar agents, frontend)
- [x] Start backend server locally
- [x] Run real lead searches (5 per pillar, São Paulo, real data)
- [x] Create history database table/storage
- [x] Save search results to history with timestamp + user
- [x] Add history link to frontend menu
- [x] Build history page/view
- [x] Verify results

## 2026-05-20: Correção de link_fonte nos Leads (Links Quebrados)

### Problema
Leads exibiam links quebrados no CRM — URLs do Google Search (`google.com/search?q=...`),
URLs inventadas pela IA e placeholders como `seudominio.com.br`.

### Arquivos Modificados
- `backend/src/agents/pillar_a_agent.py` — Fallback SP com links para ohub.com.br, getninjas.com.br, habitissimo.com.br
- `backend/src/agents/pillar_b_agent.py` — Fallback SP com links para comprasnet.gov.br, pncp.gov.br, diariooficialsp.com.br
- `backend/src/agents/pillar_c_agent.py` — Fallback SP com links para sites oficiais (Shopping Center 3, Klabin, FIESP, Iguatemi, CENU) e portais ohub, getninjas, habitissimo
- `backend/src/agents/demand_scout_agent.py` — Adicionado `_validate_link_fonte()` que rejeita URLs do Google Search, domínios placeholders e URLs malformadas

### Camadas de Proteção
1. Prompt DeepSeek instrui `NUNCA invente ou gere URLs` nos 3 pilares
2. `_validate_link_fonte()` filtra URLs inválidas no `_normalize_lead()`
3. Fallbacks usam portais reais de contratação de pintura