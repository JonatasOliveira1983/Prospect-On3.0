# 🧠 CONTEXTO TÁTICO ATUAL (CONTEXT)

Este documento guarda decisões efêmeras, testes e descobertas da sessão atual de desenvolvimento.

## Status da Sessão Atual

- **Objetivo Atual:** Atualização da documentação do sistema para refletir a realidade do código (v3.2 com DeepSeek + 13 agentes).
- **Atividades Realizadas:**
  - Servidores parados (Python na porta 8002 e Node na porta 3000).
  - Leitura completa dos arquivos `.gsd/` (PROJECT.md, REQUIREMENTS.md, STATE.md, ROADMAP.md, CONTEXT.md).
  - Leitura de todos os documentos raiz (ARCHITECTURE.md, RULES.md, README.md, GSD.md, DESIGN_SYSTEM.md).
  - Exploração da estrutura real de diretórios (`backend/src/agents/`, `backend/src/engine/`, `backend/src/utils/`, `frontend/app/`).
  - Atualização de ARCHITECTURE.md, RULES.md, README.md, REQUIREMENTS.md, STATE.md com:
    - Correção de 7 para 13 agentes (adicionados: ContactAgent, LeadEnrichmentAgent, DemandScraperAgent, HealthAgent, ExtensionLauncher, ScoutAgent).
    - Correção da IA primária (DeepSeek Chat, não apenas Gemini).
    - Adição do engine de inteligência (SmartEnrichment, Scoring, Pricing, ROI).
    - Adição de utilitários (DeepSeekClient, PlacesClient, ReportGenerator, etc.).
    - Correção de instruções de inicialização e parada.
    - Correção do pipeline Sniper-First com 7 etapas detalhadas.

## Decisões em Vigor

- **DeepSeek Chat** é a IA primária para enriquecimento textual e copy de prospecção.
- **Google Gemini 2.5 Flash** é a IA secundária, usada exclusivamente para auditoria visual de fachada (SurveyorAgent).
- **Playwright DOM Scraping** é a fonte primária de descoberta (Google Maps gratuito).
- **Google Places API legacy** está desativada (`REQUEST_DENIED`) — mantida apenas como terceira camada de fallback.
- **13 agentes** compõem o sistema, orquestrados pelo ManagerAgent.
- **Evolution API** (WhatsApp) e **Brasil API** (CNPJ) estão configurados mas não totalmente integrados.

## Próximo Passo

- Finalizar atualização do DESIGN_SYSTEM.md.
- Verificar se há mais alguma discrepância entre documentação e código real.
- Iniciar novamente os servidores para validação.

---

*Nota para a IA: Consulte este arquivo constantemente durante o `/gsd-exec` para lembrar o que estávamos discutindo antes de você "esquecer" nas janelas de contexto.*