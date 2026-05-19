// ============================================================
// content.js v15
//
// Responsabilidade: coletar URLs + nomes do feed e pedir ao
// background para extrair os dados de cada empresa.
// NÃO tenta navegar nem clicar em nada.
// ============================================================

(function () {
  'use strict';

  if (window.__gmapsReady) return;
  window.__gmapsReady   = true;
  window.__gmapsRunning = false;

  console.log('[MapsScraper] content.js v15 ✓');

  const FEED_SEL  = 'div[role="feed"]';
  const SPONSORED = ['patrocinado', 'sponsored', 'anúncio', '· ad', 'ad ·'];

  // ── Listeners ─────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
    if (msg.action === 'PING')        { sendResponse({ ok: true }); return true; }
    if (msg.action === 'STOP_SCRAPE') { window.__gmapsRunning = false; sendResponse({ ok: true }); return true; }
    if (msg.action === 'START_SCRAPE') {
      sendResponse({ ok: true });
      if (!window.__gmapsRunning) startScrape(msg.config);
      return true;
    }
    return true;
  });

  // ════════════════════════════════════════════════════════════
  async function startScrape(config) {
    window.__gmapsRunning = true;
    const limit = config.limit || 20;
    const delay = config.delay || 1500;

    // Espera o feed de resultados aparecer
    const feed = await poll(() => document.querySelector(FEED_SEL), 12000);
    if (!feed) return abort('Nenhuma lista encontrada. Faça uma busca no Google Maps primeiro.');

    // Coleta URLs e nomes do feed (com scroll para lazy loading)
    const places = await collectPlaces(feed, limit);
    if (!places.length) return abort('Nenhum resultado encontrado.');

    const total = places.length;
    console.log(`[MapsScraper] ${total} lugares para processar`);

    const allData = [];

    for (let i = 0; i < total && window.__gmapsRunning; i++) {
      const { href, name } = places[i];

      chrome.runtime.sendMessage({
        type: 'PROGRESS', current: i + 1, total, company: name,
      });

      console.log(`[MapsScraper] [${i+1}/${total}] "${name}"`);

      // Pede ao background para abrir a URL numa aba oculta e extrair
      const extra = await askBackground(href, delay);

      const data = {
        nome:        name,
        website:     extra.website,
        agendamento: extra.agendamento,
        cardapio:    extra.cardapio,
        redes:       extra.redes,
        telefone:    extra.telefone,
        email:       extra.email,
        endereco:    extra.endereco,
      };

      console.log(`[MapsScraper]   tel:${data.telefone} | web:${data.website} | end:${data.endereco}`);

      allData.push(data);
      chrome.runtime.sendMessage({ type: 'COMPANY_FOUND', data });
    }

    window.__gmapsRunning = false;
    chrome.runtime.sendMessage({ type: 'SCRAPE_DONE', allData });
  }

  // ════════════════════════════════════════════════════════════
  // COLETA DE URLS DO FEED
  // Distingue três situações:
  //   1. Feed ainda carregando (primeiros itens não apareceram)
  //   2. Lazy loading entre lotes (scroll aciona mais itens)
  //   3. Fim real da lista (Maps exibe mensagem OU sem novidade)
  // ════════════════════════════════════════════════════════════
  async function collectPlaces(feed, limit) {
    const seen = new Map();

    const END_MARKERS = [
      'você chegou ao final da lista',
      "you've reached the end of the list",
      'fim dos resultados',
      'end of results',
    ];

    function isEndOfList() {
      const area = feed.closest('[role="main"]') || feed.parentElement || feed;
      return END_MARKERS.some(m => area.textContent.toLowerCase().includes(m));
    }

    function scanFeed() {
      for (const child of feed.children) {
        if (seen.size >= limit) break;
        const a = child.querySelector('a[href*="/maps/place/"]');
        if (!a || seen.has(a.href)) continue;
        if (isSponsored(child)) continue;
        const name = cleanName(a.getAttribute('aria-label') || '')
                  || cardName(child)
                  || `Empresa ${seen.size + 1}`;
        seen.set(a.href, name);
      }
    }

    // ── Fase 1: aguarda primeiros itens (feed pode demorar) ───
    const firstItems = await poll(
      () => { scanFeed(); return seen.size > 0; },
      12000
    );
    if (!firstItems) {
      console.log('[MapsScraper] feed não carregou nenhum item.');
      return [];
    }

    // ── Fase 2: scroll para lazy loading ─────────────────────
    let prevCount  = seen.size;
    let staleRound = 0;
    const MAX_STALE = 4; // 4 × 1500ms ≈ 6s sem novidade → fim real

    while (seen.size < limit) {
      if (isEndOfList()) {
        console.log('[MapsScraper] Maps sinalizou fim da lista.');
        break;
      }
      feed.scrollTop = feed.scrollHeight;
      await sleep(1000);
      scanFeed();

      if (seen.size > prevCount) {
        staleRound = 0;
        prevCount  = seen.size;
      } else {
        staleRound++;
        console.log(`[MapsScraper] sem novos itens (${staleRound}/${MAX_STALE})`);
        if (staleRound >= MAX_STALE) {
          console.log('[MapsScraper] fim da lista por estagnação.');
          break;
        }
        await sleep(1500);
      }
    }

    console.log(`[MapsScraper] ${seen.size} lugares coletados.`);
    return [...seen.entries()].map(([href, name]) => ({ href, name }));
  }
  // ════════════════════════════════════════════════════════════
  // PEDE AO BACKGROUND PARA EXTRAIR A URL
  // ════════════════════════════════════════════════════════════
  function askBackground(url, delay) {
    return new Promise(resolve => {
      const empty = { telefone:'Sem info', website:'Sem info', endereco:'Sem info', email:'Sem info' };
      // Timeout = delay configurado + 20s de margem para a aba carregar
      const timeout = setTimeout(() => resolve(empty), delay + 20000);

      chrome.runtime.sendMessage({ type: 'EXTRACT_PLACE', url, delay }, resp => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          console.warn('[MapsScraper] bg erro:', chrome.runtime.lastError.message);
          resolve(empty);
        } else {
          resolve(resp?.data || empty);
        }
      });
    });
  }

  // ════════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════════
  function isSponsored(el) {
    return SPONSORED.some(s => (el.innerHTML||'').toLowerCase().includes(s));
  }

  function cleanName(s) {
    return (s||'')
      .replace(/\s*[-–·]\s*link acessado\s*/i, '')
      .replace(/\s*link acessado\s*/i, '')
      .trim();
  }

  function cardName(card) {
    const el = card.querySelector('.qBF1Pd,[class*="fontHeadline"],[class*="fontTitle"]');
    return el?.textContent?.trim() || '';
  }

  function poll(predicate, timeout = 8000) {
    return new Promise(resolve => {
      const v = predicate();
      if (v) return resolve(v);
      const start = Date.now();
      const id = setInterval(() => {
        const r = predicate();
        if (r)                             { clearInterval(id); resolve(r);     return; }
        if (Date.now() - start >= timeout) { clearInterval(id); resolve(false); }
      }, 200);
    });
  }

  function abort(msg) {
    window.__gmapsRunning = false;
    chrome.runtime.sendMessage({ type: 'SCRAPE_ERROR', error: msg });
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

})();
