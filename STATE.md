# Estado Atual — Prospect-On 3.2

## Resumo Executivo
- **Data:** Junho 2026
- **Versão:** `3.2 — Commercial Intelligence Engine`
- **Estado:** `OPERATIONAL ✅`
- **Motor:** Playwright Stealth + Apify + DeepSeek Chat
- **Bloqueios:** Apify proxies RESIDENTIAL/GOOGLE_SERP indisponíveis (plano gratuito)

---

## O Que Funciona

### Pilares de Descoberta

| Pilar | Fonte | Status | Leads |
|-------|-------|--------|-------|
| A — Condomínios | GetNinjas (Playwright) | ✅ | 1+ |
| B — Editais Públicos | DuckDuckGo → gov.br/PNCP | ✅ | 15+ |
| C — Corporativo | oHub (Playwright) | ✅ | 11+ |
| Google Maps | Apify (Google Maps Extractor) | ✅ | 990+ |

### Dashboard (Cockpit)
- 5 zonas geográficas: Sul, Norte, Leste, Oeste, Centro
- 559 bairros mapeados com contadores
- Filtros por bairro, pesquisa, categorias
- Importação de leads via Apify
- Indicadores: total, quentes, mensagens, matches

### Leads Elite
- Favoritos com chat em tempo real
- Criação manual de leads (auto-favorita)
- Exclusão de leads
- Badge de mensagens não lidas

### CRM — Chat em Tempo Real
- Thread por lead (tabela `lead_messages`)
- Mensagens estilo WhatsApp
- Separadores de data
- Deletar apenas suas próprias mensagens
- Badge de não lidos no sidebar
- Polling a cada 5 segundos

### Documentos
- Upload/download/visualização/impressão
- Diretório: `public/AquivosOtto/documentos/` (11 PDFs)
- Admin: upload/deletar | Todos: download/visualizar/imprimir

### Landing Page
- Background: Ponte Estaiada SP (foto real)
- Elemento 3D Spline animado
- Efeitos neon glow
- Login mobile com formulário flutuante

### Mobile Responsivo
- Header fixo com logo (linka para home)
- Nav inferior: Cockpit, Elite, Docs, Vendedores (admin), Sair
- Touch targets mínimos de 44px
- 3D oculto no mobile

### Usuários
| Nome | Perfil |
|------|--------|
| Jonatas Oliveira | admin |
| Joao Otto | admin |
| Nico Otto | admin |
| Carlos Cabral | vendedor |

---

## Servidores

- Backend FastAPI: `http://localhost:8002`
- Frontend Next.js: `http://localhost:3000`

---

## Comandos Rápidos

```powershell
# Backend
cd backend ; python api.py

# Frontend
cd frontend ; npm run dev

# Verificar banco
cd backend ; python -c "import sqlite3; conn = sqlite3.connect('data/prospecton.db'); print(f'Leads: {conn.execute(\"SELECT COUNT(*) FROM leads\").fetchone()[0]}'); print(f'Quentes: {conn.execute(\"SELECT COUNT(*) FROM leads_quentes\").fetchone()[0]}'); print(f'Mensagens: {conn.execute(\"SELECT COUNT(*) FROM lead_messages\").fetchone()[0]}')"
```

---

## Próximos Passos

- [ ] Apify: rodar importação completa das 11 regiões quando proxies estiverem disponíveis
- [ ] Landing page: corrigir sobreposição mobile do hero
- [ ] Push commits restantes para remote

---

*Atualizado em: Junho 2026 — Versão 3.2*
