# 👁️ VISÃO GERAL DO PROJETO (PROJECT)

**Projeto:** Prospect-On 3.0 (Sniper Sovereignty)
**Versão Atual:** 3.2 (DeepSeek + Gemini)
**Objetivo Principal:** Sistema backend/frontend de inteligência comercial focado na prospecção de condomínios para a Otto Pinturas.
**Filosofia:** Qualidade sobre Quantidade. Priorizar leads extremamente ricos em contexto (Sniper-First) ao invés de grandes volumes de dados vazios.

## Por que este projeto existe?
Para automatizar a descoberta e qualificação de clientes potenciais (condomínios) usando inteligência artificial (DeepSeek Chat + Google Gemini 2.5 Flash) e navegação autônoma (Playwright) para encontrar os contatos mais valiosos (Síndicos, Administradoras, E-mails Diretos) e avaliar a infraestrutura predial de forma automatizada.

## Casos de Uso Core
1. **Discovery (Onde estão?):** Navegar no Google Maps via Playwright DOM Scraping e encontrar condomínios em áreas alvo. Fallback via OpenStreetMap Overpass API.
2. **Enrichment (Quem são?):** Vasculhar a web/redes sociais para encontrar os canais de comunicação diretos (Instagram, E-mail, Site, WhatsApp). DeepSeek Chat gera copy de prospecção personalizada.
3. **Analysis (Qual o potencial?):** DeepSeek classifica porte/padrão do condomínio. Gemini 2.5 Flash audita fachada visualmente (conta torres, andares, estima m²). GeosampaAgent cruza dados da prefeitura (idade do prédio, IPTU).
4. **Action (Como atacar?):** Dashboard limpo focado em conversão e "Vistoria Manual" com atalhos de contatos ricos (WhatsApp, E-mail com 1 clique). CRM de prospecção com favoritos e histórico de interações.

## Stack de IA
| IA | Modelo | Responsabilidade |
|----|--------|-----------------|
| **DeepSeek** | deepseek-chat | Enriquecimento textual, scoring, copy de prospecção, classificação de porte |
| **Google Gemini** | gemini-2.5-flash | Auditoria visual de fachada (SurveyorAgent) — contagem de torres, andares, estimativa de m² |

## Pipeline Sniper-First
```
BrowserScout (Playwright DOM) → Hunter (OpenStreetMap fallback)
         ↓
SurveyorAgent (Gemini — auditoria visual)
         ↓
ContactAgent (enriquecimento de canais)
         ↓
LeadEnrichmentAgent (DeepSeek — copy + classificação)
         ↓
AnalystAgent (scoring Match Otto + urgência)
         ↓
ClosingAgent (consolidação + proposta editorial)
```

---

*Atualizado em: 19 de Maio de 2026 — Versão 3.2*