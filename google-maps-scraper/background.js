// ============================================================
// background.js v15
//
// ARQUITETURA DEFINITIVA:
//   Para cada URL de empresa, abre uma aba oculta (active:false),
//   injeta um script que aguarda o painel carregar e extrai os
//   dados via .Io6YTe.fontBodyMedium.kR99db.fdkmkc, depois
//   fecha a aba e devolve os dados.
//
//   Vantagens:
//   - O DOM real é carregado pelo browser (não fetch)
//   - Não precisa clicar em nada (não há problema de isTrusted)
//   - O content script da aba principal nunca é interrompido
// ============================================================

// Fila de extração para evitar abrir muitas abas simultâneas
let extractionQueue = Promise.resolve();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'EXTRACT_PLACE') {
    // Enfileira a extração para rodar uma por vez
    extractionQueue = extractionQueue.then(() =>
      extractPlace(msg.url, msg.delay || 2000)
        .then(data => sendResponse({ ok: true, data }))
        .catch(err => {
          console.error('[BG] erro:', err.message);
          sendResponse({ ok: false, data: null });
        })
    );
    return true; // mantém canal aberto
  }
});

// ════════════════════════════════════════════════════════════
async function extractPlace(url, delay) {
  const empty = {
    telefone: 'Sem info', website: 'Sem info',
    endereco: 'Sem info', email:   'Sem info',
  };

  let tab;
  try {
    // 1. Abre a URL da empresa numa aba oculta
    tab = await chrome.tabs.create({ url, active: false });

    // 2. Aguarda a aba terminar de carregar
    await waitForTabLoad(tab.id, 15000);

    // 3. Aguarda os elementos de dados aparecerem no DOM
    await waitForElements(tab.id, delay);

    // 4. Extrai os dados via executeScript
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFromPage,
    });

    const data = results?.[0]?.result || empty;
    console.log('[BG] extraído:', JSON.stringify(data));
    return data;

  } catch (e) {
    console.error('[BG] extractPlace falhou:', e.message);
    return empty;
  } finally {
    // 5. Fecha a aba sempre, mesmo em caso de erro
    if (tab?.id) {
      try { await chrome.tabs.remove(tab.id); } catch (_) {}
    }
  }
}

// ── Aguarda aba terminar de carregar ──────────────────────────
function waitForTabLoad(tabId, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve(); // não rejeita — tenta extrair mesmo assim
    }, timeout);

    function listener(id, info) {
      if (id === tabId && info.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// ── Verifica se uma aba ainda existe ─────────────────────────
async function tabExists(tabId) {
  try { await chrome.tabs.get(tabId); return true; }
  catch (_) { return false; }
}

// ── Aguarda os elementos de dados aparecerem (via script) ─────
function waitForElements(tabId, maxWait) {
  return new Promise(resolve => {
    const start    = Date.now();
    const sel      = '.Io6YTe.fontBodyMedium.kR99db.fdkmkc';
    const interval = setInterval(async () => {
      // Aba pode ter sido fechada pelo usuário — encerra sem erro
      if (!(await tabExists(tabId))) {
        clearInterval(interval);
        resolve();
        return;
      }
      try {
        const res = await chrome.scripting.executeScript({
          target: { tabId },
          func: (selector) => document.querySelectorAll(selector).length,
          args: [sel],
        });
        const count = res?.[0]?.result || 0;
        if (count > 0 || Date.now() - start >= maxWait) {
          clearInterval(interval);
          setTimeout(resolve, 500);
        }
      } catch (_) {
        // Script falhou (aba navegou ou foi fechada)
        clearInterval(interval);
        resolve();
      }
    }, 400);
  });
}

// ── Função injetada na aba da empresa ────────────────────────
function extractFromPage() {
  const SEL = '.Io6YTe.fontBodyMedium.kR99db.fdkmkc';

  const result = {
    telefone:    'Sem info',
    website:     'Sem info',
    agendamento: 'Sem info',
    cardapio:    'Sem info',
    redes:       'Sem info',
    endereco:    'Sem info',
    email:       'Sem info',
  };

  const RX_PHONE = /^\(?\+?[\d][\d\s\(\)\-\.]{6,18}[\d]$/;
  const RX_PLUS  = /^[A-Z0-9]{3,}\+[A-Z0-9]{2,}/;
  const RX_HOURS = /aberto|fechado|fecha|abre|\d{1,2}:\d{2}/i;
  const RX_ADDR  = /\d{1,5}\s[\wÀ-ú]|Rua |Av\.|Avenida |Al\.|Bloco |Loja |CEP|\bSP\b|\bRJ\b|\bMG\b|\bRS\b|\bPR\b|\bBA\b|\bSC\b|\bGO\b|\bPE\b|\bCE\b|\bDF\b|\bAM\b|\bPA\b/i;
  const RX_EMAIL = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

  // Extrai o hostname de uma URL de forma segura
  function getHost(href) {
    try { return new URL(href).hostname.toLowerCase().replace(/^www\./, ''); }
    catch { return ''; }
  }

  // Verifica se o hostname corresponde ao domínio (exato ou subdomínio)
  // Ex: matchDomain('instagram.com', 'www.instagram.com') → true
  //     matchDomain('t.co', 'bluefit.com.br') → false  ← bug antigo corrigido
  function matchDomain(domain, host) {
    return host === domain || host.endsWith('.' + domain);
  }

  // ── [E] Redes Sociais — SOMENTE plataformas conhecidas ───────
  // Verificação ESTRITA por hostname, nunca por substring da URL
  const SOCIAL_DOMAINS = [
    'instagram.com', 'instagr.am',
    'facebook.com', 'fb.com', 'fb.me',
    'wa.me', 'whatsapp.com',
    'twitter.com', 'x.com', 't.co',      // t.co verificado por hostname
    'tiktok.com',
    'pinterest.com', 'pin.it',
    'linkedin.com',
    'youtube.com', 'youtu.be',
    'threads.net',
    'telegram.me', 'telegram.org', 't.me',
    'discord.gg', 'discord.com',
    'snapchat.com',
    'kwai.com',
  ];

  // ── [C] Agendamento ───────────────────────────────────────────
  const BOOKING_DOMAINS = [
    // Encurtadores / listas de links (bio links)
    'linktr.ee', 'linktree.com',
    'bit.ly', 'bitly.com',
    'bio.link', 'biolinky.co',
    'beacons.ai', 'beacons.com',
    'later.com', 'lnk.bio',
    'tap.bio', 'campsite.bio',
    'solo.to', 'allmylinks.com',
    'milkshake.app', 'koji.com',
    'tinyurl.com', 'ow.ly', 'short.io',
    'rebrand.ly', 'shor.by', 'switchy.io',
    'go2.link', 'li.sten.to',
    // Agendamento
    'calendly.com', 'cal.com', 'cal.ly',
    'booking.com',
    'booksy.com',
    'airbnb.com', 'airbnb.com.br',
    'calendar.app.google',
    'bling.com.br',
    'fresha.com', 'trinks.com', 'vagaro.com',
    'mindbody.io', 'mindbodyonline.com',
    'acuityscheduling.com', 'setmore.com',
    'simplybook.me', 'simplybook.it',
    'timely.com', 'appointy.com',
    'genbook.com', 'treatwell.com',
    'phorest.com', 'hairpro.com',
    'reserva.ink', 'reservamos.mx',
    'skedapp.com', 'neemo.com.br',
    'gobarber.com.br', 'barbeariapp.com',
    'salaovip.com.br', 'nailpro.com.br',
    'spabooker.com', 'schedul.com',
  ];
  const BOOKING_PATH_KW = [
    '/agenda', '/agendar', '/agendamento',
    '/book', '/booking', '/reserva', '/reserve', '/reservar',
    '/alugue', '/aluga', '/aluguel',
    '/appointment', '/schedule', '/calendar',
    '/horario', '/horário',
  ];

  // ── [D] Cardápio / Delivery ───────────────────────────────────
  const MENU_DOMAINS = [
    'ifood.com.br', 'ifood.com',
    'ubereats.com',
    'rappi.com', 'rappi.com.br',
    'deliverymuch.com.br',
    'aiqfome.com',
    'pede.ai', 'pedidosja.com',
    'goomer.com.br',
    'tazze.com.br',
    'anota.ai',
    'foody.com.br',
    'sheerme.com',
    'abrasel.com.br',
    'menudino.com',
    'hapy.com.br', 'hpy.com.br',
  ];
  const MENU_PATH_KW = [
    '/cardapio', '/cardápio', '/menu',
    '/pedido', '/pedir', '/delivery',
    '/order', '/comida',
  ];

  const BLOCKED_HOSTS = ['google.com', 'goo.gl', 'googleapis.com', 'gstatic.com'];

  function isPhone(t) {
    if (!RX_PHONE.test(t) || RX_PLUS.test(t)) return false;
    return (t.match(/\d/g) || []).length >= 8;
  }
  function isAddr(t)  { return RX_ADDR.test(t) && !isPhone(t) && !RX_HOURS.test(t) && !RX_PLUS.test(t); }
  function isGMail(e) { return ['@google','@gstatic','@w3','@schema'].some(d => e.includes(d)); }

  function cleanUrl(href) {
    try { const u = new URL(href); return u.origin + u.pathname.replace(/\/$/, ''); }
    catch { return href.split('?')[0]; }
  }

  // Classifica uma URL de forma precisa (hostname + path keywords)
  function classify(href) {
    if (!href?.startsWith('http')) return null;

    let host, path;
    try {
      const u = new URL(href);
      host = u.hostname.toLowerCase().replace(/^www\./, '');
      path = u.pathname.toLowerCase();
    } catch { return null; }

    // Bloqueia URLs internas do Google
    if (BLOCKED_HOSTS.some(d => matchDomain(d, host))) return null;
    if (href.includes('aclk') || href.includes('/maps/')) return null;

    // [E] Rede social — hostname EXATO
    if (SOCIAL_DOMAINS.some(d => matchDomain(d, host))) return 'social';

    // [C] Agendamento — hostname ou keyword no path
    if (BOOKING_DOMAINS.some(d => matchDomain(d, host))) return 'booking';
    if (BOOKING_PATH_KW.some(k => path.includes(k)))     return 'booking';

    // [D] Cardápio — hostname ou keyword no path
    if (MENU_DOMAINS.some(d => matchDomain(d, host))) return 'menu';
    if (MENU_PATH_KW.some(k => path.includes(k)))     return 'menu';

    // [B] Website da empresa
    return 'website';
  }

  // ── Coleta e classifica todos os links externos únicos ────────
  const seen  = new Set();
  const links = [];

  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.href || '';
    const type = classify(href);
    if (!type) continue;
    const url = cleanUrl(href);
    if (seen.has(url)) continue;
    seen.add(url);
    links.push({ url, type });
  }

  // ── Distribui os links nos slots ─────────────────────────────
  for (const { url, type } of links) {
    if (type === 'social'  && result.redes       === 'Sem info') { result.redes       = url; continue; }
    if (type === 'booking' && result.agendamento === 'Sem info') { result.agendamento = url; continue; }
    if (type === 'menu'    && result.cardapio    === 'Sem info') { result.cardapio    = url; continue; }
    if (type === 'website' && result.website     === 'Sem info') { result.website     = url; continue; }
  }

  // ── Fallback: link "website" extra vai para Agendamento ───────
  if (result.website !== 'Sem info' && result.agendamento === 'Sem info') {
    for (const { url, type } of links) {
      if (type === 'website' && url !== result.website) {
        result.agendamento = url;
        break;
      }
    }
  }

  // ── Extrai texto dos campos .Io6YTe ──────────────────────────
  for (const el of document.querySelectorAll(SEL)) {
    const txt = (el.innerText || el.textContent || '').trim();
    if (!txt || txt.length < 2) continue;
    if (result.email === 'Sem info') {
      const em = txt.match(RX_EMAIL);
      if (em && !isGMail(em[0])) { result.email = em[0]; continue; }
    }
    if (result.telefone === 'Sem info' && isPhone(txt)) { result.telefone = txt; continue; }
    if (result.endereco === 'Sem info' && isAddr(txt))  { result.endereco = txt; continue; }
  }

  // ── Fallback email via HTML ───────────────────────────────────
  if (result.email === 'Sem info') {
    const em = document.body.innerHTML.match(RX_EMAIL);
    if (em && !isGMail(em[0])) result.email = em[0];
  }

  return result;
}
