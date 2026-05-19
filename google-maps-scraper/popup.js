// ============================================================
// popup.js v19
// Estado da sessão é salvo em chrome.storage.session.
// Fechar e reabrir o popup restaura progresso + dados coletados.
// Novos dados só são coletados após clicar em "Iniciar Coleta".
// ============================================================

const SESSION_KEY = 'gmapsPopupSession';

let collectedData = [];
let isRunning     = false;

// ── DOM ──────────────────────────────────────────────────────
const startBtn      = document.getElementById('startBtn');
const stopBtn       = document.getElementById('stopBtn');
const downloadBtn   = document.getElementById('downloadBtn');
const limitSlider   = document.getElementById('limitSlider');
const limitValue    = document.getElementById('limitValue');
const progressSec   = document.getElementById('progressSection');
const progressFill  = document.getElementById('progressFill');
const progressCount = document.getElementById('progressCount');
const progressLabel = document.getElementById('progressLabel');
const statusText    = document.getElementById('statusText');
const resultsSec    = document.getElementById('resultsSection');
const resultsList   = document.getElementById('resultsList');
const totalCollect  = document.getElementById('totalCollected');
const alertBanner   = document.getElementById('alertBanner');

limitSlider.addEventListener('input', () => { limitValue.textContent = limitSlider.value; });

// ════════════════════════════════════════════════════════════
// INICIALIZAÇÃO — restaura sessão ao abrir o popup
// ════════════════════════════════════════════════════════════
async function init() {
  const tab = await getMapsTab();
  alertBanner.style.display = tab ? 'none' : 'block';
  startBtn.disabled = !tab;

  // Restaura estado salvo
  const session = await loadSession();
  if (!session) return;

  collectedData = session.collectedData || [];
  isRunning     = session.isRunning     || false;

  // Restaura slider
  if (session.limit) {
    limitSlider.value     = session.limit;
    limitValue.textContent = session.limit;
  }

  // Restaura preview da lista
  resultsList.innerHTML = '';
  collectedData.forEach(d => addPreview(d, false)); // false = não rola para o topo

  if (isRunning) {
    // Coleta em andamento — mostra UI de progresso
    setRunningUI(true);
    progressFill.style.background = 'linear-gradient(90deg,#5b6af5,#8b5cf6)';
    if (session.progress) {
      updateProgress(session.progress.current, session.progress.total, session.progress.company);
    } else {
      progressLabel.textContent = '⏳ Coletando...';
      statusText.textContent    = 'Aguardando resultado...';
    }
  } else if (collectedData.length > 0) {
    // Coleta finalizada — mostra resultados e botão de download
    showResults();
  }
}

init();

// ════════════════════════════════════════════════════════════
// INICIAR COLETA
// ════════════════════════════════════════════════════════════
startBtn.addEventListener('click', async () => {
  const tab = await getMapsTab();
  if (!tab) { alertBanner.style.display = 'block'; return; }

  // Reseta tudo para nova coleta
  collectedData         = [];
  isRunning             = true;
  resultsList.innerHTML = '';

  const config = { limit: parseInt(limitSlider.value, 10), delay: 2000 };

  setRunningUI(true);
  progressFill.style.cssText = 'width:0%;background:linear-gradient(90deg,#5b6af5,#8b5cf6)';
  statusText.textContent     = 'Conectando...';
  progressLabel.textContent  = '⏳ Iniciando...';
  progressCount.textContent  = '0 / ?';

  await saveSession({ collectedData, isRunning: true, limit: config.limit });

  // Injeta o content script
  try { await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }); } catch(_) {}
  await sleep(300);

  chrome.tabs.sendMessage(tab.id, { action: 'PING' }, resp => {
    if (chrome.runtime.lastError || !resp?.ok) {
      showError('Não foi possível conectar. Recarregue o Google Maps (F5) e tente novamente.');
      isRunning = false;
      saveSession({ collectedData, isRunning: false, limit: config.limit });
      setRunningUI(false);
      return;
    }
    statusText.textContent = 'Lendo lista...';
    chrome.tabs.sendMessage(tab.id, { action: 'START_SCRAPE', config }, r => {
      if (chrome.runtime.lastError || !r?.ok) {
        showError('Erro ao iniciar. Recarregue (F5) e tente novamente.');
        isRunning = false;
        saveSession({ collectedData, isRunning: false, limit: config.limit });
        setRunningUI(false);
      }
    });
  });
});

// ════════════════════════════════════════════════════════════
// PARAR
// ════════════════════════════════════════════════════════════
stopBtn.addEventListener('click', async () => {
  const tab = await getMapsTab();
  if (tab) chrome.tabs.sendMessage(tab.id, { action: 'STOP_SCRAPE' }, () => {});
  isRunning = false;
  progressLabel.textContent = '⏹ Interrompido';
  await saveSession({ collectedData, isRunning: false, limit: parseInt(limitSlider.value, 10) });
  finishCollection();
});

// ════════════════════════════════════════════════════════════
// DOWNLOAD
// ════════════════════════════════════════════════════════════
downloadBtn.addEventListener('click', () => {
  if (collectedData.length) downloadXLS(collectedData);
});

// ════════════════════════════════════════════════════════════
// MENSAGENS DO CONTENT SCRIPT
// ════════════════════════════════════════════════════════════
chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {

    case 'PROGRESS': {
      updateProgress(msg.current, msg.total, msg.company);
      // Salva progresso para restaurar se o popup for fechado
      saveSession({
        collectedData,
        isRunning: true,
        limit: parseInt(limitSlider.value, 10),
        progress: { current: msg.current, total: msg.total, company: msg.company },
      });
      break;
    }

    case 'COMPANY_FOUND': {
      collectedData.push(msg.data);
      addPreview(msg.data, true);
      saveSession({
        collectedData,
        isRunning: true,
        limit: parseInt(limitSlider.value, 10),
      });
      break;
    }

    case 'SCRAPE_DONE': {
      if (msg.allData?.length) collectedData = msg.allData;
      isRunning = false;
      saveSession({ collectedData, isRunning: false, limit: parseInt(limitSlider.value, 10) });
      finishCollection();
      break;
    }

    case 'SCRAPE_ERROR': {
      showError(msg.error);
      isRunning = false;
      saveSession({ collectedData, isRunning: false, limit: parseInt(limitSlider.value, 10) });
      setRunningUI(false);
      break;
    }
  }
});

// ════════════════════════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════════════════════════
function updateProgress(current, total, name) {
  const pct = total > 0 ? Math.round(current / total * 100) : 0;
  progressFill.style.width  = pct + '%';
  progressCount.textContent = `${current} / ${total}`;
  progressLabel.textContent = '⏳ Coletando...';
  statusText.textContent    = name ? `🏢 ${name}` : 'Processando...';
}

function addPreview(data, prepend = true) {
  const el = document.createElement('div');
  el.className   = 'result-item';
  el.textContent = `✓ ${data.nome}`;
  el.title       = `${data.telefone} | ${data.website}`;
  prepend ? resultsList.prepend(el) : resultsList.append(el);
}

function showResults() {
  resultsSec.style.display  = 'flex';
  downloadBtn.style.display = 'flex';
  totalCollect.textContent  = `${collectedData.length} empresa(s)`;
}

function finishCollection() {
  setRunningUI(false);
  if (collectedData.length > 0) showResults();
}

function setRunningUI(running) {
  startBtn.style.display    = running ? 'none' : 'flex';
  stopBtn.style.display     = running ? 'flex' : 'none';
  progressSec.style.display = running ? 'flex' : 'none';
  if (!running) downloadBtn.style.display = collectedData.length ? 'flex' : 'none';
}

function showError(msg) {
  progressFill.style.cssText = 'width:100%;background:#ef4444';
  progressLabel.textContent  = '❌ Erro';
  statusText.textContent     = msg;
}

// ════════════════════════════════════════════════════════════
// STORAGE DE SESSÃO
// ════════════════════════════════════════════════════════════
function saveSession(data) {
  return chrome.storage.session.set({ [SESSION_KEY]: data });
}

function loadSession() {
  return new Promise(resolve => {
    chrome.storage.session.get(SESSION_KEY, result => {
      resolve(result?.[SESSION_KEY] || null);
    });
  });
}

// ════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ════════════════════════════════════════════════════════════
async function getMapsTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  return (tab.url.includes('google.com/maps') || tab.url.includes('maps.google.com')) ? tab : null;
}

// ════════════════════════════════════════════════════════════
// XLS EXPORT
// ════════════════════════════════════════════════════════════
function downloadXLS(data) {
  const headers  = ['Nome','Website','Agendamento','Cardápio','Redes Sociais','Telefone','Email','Endereço'];
  const fields   = ['nome','website','agendamento','cardapio','redes','telefone','email','endereco'];
  const COL_W    = [170,140,140,140,140,110,140,210];
  const colgroup = COL_W.map(w => `<col style="width:${w}pt"/>`).join('');
  const thead    = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
  const tbody    = data.map(row =>
    '<tr>' + fields.map(f => makeCell(row[f] || 'Sem info', f)).join('') + '</tr>'
  ).join('');

  const style = `<style>
    body{font-family:Arial,sans-serif;font-size:11pt}
    table{border-collapse:collapse;width:100%}
    th{background:#1F3864;color:#fff;font-weight:bold;font-size:11pt;padding:6px 8px;border:1px solid #16294a;text-align:left;white-space:nowrap}
    tr:nth-child(even) td{background:#EEF2FF} tr:nth-child(odd) td{background:#fff}
    td{padding:5px 8px;border:1px solid #D0D7E8;font-size:10pt;vertical-align:top}
    .sem{color:#9CA3AF;font-style:italic}.web{color:#1D4ED8}.tel{color:#065F46;font-weight:500}
  </style>`;

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"/><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Empresas</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
${style}</head><body><table><colgroup>${colgroup}</colgroup><thead>${thead}</thead><tbody>${tbody}</tbody></table></body></html>`;

  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename: `google_maps_${dateStamp()}.xls`, saveAs: false });
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

function makeCell(val, field) {
  const isSem  = !val || val === 'Sem info';
  const isLink = ['website','agendamento','cardapio','redes'].includes(field);
  const cls    = isSem ? 'sem' : (field === 'website' ? 'web' : field === 'telefone' ? 'tel' : isLink ? 'web' : '');
  const safe   = esc(val || 'Sem info');
  const inner  = (!isSem && isLink) ? `<a href="${safe}" style="color:#1D4ED8">${safe}</a>` : safe;
  return `<td class="${cls}">${inner}</td>`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function pad(n)    { return String(n).padStart(2, '0'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
