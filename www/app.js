'use strict';

const STORAGE_KEY = 'glowai_appointments';
const CHAT_KEY = 'glowai_chat_history';

const PERSONAL_TYPES = ['Irrigation Check', 'Crop Walk', 'Pest Review', 'Soil Sample', 'Harvest Prep', 'Fertilizer Pass', 'Equipment Check', 'Other'];
const COMPANY_TYPES = ['Crew Dispatch', 'Vendor Visit', 'Delivery Window', 'Repair Call', 'Compliance Review', 'Planning Meeting', 'Logistics Check', 'Other'];

const TYPE_ICONS = {
  'Irrigation Check': '💧',
  'Crop Walk': '🌾',
  'Pest Review': '🐞',
  'Soil Sample': '🧪',
  'Harvest Prep': '🚜',
  'Fertilizer Pass': '🌱',
  'Equipment Check': '🛠',
  'Crew Dispatch': '🧭',
  'Vendor Visit': '🤝',
  'Delivery Window': '📦',
  'Repair Call': '🔧',
  'Compliance Review': '📋',
  'Planning Meeting': '🗺',
  'Logistics Check': '📍',
  Other: '📝',
};

const URGENCY_LABEL = {
  routine: 'Monitor in next pass',
  soon: 'Schedule this week',
  urgent: 'Action now',
};

const URGENCY_COLOR = {
  routine: '#2b7d4a',
  soon: '#a2681d',
  urgent: '#af4335',
};

function loadAppointments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAppointments(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function seedMockData() {
  const existing = loadAppointments();
  if (existing.length > 0) return;

  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const addDays = n => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  saveAppointments([
    { id: uid(), mode: 'personal', title: 'North Field irrigation check', date: fmt(addDays(0)), time: '06:30', type: 'Irrigation Check', status: 'confirmed', notes: 'Pressure dipped on line B3 overnight.', client: '' },
    { id: uid(), mode: 'personal', title: 'Block C pest review', date: fmt(addDays(1)), time: '08:15', type: 'Pest Review', status: 'pending', notes: 'Look for leaf chewing on east edge.', client: '' },
    { id: uid(), mode: 'personal', title: 'South orchard crop walk', date: fmt(addDays(2)), time: '07:45', type: 'Crop Walk', status: 'confirmed', notes: 'Check canopy color variance after feed.', client: '' },
    { id: uid(), mode: 'company', title: 'Pump 2 repair window', date: fmt(addDays(0)), time: '11:00', type: 'Repair Call', status: 'confirmed', notes: 'Motor vibration reported by night shift.', client: 'Island Ag Services' },
    { id: uid(), mode: 'company', title: 'Nutrient delivery slot', date: fmt(addDays(1)), time: '13:30', type: 'Delivery Window', status: 'pending', notes: 'Receive liquid feed totes at shed 4.', client: 'Pacific Supply' },
    { id: uid(), mode: 'company', title: 'Weekly operations standup', date: fmt(addDays(3)), time: '09:00', type: 'Planning Meeting', status: 'confirmed', notes: 'Review labor allocation and alert backlog.', client: 'Farm Ops Team' },
  ]);
}

async function syncApptToBackend(appt) {
  const apiBase = (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
  const token = localStorage.getItem('glowai_token') || '';
  if (!apiBase || !token) return;

  const isNew = !/^[0-9a-f]{8}-/.test(appt.id);
  const url = isNew ? `${apiBase}/api/appointments` : `${apiBase}/api/appointments/${appt.id}`;
  const method = isNew ? 'POST' : 'PUT';

  try {
    const resp = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: localStorage.getItem('glowai_user_id') || 'default',
        mode: appt.mode,
        title: appt.title,
        date: appt.date,
        time: appt.time,
        type: appt.type,
        status: appt.status,
        client: appt.client || null,
        notes: appt.notes || null,
      }),
    });

    if (resp.ok && isNew) {
      const saved = await resp.json();
      const appts = loadAppointments();
      const idx = appts.findIndex(item => item.id === appt.id);
      if (idx >= 0) {
        appts[idx].id = saved.id;
        saveAppointments(appts);
      }
    }
  } catch {}
}

async function deleteApptFromBackend(id) {
  const apiBase = (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
  const token = localStorage.getItem('glowai_token') || '';
  if (!apiBase || !token || !/^[0-9a-f]{8}-/.test(id)) return;

  try {
    await fetch(`${apiBase}/api/appointments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {}
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dt.getTime() === today.getTime()) return 'Today';
  if (dt.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const glowApp = (() => {
  let history = ['home'];
  let apptMode = 'personal';
  let lastScanResult = null;
  let chatHistory = [];
  let chatBusy = false;

  const screens = {
    home: { title: 'FarmSense', showBack: false, navId: 'navHome' },
    appointments: { title: 'Work Orders', showBack: true, navId: 'navAppointments' },
    analysis: { title: 'Field Scan', showBack: true, navId: 'navAnalysis' },
    scanResult: { title: 'Scan Result', showBack: true, navId: 'navAnalysis' },
    settings: { title: 'Settings', showBack: true, navId: 'navProfile' },
  };

  const OPENING_QUESTIONS = [
    'Morning check-in: any irrigation, pest, or canopy issues you want to review first?',
    'What needs attention today: field health, crew scheduling, or a quick scan?',
    'Tell me what you are seeing in the field and I will help turn it into a next step.',
    'Ready to scout? Ask for a field recommendation or run a crop scan.',
  ];

  const MOCK_REPLIES = [
    { keys: ['irrigation', 'water', 'drip', 'pressure'], reply: 'Start with pressure consistency, emitter flow, and any soft spots in the row. If a block is lagging, create an irrigation check work order so the crew can close the loop.' },
    { keys: ['pest', 'bug', 'insect', 'chew'], reply: 'Look for edge clustering, underside leaf activity, and repeat damage patterns. A field scan can help capture the issue and turn it into a crew task.' },
    { keys: ['yellow', 'chlorosis', 'nutrient', 'deficiency'], reply: 'Patchy yellowing usually needs context: irrigation uniformity, recent feed timing, and whether the pattern follows rows or zones. Capture a scan and compare it to the affected block.' },
    { keys: ['harvest', 'pick', 'crew'], reply: 'For harvest readiness, line up maturity checks, labor coverage, and haul timing together. Put the crew-facing items in Operations so they do not get buried under field notes.' },
    { keys: ['scan', 'camera', 'photo', 'picture'], reply: 'Open Field Scan and frame the crop clearly. The result can generate a follow-up work order without leaving the app.' },
    { keys: ['task', 'order', 'schedule', 'vendor'], reply: 'Use Work Orders for anything that needs a handoff. Keep field checks under Fields and outside vendors or crew logistics under Operations.' },
  ];

  function currentScreen() {
    return history[history.length - 1];
  }

  function navigate(screenId) {
    if (!screens[screenId] || currentScreen() === screenId) return;
    if (screenId === 'home') {
      history = ['home'];
    } else {
      history.push(screenId);
    }
    render();
  }

  function goBack() {
    if (history.length <= 1) return;
    history.pop();
    render();
  }

  function render() {
    const current = currentScreen();
    const cfg = screens[current];

    Object.keys(screens).forEach(id => {
      const el = document.getElementById(`screen${id.charAt(0).toUpperCase()}${id.slice(1)}`);
      if (el) el.classList.toggle('hidden', id !== current);
    });

    const titleEl = document.getElementById('headerTitle');
    titleEl.textContent = cfg.title;
    titleEl.classList.toggle('home-logo', current === 'home');
    document.getElementById('appHeader').classList.toggle('home-header', current === 'home');
    document.getElementById('headerBack').classList.toggle('hidden', !cfg.showBack);

    Object.values(screens).forEach(screen => {
      if (screen.navId) document.getElementById(screen.navId)?.classList.remove('active');
    });
    if (cfg.navId) document.getElementById(cfg.navId)?.classList.add('active');

    const headerAction = document.getElementById('headerAction');
    headerAction.innerHTML = '';
    if (current === 'appointments') {
      headerAction.innerHTML = '<button onclick="glowApp.openModal()" aria-label="Add task">New</button>';
    }
    if (current === 'home') {
      headerAction.innerHTML = '<button onclick="glowApp.navigate(\'settings\')" aria-label="Settings">Tune</button>';
    }

    if (current === 'home') {
      renderHomeStats();
      renderHomePreview();
      initChat();
    }
    if (current === 'appointments') renderApptList();
    if (current === 'settings') loadSettings();
  }

  function renderHomeStats() {
    const list = loadAppointments();
    const open = list.filter(item => item.status !== 'cancelled' && item.status !== 'completed');
    const fields = new Set(list.filter(item => item.mode === 'personal').map(item => item.title.split(' ').slice(0, 2).join(' ')));
    const alerts = open.filter(item => item.status === 'pending');
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };
    setText('heroStatTasks', open.length);
    setText('heroStatFields', fields.size || 3);
    setText('heroStatAlerts', alerts.length);
  }

  function sortByDateTime(a, b) {
    const da = `${a.date}T${a.time || '00:00'}`;
    const db = `${b.date}T${b.time || '00:00'}`;
    return da.localeCompare(db);
  }

  function statusClass(status) {
    return {
      confirmed: 'status-confirmed',
      pending: 'status-pending',
      cancelled: 'status-cancelled',
      completed: 'status-completed',
    }[status] || 'status-pending';
  }

  function cardHTML(item, showEdit) {
    const icon = TYPE_ICONS[item.type] || '📝';
    const statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    const editAttr = showEdit ? `onclick="glowApp.openModal('${item.id}')"` : '';
    return `
      <button class="appt-card" ${editAttr} role="listitem" aria-label="${esc(item.title)}">
        <div class="appt-badge ${item.mode === 'personal' ? 'personal' : 'company'}">${icon}</div>
        <div class="appt-info">
          <div class="appt-title">${esc(item.title)}${item.client ? ' - ' + esc(item.client) : ''}</div>
          <div class="appt-meta">${fmtDate(item.date)} · ${fmtTime(item.time)}${item.type ? ' · ' + esc(item.type) : ''}</div>
        </div>
        <span class="appt-status ${statusClass(item.status)}">${statusLabel}</span>
      </button>`;
  }

  function renderHomePreview() {
    const container = document.getElementById('homeApptPreview');
    if (!container) return;
    const items = loadAppointments()
      .filter(item => item.status !== 'cancelled' && item.status !== 'completed')
      .sort(sortByDateTime)
      .slice(0, 4);

    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">🗓</span><p>No work orders scheduled yet.</p></div>';
      return;
    }

    container.innerHTML = items.map(item => cardHTML(item, false)).join('');
  }

  function setApptMode(mode) {
    apptMode = mode;
    renderApptList();
  }

  function syncToggleUI() {
    const btnPersonal = document.getElementById('btnPersonal');
    const btnCompany = document.getElementById('btnCompany');
    if (!btnPersonal || !btnCompany) return;
    btnPersonal.className = `mode-btn${apptMode === 'personal' ? ' active-personal' : ''}`;
    btnCompany.className = `mode-btn${apptMode === 'company' ? ' active-company' : ''}`;
    btnPersonal.setAttribute('aria-selected', String(apptMode === 'personal'));
    btnCompany.setAttribute('aria-selected', String(apptMode === 'company'));
  }

  function renderApptList() {
    const container = document.getElementById('apptList');
    if (!container) return;
    syncToggleUI();

    const items = loadAppointments()
      .filter(item => item.mode === apptMode)
      .sort(sortByDateTime);

    if (items.length === 0) {
      const label = apptMode === 'personal' ? 'field checks' : 'operations tasks';
      container.innerHTML = `<div class="empty-state"><span class="empty-icon">📋</span><p>No ${label} yet.</p></div>`;
      return;
    }

    container.innerHTML = items.map(item => cardHTML(item, true)).join('');
  }

  function populateTypeSelect(mode) {
    const types = mode === 'personal' ? PERSONAL_TYPES : COMPANY_TYPES;
    document.getElementById('formType').innerHTML = types
      .map(type => `<option value="${esc(type)}">${esc(type)}</option>`)
      .join('');
  }

  function openModal(id, prefill) {
    document.getElementById('apptForm').reset();
    populateTypeSelect(apptMode);
    document.getElementById('formClientGroup').style.display = apptMode === 'company' ? '' : 'none';

    if (id) {
      const item = loadAppointments().find(entry => entry.id === id);
      if (!item) return;
      document.getElementById('modalTitle').textContent = 'Edit Work Order';
      document.getElementById('formId').value = item.id;
      document.getElementById('formTitle').value = item.title;
      document.getElementById('formDate').value = item.date;
      document.getElementById('formTime').value = item.time;
      document.getElementById('formType').value = item.type;
      document.getElementById('formStatus').value = item.status;
      document.getElementById('formNotes').value = item.notes || '';
      document.getElementById('formClient').value = item.client || '';
      document.getElementById('modalActions').innerHTML = `
        <button type="button" class="btn-danger" onclick="glowApp.deleteAppointment('${id}')">Delete</button>
        <button type="button" class="btn-ghost" onclick="glowApp.closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>`;
    } else {
      document.getElementById('modalTitle').textContent = 'New Work Order';
      document.getElementById('formDate').value = new Date().toISOString().split('T')[0];
      if (prefill) {
        if (prefill.title) document.getElementById('formTitle').value = prefill.title;
        if (prefill.type) document.getElementById('formType').value = prefill.type;
        if (prefill.notes) document.getElementById('formNotes').value = prefill.notes;
      }
      document.getElementById('modalActions').innerHTML = `
        <button type="button" class="btn-ghost" onclick="glowApp.closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>`;
    }

    document.getElementById('modalBackdrop').classList.remove('hidden');
    setTimeout(() => document.getElementById('formTitle').focus(), 80);
  }

  function closeModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
  }

  function closeModalIfBackdrop(event) {
    if (event.target === document.getElementById('modalBackdrop')) closeModal();
  }

  function saveAppointment(event) {
    event.preventDefault();
    const title = document.getElementById('formTitle').value.trim();
    const date = document.getElementById('formDate').value;
    const time = document.getElementById('formTime').value;
    if (!title || !date || !time) return;

    const record = {
      id: document.getElementById('formId').value || uid(),
      mode: apptMode,
      title,
      date,
      time,
      type: document.getElementById('formType').value,
      status: document.getElementById('formStatus').value,
      notes: document.getElementById('formNotes').value.trim(),
      client: document.getElementById('formClient').value.trim(),
    };

    const items = loadAppointments();
    const idx = items.findIndex(entry => entry.id === record.id);
    if (idx >= 0) {
      items[idx] = record;
    } else {
      items.push(record);
    }
    saveAppointments(items);
    syncApptToBackend(record);
    closeModal();
    renderHomeStats();
    if (currentScreen() === 'appointments') renderApptList();
    if (currentScreen() === 'home') renderHomePreview();
  }

  function deleteAppointment(id) {
    saveAppointments(loadAppointments().filter(item => item.id !== id));
    deleteApptFromBackend(id);
    closeModal();
    renderHomeStats();
    if (currentScreen() === 'appointments') renderApptList();
    if (currentScreen() === 'home') renderHomePreview();
  }

  function setScanState(state, data) {
    const idle = document.getElementById('scanIdle');
    const loading = document.getElementById('scanLoading');
    const error = document.getElementById('scanError');
    if (!idle || !loading || !error) return;

    idle.classList.add('hidden');
    loading.classList.add('hidden');
    error.classList.add('hidden');

    if (state === 'idle') {
      idle.classList.remove('hidden');
      return;
    }

    if (state === 'loading' || state === 'analyzing') {
      loading.classList.remove('hidden');
      if (state === 'analyzing' && data) {
        const img = document.getElementById('scanPreviewImg');
        if (img) img.src = `data:image/jpeg;base64,${data}`;
      }
      return;
    }

    if (state === 'error') {
      error.classList.remove('hidden');
      const msg = document.getElementById('scanErrorMsg');
      if (msg) msg.textContent = data || 'Unknown error';
    }
  }

  function showScanResult(result) {
    lastScanResult = result;
    const urgency = result.suggested_appointment?.urgency || 'routine';
    const urgencyColor = URGENCY_COLOR[urgency] || URGENCY_COLOR.routine;
    const urgencyLabel = URGENCY_LABEL[urgency] || URGENCY_LABEL.routine;
    const issues = (result.issues || [])
      .map(issue => `<span class="result-chip issue">${esc(issue.replace(/_/g, ' '))}</span>`)
      .join('');
    const recommendations = (result.recommendations || [])
      .map(item => `<li class="result-rec-item">${esc(item)}</li>`)
      .join('');

    const title = result.field_summary || result.skin_type || 'Field condition summary';
    const icon = result.field_icon || '🌿';
    const demoBanner = result._demo
      ? `<div class="result-demo-banner">${result._apiError ? 'API unavailable. Showing a demo field assessment until your backend is reachable.' : 'Demo scan active. Connect a backend in Settings for live analysis.'}</div>`
      : '';

    document.getElementById('scanResultWrap').innerHTML = `
      ${demoBanner}
      <div class="result-card">
        <div class="result-skin-type">
          <span class="result-skin-icon">${icon}</span>
          <div>
            <div class="result-skin-label">Field Summary</div>
            <div class="result-skin-value">${esc(toTitle(title))}</div>
          </div>
        </div>

        ${issues ? `
          <div class="result-section">
            <div class="result-section-title">Observed Signals</div>
            <div class="result-chips">${issues}</div>
          </div>` : ''}

        ${recommendations ? `
          <div class="result-section">
            <div class="result-section-title">Recommended Actions</div>
            <ul class="result-rec-list">${recommendations}</ul>
          </div>` : ''}

        <div class="result-appt-suggest" style="border-left: 4px solid ${urgencyColor}">
          <div class="result-appt-header">
            <span class="result-appt-icon">📌</span>
            <div>
              <div class="result-appt-type">${esc(result.suggested_appointment?.type || 'Field follow-up')}</div>
              <div class="result-appt-urgency" style="color:${urgencyColor}">${urgencyLabel}</div>
            </div>
          </div>
          ${result.suggested_appointment?.reason ? `<p class="result-appt-reason">${esc(result.suggested_appointment.reason)}</p>` : ''}
        </div>

        <button class="btn-primary result-book-btn" onclick="glowApp.bookFromScan()">Create Work Order</button>
        <button class="btn-ghost" onclick="glowApp.navigate('analysis')">Scan Again</button>
      </div>`;

    navigate('scanResult');
  }

  function bookFromScan() {
    if (!lastScanResult) return;
    apptMode = 'personal';
    navigate('appointments');
    setTimeout(() => {
      const taskType = lastScanResult.suggested_appointment?.type || 'Crop Walk';
      openModal(null, {
        title: `${taskType} follow-up`,
        type: PERSONAL_TYPES.includes(taskType) ? taskType : 'Crop Walk',
        notes: lastScanResult.suggested_appointment?.reason || '',
      });
    }, 100);
  }

  function mockChatReply(message) {
    const lower = message.toLowerCase();
    const found = MOCK_REPLIES.find(entry => entry.keys.some(key => lower.includes(key)));
    if (found) return found.reply;
    return 'Use Field Scan for anything visual, and Work Orders for anything that needs action or accountability. If you connect a backend, I can return live AI guidance instead of local demo responses.';
  }

  async function callChatAPI(message) {
    const base = (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
    const token = localStorage.getItem('glowai_token') || 'dev-token';
    if (!base) throw new Error('NO_API_URL');

    const resp = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        history: chatHistory.slice(-8),
        user_id: localStorage.getItem('glowai_user_id') || 'default',
      }),
    });

    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data = await resp.json();
    return data.reply;
  }

  function appendChatMsg(role, text, isHtml) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const row = document.createElement('div');
    row.className = `chat-msg chat-msg-${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    row.appendChild(bubble);
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'chat-msg chat-msg-bot';
    row.id = 'chatTyping';
    row.innerHTML = '<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>';
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('chatTyping')?.remove();
  }

  function initChat() {
    const container = document.getElementById('chatMessages');
    if (!container || container.children.length > 0) return;
    try {
      chatHistory = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
    } catch {
      chatHistory = [];
    }

    if (chatHistory.length > 0) {
      chatHistory.slice(-4).forEach(item => appendChatMsg(item.role, item.content, item.role === 'bot'));
      return;
    }

    const greeting = OPENING_QUESTIONS[Math.floor(Math.random() * OPENING_QUESTIONS.length)];
    appendChatMsg('bot', greeting);
    chatHistory.push({ role: 'bot', content: greeting });
  }

  async function sendChat(event) {
    event.preventDefault();
    if (chatBusy) return;

    const input = document.getElementById('chatInput');
    const message = input?.value.trim();
    if (!message) return;

    input.value = '';
    input.disabled = true;
    chatBusy = true;
    appendChatMsg('user', message);
    chatHistory.push({ role: 'user', content: message });
    showTyping();

    let reply;
    try {
      reply = await callChatAPI(message);
    } catch {
      reply = mockChatReply(message);
    }

    removeTyping();
    appendChatMsg('bot', reply, true);
    chatHistory.push({ role: 'bot', content: reply });
    localStorage.setItem(CHAT_KEY, JSON.stringify(chatHistory.slice(-20)));

    input.disabled = false;
    input.focus();
    chatBusy = false;
  }

  function loadSettings() {
    const urlEl = document.getElementById('settingsApiUrl');
    const tokenEl = document.getElementById('settingsToken');
    if (urlEl) urlEl.value = localStorage.getItem('glowai_api_url') || '';
    if (tokenEl) tokenEl.value = localStorage.getItem('glowai_token') || '';
  }

  function saveSettings() {
    const url = document.getElementById('settingsApiUrl')?.value.trim();
    const token = document.getElementById('settingsToken')?.value.trim();
    if (url) localStorage.setItem('glowai_api_url', url);
    if (token) localStorage.setItem('glowai_token', token);
    const saved = document.getElementById('settingsSaved');
    if (saved) {
      saved.classList.remove('hidden');
      setTimeout(() => saved.classList.add('hidden'), 2000);
    }
  }

  async function showConsentDialog(title, message) {
    return window.confirm(`${title}\n\n${message}`);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toTitle(str) {
    return String(str)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, ch => ch.toUpperCase());
  }

  function init() {
    seedMockData();
    document.getElementById('headerBack').addEventListener('click', goBack);
    window.addEventListener('popstate', () => {
      if (history.length > 1) {
        history.pop();
        render();
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeModal();
    });
    render();
  }

  return {
    navigate,
    goBack,
    setApptMode,
    openModal,
    closeModal,
    closeModalIfBackdrop,
    saveAppointment,
    deleteAppointment,
    setScanState,
    showScanResult,
    bookFromScan,
    sendChat,
    saveSettings,
    showConsentDialog,
    init,
  };
})();

window.glowApp = glowApp;
document.addEventListener('DOMContentLoaded', () => glowApp.init());
