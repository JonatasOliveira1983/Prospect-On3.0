# RULES — Prospect-On 3.2

Documento de contexto, padrões e regras do sistema.

---

## Identidade e Missão

**Prospect-On** é o Motor de Inteligência Comercial da **Otto Pinturas**. Sua missão é localizar, qualificar e gerar contato com leads de pintura predial e comercial através de navegação web automatizada e análise via IA.

**Regra de Ouro:** O sistema não usa APIs pagas de busca. Navega a web como um usuário humano real.

---

## Arquitetura — Os 3 Pilares + Apify

### Pilares de Descoberta

1. **Pilar A — Condomínios**: GetNinjas via Playwright stealth
2. **Pilar B — Editais Públicos**: DuckDuckGo → gov.br/PNCP
3. **Pilar C — Corporativo**: oHub via Playwright stealth
4. **Google Maps**: Apify Google Maps Extractor (990+ leads de administradoras/síndicos)

### Stack

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| Frontend | Next.js 16 (Turbopack), TypeScript, Tailwind CSS | 3000 |
| Backend | FastAPI (Python 3.10+), Uvicorn | 8002 |
| Banco | SQLite (`data/prospecton.db`) | local |
| IA | DeepSeek Chat | cloud |
| Scraping | Playwright Stealth + Apify | cloud/local |

---

## Protocolo Stealth

Todo agente que usa Playwright DEVE seguir:

```python
args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-blink-features=AutomationControlled",
    "--disable-infobars",
]

viewport = random.choice([{w:1366,h:768}, {w:1440,h:900}, {w:1920,h:1080}])
user_agent = random.choice(STEALTH_USER_AGENTS)
locale = "pt-BR"
timezone_id = "America/Sao_Paulo"

await context.add_init_script("""
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
""")

await page.wait_for_timeout(random.randint(2000, 3500))
```

### Fontes Aprovadas

| ✅ Usar | ❌ Nunca usar |
|---|---|
| GetNinjas via Playwright | Bing API |
| oHub via Playwright | Google Places API |
| DuckDuckGo | APIs pagas de busca |
| Apify Google Maps Extractor | |

---

## Regras de Desenvolvimento

### Dados
- **Zero mocks em produção.** Dados reais apenas.
- Fallbacks com dados auditados aceitáveis quando Google bloquear.
- Jamais inserir dados fictícios no banco.

### Frontend
- **Zero Crash UI:** optional chaining (`?.`) extensivamente.
- **Tailwind Only:** estilização via Tailwind CSS.
- **Componentes Resilientes:** fallback visual para erro e loading.

### Banco de Dados
- Migrações: `ALTER TABLE` antes de `DROP TABLE`. Dados nunca perdidos.
- Schema: SQLite local. Compatível com Postgres.

### CRM (Chat)
- Cada lead tem seu próprio thread.
- Admin conversa em qualquer lead.
- Vendedor conversa apenas em favoritos.
- Deletar: apenas suas próprias mensagens.

---

## Regras de Chat

| Regra | Admin | Vendedor |
|-------|-------|----------|
| Conversar em qualquer lead | ✅ | ❌ |
| Conversar em favoritos | ✅ | ✅ |
| Deletar próprias mensagens | ✅ | ✅ |
| Deletar mensagens alheias | ❌ | ❌ |

---

## Design

- **Cores:** Slate-950 (fundo), Yellow-400 (destaque), Slate-400 (muted)
- **Tipografia:** Instrument Serif (títulos), Geist Sans (corpo)
- **Bordas:** Máximo 6px de arredondamento
- **Mobile:** touch targets mínimos 44px

---

## Comandos Rápidos

```powershell
# Backend
cd backend ; python api.py

# Frontend
cd frontend ; npm run dev

# Parar tudo
Get-Process -Name "python","node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Verificar banco
cd backend ; python -c "import sqlite3; conn = sqlite3.connect('data/prospecton.db'); print(conn.execute('SELECT COUNT(*) FROM leads').fetchone()[0])"
```

---

## Health Check

- Backend: http://localhost:8002/docs
- Frontend: http://localhost:3000

---

*Atualizado em: Junho 2026 — Versão 3.2*
