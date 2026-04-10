// GlowAI — app.js  // Aloha from Pearl City! 🌺
// #ASSUMPTION: localStorage key 'glowai_appointments' stores appointment array.
// #ASSUMPTION: Backend URL in 'glowai_api_url'; token in 'glowai_token'.
// #ASSUMPTION: Offline-tolerant — all writes go to localStorage first, sync to backend in background.

'use strict';

const STORAGE_KEY = 'glowai_appointments';

const PERSONAL_TYPES = ['Doctor', 'Dentist', 'Dermatologist', 'Haircut', 'Spa', 'Gym', 'Therapy', 'Other'];
const COMPANY_TYPES  = ['Meeting', 'Client Call', 'Presentation', 'Workshop', 'Interview', 'Review', 'Other'];

const TYPE_ICONS = {
  Doctor: '🩺', Dentist: '🦷', Dermatologist: '🔬', Haircut: '✂️',
  Spa: '🧖', Gym: '💪', Therapy: '🧠', Meeting: '📋', 'Client Call': '📞',
  Presentation: '📊', Workshop: '🛠', Interview: '🤝', Review: '📝', Other: '📌',
};

const URGENCY_LABEL = { routine: 'Routine visit', soon: 'Schedule soon', urgent: 'See doctor ASAP' };
const URGENCY_COLOR = { routine: '#16a34a', soon: '#d97706', urgent: '#dc2626' };
const CONCERN_KEY = 'glowai_selected_concerns';
const SCAN_CONCERNS = [
  { id: 'acne', label: 'Acne' },
  { id: 'breakouts', label: 'Breakouts' },
  { id: 'dark_spots', label: 'Dark Spots' },
  { id: 'fine_lines', label: 'Fine Lines' },
  { id: 'redness', label: 'Redness' },
  { id: 'large_pores', label: 'Large Pores' },
  { id: 'uneven_tone', label: 'Uneven Tone' },
  { id: 'oiliness', label: 'Oiliness' },
  { id: 'dryness', label: 'Dryness' },
  { id: 'dehydration', label: 'Dehydration' },
  { id: 'texture', label: 'Texture' },
  { id: 'dullness', label: 'Dullness' },
  { id: 'sensitivity', label: 'Sensitivity' },
  { id: 'dark_circles', label: 'Dark Circles' },
  { id: 'puffiness', label: 'Puffiness' },
];

// ── Seed mock data once on first load ─────────────────────────────────────────
function seedMockData() {
  const existing = loadAppointments();
  if (existing.length > 0) return;
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const addDays = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  saveAppointments([
    { id: uid(), mode: 'personal', title: 'Dermatologist',        date: fmt(addDays(2)), time: '10:00', type: 'Dermatologist', status: 'confirmed', notes: 'Bring insurance card', client: '' },
    { id: uid(), mode: 'personal', title: 'Haircut',              date: fmt(addDays(5)), time: '14:30', type: 'Haircut',       status: 'confirmed', notes: '',                    client: '' },
    { id: uid(), mode: 'personal', title: 'Gym session',          date: fmt(addDays(1)), time: '06:00', type: 'Gym',           status: 'confirmed', notes: 'Leg day',              client: '' },
    { id: uid(), mode: 'company',  title: 'Fiverr client kickoff',date: fmt(addDays(1)), time: '11:00', type: 'Client Call',   status: 'confirmed', notes: 'PWA skin-app gig',    client: 'Maria T.' },
    { id: uid(), mode: 'company',  title: 'Sprint review',        date: fmt(addDays(3)), time: '15:00', type: 'Review',        status: 'pending',   notes: '',                    client: 'Acme Corp' },
    { id: uid(), mode: 'company',  title: 'Upwork proposal call', date: fmt(addDays(7)), time: '09:00', type: 'Client Call',   status: 'pending',   notes: '$300 gig scope',      client: 'James K.' },
  ]);
}

// ── Storage helpers ────────────────────────────────────────────────────────────
function loadAppointments() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveAppointments(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ── Backend sync (fire-and-forget, never blocks UI) ────────────────────────────
async function syncApptToBackend(appt) {
  const apiBase = (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
  const token   = localStorage.getItem('glowai_token') || '';
  if (!apiBase || !token) return; // not configured yet

  // Convert local id → check if it's a UUID (synced before) or local id (new)
  const isNew = !/^[0-9a-f]{8}-/.test(appt.id);
  const url    = isNew ? `${apiBase}/api/appointments` : `${apiBase}/api/appointments/${appt.id}`;
  const method = isNew ? 'POST' : 'PUT';

  try {
    const resp = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        user_id: localStorage.getItem('glowai_user_id') || 'default',
        mode: appt.mode, title: appt.title, date: appt.date,
        time: appt.time, type: appt.type, status: appt.status,
        client: appt.client || null, notes: appt.notes || null,
      }),
    });
    if (resp.ok && isNew) {
      const saved = await resp.json();
      // Update local record with server-assigned UUID
      const appts = loadAppointments();
      const idx = appts.findIndex(a => a.id === appt.id);
      if (idx >= 0) { appts[idx].id = saved.id; saveAppointments(appts); }
    }
  } catch { /* offline — will retry next save */ }
}

async function deleteApptFromBackend(id) {
  const apiBase = (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
  const token   = localStorage.getItem('glowai_token') || '';
  if (!apiBase || !token || !/^[0-9a-f]{8}-/.test(id)) return;
  try {
    await fetch(`${apiBase}/api/appointments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  } catch { /* offline */ }
}

// ── Date / time formatting ─────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  if (dt.getTime() === today.getTime())    return 'Today';
  if (dt.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

// ── Main App Object ────────────────────────────────────────────────────────────
const glowApp = (() => {
  let _history = ['home'];
  let _apptMode = 'personal';
  let _editingId = null;
  let _lastScanResult = null;
  let _selectedConcerns = _loadSelectedConcerns();

  const SCREENS = {
    home:       { title: 'GlowAI',        showBack: false, navId: 'navHome' },
    appointments:{ title: 'Appointments', showBack: true,  navId: 'navAppointments' },
    analysis:   { title: 'Skin Analysis', showBack: true,  navId: 'navAnalysis' },
    scanResult: { title: 'Your Results',  showBack: true,  navId: 'navAnalysis' },
    settings:   { title: 'Settings',      showBack: true,  navId: null },
  };

  function _currentScreen() { return _history[_history.length - 1]; }

  function navigate(screenId) {
    if (!SCREENS[screenId]) return;
    if (_currentScreen() === screenId) return;
    if (screenId === 'home') { _history = ['home']; } else { _history.push(screenId); }
    _render();
  }

  function goBack() {
    if (_history.length <= 1) return;
    _history.pop();
    _render();
  }

  function _render() {
    const current = _currentScreen();
    const cfg     = SCREENS[current];

    // Show/hide screens
    Object.keys(SCREENS).forEach(id => {
      const el = document.getElementById('screen' + id.charAt(0).toUpperCase() + id.slice(1));
      if (el) el.classList.toggle('hidden', id !== current);
    });

    const titleEl = document.getElementById('headerTitle');
    titleEl.textContent = cfg.title;
    titleEl.classList.toggle('home-logo', current === 'home');
    document.getElementById('appHeader').classList.toggle('home-header', current === 'home');
    document.getElementById('headerBack').classList.toggle('hidden', !cfg.showBack);

    Object.values(SCREENS).forEach(s => {
      if (s.navId) document.getElementById(s.navId)?.classList.remove('active');
    });
    if (cfg.navId) document.getElementById(cfg.navId)?.classList.add('active');

    // Header action slot
    document.getElementById('headerAction').innerHTML = '';
    if (current === 'appointments') {
      document.getElementById('headerAction').innerHTML =
        `<button onclick="glowApp.openModal()" title="Add">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>`;
    }
    if (current === 'home') {
      document.getElementById('headerAction').innerHTML =
        `<button onclick="glowApp.navigate('settings')" title="Settings" aria-label="Settings">Tune</button>`;
    }

    if (current === 'home')         { _renderHomePreview(); _renderConcernPicker(); _initChat(); }
    if (current === 'appointments') _renderApptList();
    if (current === 'analysis')     _renderConcernPicker();
    if (current === 'settings')     _loadSettings();
  }

  function _loadSelectedConcerns() {
    try { return JSON.parse(localStorage.getItem(CONCERN_KEY) || '[]'); }
    catch { return []; }
  }

  function _saveSelectedConcerns() {
    localStorage.setItem(CONCERN_KEY, JSON.stringify(_selectedConcerns));
  }

  function _renderConcernPicker() {
    const markup = SCAN_CONCERNS.map(concern => `
      <button
        type="button"
        class="concern-chip${_selectedConcerns.includes(concern.id) ? ' active' : ''}"
        onclick="glowApp.toggleConcern('${concern.id}')"
        aria-pressed="${_selectedConcerns.includes(concern.id)}">
        ${concern.label}
      </button>`).join('');
    document.querySelectorAll('.concern-chip-row').forEach(row => {
      row.innerHTML = markup;
    });
  }

  function toggleConcern(concernId) {
    _selectedConcerns = _selectedConcerns.includes(concernId)
      ? _selectedConcerns.filter(id => id !== concernId)
      : [..._selectedConcerns, concernId];
    _saveSelectedConcerns();
    _renderConcernPicker();
  }

  // ── Home preview ──────────────────────────────────────────────────────────────
  function _renderHomePreview() {
    const container = document.getElementById('homeApptPreview');
    if (!container) return;
    const all = loadAppointments()
      .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
      .sort(_sortByDateTime).slice(0, 3);
    if (all.length === 0) {
      container.innerHTML = `<div class="empty-state"><span class="empty-icon">📅</span><p>No upcoming appointments.<br>Tap <strong>Appointments</strong> to add one.</p></div>`;
      return;
    }
    container.innerHTML = all.map(a => _apptCardHTML(a, false)).join('');
  }

  // ── Appointments list ─────────────────────────────────────────────────────────
  function _renderApptList() {
    const container = document.getElementById('apptList');
    if (!container) return;
    const list = loadAppointments().filter(a => a.mode === _apptMode).sort(_sortByDateTime);
    _syncToggleUI();
    if (list.length === 0) {
      container.innerHTML = `<div class="empty-state"><span class="empty-icon">${_apptMode === 'personal' ? '👤' : '🏢'}</span><p>No ${_apptMode} appointments yet.<br>Tap <strong>+ Add Appointment</strong> to create one.</p></div>`;
      return;
    }
    container.innerHTML = list.map(a => _apptCardHTML(a, true)).join('');
  }

  function _sortByDateTime(a, b) {
    const da = a.date + 'T' + (a.time || '00:00');
    const db = b.date + 'T' + (b.time || '00:00');
    return da < db ? -1 : da > db ? 1 : 0;
  }

  function _statusClass(s) {
    return { confirmed: 'status-confirmed', pending: 'status-pending', cancelled: 'status-cancelled', completed: 'status-completed' }[s] || 'status-pending';
  }

  function _apptCardHTML(a, showEdit) {
    const icon = TYPE_ICONS[a.type] || '📌';
    const statusLabel = a.status.charAt(0).toUpperCase() + a.status.slice(1);
    const editAttr = showEdit ? `onclick="glowApp.openModal('${a.id}')"` : '';
    return `
      <button class="appt-card" ${editAttr} role="listitem" aria-label="${a.title}">
        <div class="appt-badge ${a.mode === 'personal' ? 'personal' : 'company'}">${icon}</div>
        <div class="appt-info">
          <div class="appt-title">${_esc(a.title)}${a.client ? ' — ' + _esc(a.client) : ''}</div>
          <div class="appt-meta">${fmtDate(a.date)} · ${fmtTime(a.time)}${a.type ? ' · ' + _esc(a.type) : ''}</div>
        </div>
        <span class="appt-status ${_statusClass(a.status)}">${statusLabel}</span>
      </button>`;
  }

  // ── Toggle ────────────────────────────────────────────────────────────────────
  function setApptMode(mode) { _apptMode = mode; _renderApptList(); }
  function _syncToggleUI() {
    const btnP = document.getElementById('btnPersonal');
    const btnC = document.getElementById('btnCompany');
    if (!btnP || !btnC) return;
    btnP.className = 'mode-btn' + (_apptMode === 'personal' ? ' active-personal' : '');
    btnC.className = 'mode-btn' + (_apptMode === 'company'  ? ' active-company'  : '');
    btnP.setAttribute('aria-selected', String(_apptMode === 'personal'));
    btnC.setAttribute('aria-selected', String(_apptMode === 'company'));
  }

  // ── Scan state machine ────────────────────────────────────────────────────────
  function setScanState(state, data) {
    const idle     = document.getElementById('scanIdle');
    const loading  = document.getElementById('scanLoading');
    const errorDiv = document.getElementById('scanError');
    if (!idle) return;

    idle.classList.add('hidden');
    loading.classList.add('hidden');
    errorDiv.classList.add('hidden');

    if (state === 'idle') {
      idle.classList.remove('hidden');
    } else if (state === 'loading') {
      loading.classList.remove('hidden');
    } else if (state === 'analyzing') {
      loading.classList.remove('hidden');
      const img = document.getElementById('scanPreviewImg');
      if (img && data) img.src = `data:image/jpeg;base64,${data}`;
    } else if (state === 'error') {
      errorDiv.classList.remove('hidden');
      const msg = document.getElementById('scanErrorMsg');
      if (msg) msg.textContent = data || 'Unknown error';
    }
  }

  // ── Show scan result screen ───────────────────────────────────────────────────
  function showScanResult(result) {
    _lastScanResult = result;

    const urgencyColor = URGENCY_COLOR[result.suggested_appointment?.urgency] || URGENCY_COLOR.routine;
    const urgencyLabel = URGENCY_LABEL[result.suggested_appointment?.urgency] || URGENCY_LABEL.routine;

    const concernChips = (result.user_concerns || []).map(i =>
      `<span class="result-chip concern">${_esc(i.replace(/_/g, ' '))}</span>`).join('');
    const issueChips  = (result.issues || []).map(i =>
      `<span class="result-chip issue">${_esc(i.replace(/_/g, ' '))}</span>`).join('');
    const recItems    = (result.recommendations || []).map(r =>
      `<li class="result-rec-item">✅ ${_esc(r)}</li>`).join('');

    const demoBanner = result._demo
      ? `<div class="result-demo-banner">${result._apiError ? 'API unreachable. Showing demo results until your backend is reachable in Settings.' : 'Demo mode is active. Connect a backend in Settings for live AI analysis.'}</div>`
      : '';

    document.getElementById('scanResultWrap').innerHTML = `
      ${demoBanner}
      <div class="result-card">
        <div class="result-skin-type">
          <span class="result-skin-icon">🧬</span>
          <div>
            <div class="result-skin-label">Skin Type</div>
            <div class="result-skin-value">${_esc((result.skin_type || 'unknown').charAt(0).toUpperCase() + result.skin_type.slice(1))}</div>
          </div>
        </div>

        ${result.user_concerns?.length ? `
        <div class="result-section">
          <div class="result-section-title">Focus Concerns</div>
          <div class="result-chips">${concernChips}</div>
        </div>` : ''}

        ${result.issues?.length ? `
        <div class="result-section">
          <div class="result-section-title">Detected Issues</div>
          <div class="result-chips">${issueChips}</div>
        </div>` : ''}

        ${result.recommendations?.length ? `
        <div class="result-section">
          <div class="result-section-title">Recommendations</div>
          <ul class="result-rec-list">${recItems}</ul>
        </div>` : ''}

        <div class="result-appt-suggest" style="border-left: 4px solid ${urgencyColor}">
          <div class="result-appt-header">
            <span class="result-appt-icon">📅</span>
            <div>
              <div class="result-appt-type">${_esc(result.suggested_appointment?.type || 'Dermatologist')}</div>
              <div class="result-appt-urgency" style="color:${urgencyColor}">${urgencyLabel}</div>
            </div>
          </div>
          ${result.suggested_appointment?.reason ? `<p class="result-appt-reason">${_esc(result.suggested_appointment.reason)}</p>` : ''}
        </div>

        <button class="btn-primary result-book-btn"
          onclick="glowApp.bookFromScan()">
          📅 Book Appointment Now
        </button>
        <button class="btn-ghost result-secondary-btn"
          onclick="glowApp.navigate('analysis')">
          Scan Again
        </button>
      </div>`;

    navigate('scanResult');
  }

  // ── Book from scan: prefill appointment modal ─────────────────────────────────
  function bookFromScan() {
    if (!_lastScanResult) return;
    const apptType = _lastScanResult.suggested_appointment?.type || 'Dermatologist';
    const concernNote = (_lastScanResult.user_concerns || []).length
      ? `Focus concerns: ${_lastScanResult.user_concerns.map(c => c.replace(/_/g, ' ')).join(', ')}. `
      : '';
    const reason   = concernNote + (_lastScanResult.suggested_appointment?.reason || '');

    // Set mode to personal (skin appointments are personal)
    _apptMode = 'personal';

    // Navigate to appointments then open modal
    navigate('appointments');
    setTimeout(() => {
      openModal(null, {
        title: apptType + ' visit',
        type:  PERSONAL_TYPES.includes(apptType) ? apptType : 'Dermatologist',
        notes: reason,
      });
    }, 100);
  }

  // ── Modal ─────────────────────────────────────────────────────────────────────
  function openModal(id, prefill) {
    _editingId = id || null;
    document.getElementById('apptForm').reset();
    _populateTypeSelect(_apptMode);
    document.getElementById('formClientGroup').style.display = _apptMode === 'company' ? '' : 'none';

    if (id) {
      const appt = loadAppointments().find(a => a.id === id);
      if (!appt) return;
      document.getElementById('modalTitle').textContent = 'Edit Appointment';
      document.getElementById('formId').value     = appt.id;
      document.getElementById('formTitle').value  = appt.title;
      document.getElementById('formDate').value   = appt.date;
      document.getElementById('formTime').value   = appt.time;
      document.getElementById('formType').value   = appt.type;
      document.getElementById('formStatus').value = appt.status;
      document.getElementById('formNotes').value  = appt.notes || '';
      document.getElementById('formClient').value = appt.client || '';
      document.getElementById('modalActions').innerHTML = `
        <button type="button" class="btn-danger" onclick="glowApp.deleteAppointment('${id}')">Delete</button>
        <button type="button" class="btn-ghost"  onclick="glowApp.closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>`;
    } else {
      document.getElementById('modalTitle').textContent = 'New Appointment';
      document.getElementById('formDate').value = new Date().toISOString().split('T')[0];
      if (prefill) {
        if (prefill.title) document.getElementById('formTitle').value = prefill.title;
        if (prefill.type)  document.getElementById('formType').value  = prefill.type;
        if (prefill.notes) document.getElementById('formNotes').value = prefill.notes;
      }
      document.getElementById('modalActions').innerHTML = `
        <button type="button" class="btn-ghost"  onclick="glowApp.closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>`;
    }

    document.getElementById('modalBackdrop').classList.remove('hidden');
    setTimeout(() => document.getElementById('formTitle').focus(), 80);
  }

  function closeModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    _editingId = null;
  }
  function closeModalIfBackdrop(e) {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  }
  function _populateTypeSelect(mode) {
    const types = mode === 'personal' ? PERSONAL_TYPES : COMPANY_TYPES;
    document.getElementById('formType').innerHTML = types.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  function saveAppointment(e) {
    e.preventDefault();
    const title  = document.getElementById('formTitle').value.trim();
    const date   = document.getElementById('formDate').value;
    const time   = document.getElementById('formTime').value;
    if (!title || !date || !time) return;

    const record = {
      id:     document.getElementById('formId').value || uid(),
      mode:   _apptMode,
      title,
      date,
      time,
      type:   document.getElementById('formType').value,
      status: document.getElementById('formStatus').value,
      notes:  document.getElementById('formNotes').value.trim(),
      client: document.getElementById('formClient').value.trim(),
    };

    const appts = loadAppointments();
    const idx = appts.findIndex(a => a.id === record.id);
    if (idx >= 0) { appts[idx] = record; } else { appts.push(record); }
    saveAppointments(appts);
    syncApptToBackend(record); // fire-and-forget

    closeModal();
    if (_currentScreen() === 'appointments') _renderApptList();
    if (_currentScreen() === 'home')         _renderHomePreview();
  }

  function deleteAppointment(id) {
    const appts = loadAppointments().filter(a => a.id !== id);
    saveAppointments(appts);
    deleteApptFromBackend(id); // fire-and-forget
    closeModal();
    if (_currentScreen() === 'appointments') _renderApptList();
    if (_currentScreen() === 'home')         _renderHomePreview();
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────
  const CHAT_KEY = 'glowai_chat_history';
  let _chatHistory = [];
  let _chatBusy = false;

  const OPENING_QUESTIONS = [
    "Hey! 🌺 How's your skin feeling today?",
    "Good to see you! ✨ Any skin concerns on your mind?",
    "Hi there! 💫 What's your skin doing lately — oily, dry, or somewhere in between?",
    "Aloha! 🌺 Ready to glow? Tell me what's going on with your skin.",
  ];

  // Smart mock replies when no backend configured
  const MOCK_REPLIES = [
    { keys: ['dry','flaky','tight','peel'],   reply: "Dry skin needs deep hydration! 💧 Try layering a hyaluronic acid serum under your moisturizer. Do you drink at least 8 glasses of water daily?" },
    { keys: ['oily','shiny','greasy','pores'], reply: "Oily skin is often dehydrated underneath — paradoxical, I know! 🫧 A lightweight gel moisturizer can actually help regulate oil. How often are you cleansing?" },
    { keys: ['acne','breakout','pimple','spot'],reply: "Breakouts can have so many triggers — stress, diet, products. 🔬 Have you tried a salicylic acid cleanser? And do you change your pillowcase weekly?" },
    { keys: ['dark','spot','scar','uneven'],   reply: "Dark spots usually fade with consistent vitamin C serum in the morning + SPF. ☀️ Are you using sunscreen every day, even indoors?" },
    { keys: ['wrinkle','aging','fine line','dull'], reply: "Retinol at night + SPF in the morning is the classic power combo for aging. 🧬 Have you tried a retinol yet?" },
    { keys: ['spf','sunscreen','sun'],         reply: "SPF is the #1 anti-aging ingredient — period! 🌞 I recommend at least SPF 30, reapplied every 2 hours outdoors. What SPF are you using?" },
    { keys: ['routine','cleanser','moisturizer','serum'], reply: "A solid routine is: gentle cleanser → toner (optional) → serum → moisturizer → SPF (AM). 🧴 What does your current routine look like?" },
    { keys: ['scan','camera','photo','picture','analyze'], reply: "Great idea! 📸 Tap the <strong>Scan Your Face</strong> button below and I'll analyze your skin with Claude Vision AI. It only takes a few seconds!" },
    { keys: ['appointment','book','doctor','derm'], reply: "Booking a dermatologist is always smart for persistent concerns! 📅 Want me to open the Appointments section so you can schedule one?" },
    { keys: ['hawaii','aloha','pearl','maui'],  reply: "Hawaii sun is intense year-round! 🌺 Make sure you're using a water-resistant SPF 50 and reapplying often. Mahalo for trusting GlowAI!" },
  ];

  function _mockChatReply(msg) {
    const lower = msg.toLowerCase();
    for (const { keys, reply } of MOCK_REPLIES) {
      if (keys.some(k => lower.includes(k))) return reply;
    }
    return "For the most personalized answer, connect your backend in Settings so GlowAI can use live AI responses. In the meantime, run a skin scan to get a quick consult-ready summary.";
  }

  async function _callChatAPI(message) {
    const base  = (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
    const token = localStorage.getItem('glowai_token') || 'dev-token';
    if (!base) throw new Error('NO_API_URL');

    const resp = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        message,
        history: _chatHistory.slice(-8), // last 4 exchanges
        user_id: localStorage.getItem('glowai_user_id') || 'default',
      }),
    });
    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data = await resp.json();
    return data.reply;
  }

  function _appendChatMsg(role, text, isHtml) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg-${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (isHtml) { bubble.innerHTML = text; } else { bubble.textContent = text; }
    div.appendChild(bubble);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function _showTyping() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot chat-typing-wrap';
    div.id = 'chatTyping';
    div.innerHTML = '<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function _removeTyping() {
    document.getElementById('chatTyping')?.remove();
  }

  function _initChat() {
    const container = document.getElementById('chatMessages');
    if (!container || container.children.length > 0) return;
    try { _chatHistory = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); } catch { _chatHistory = []; }

    if (_chatHistory.length > 0) {
      // Replay last 4 messages
      _chatHistory.slice(-4).forEach(m => _appendChatMsg(m.role, m.content, m.role === 'bot'));
    } else {
      const greeting = OPENING_QUESTIONS[Math.floor(Math.random() * OPENING_QUESTIONS.length)];
      _appendChatMsg('bot', greeting);
      _chatHistory.push({ role: 'bot', content: greeting });
    }
  }

  async function sendChat(e) {
    e.preventDefault();
    if (_chatBusy) return;
    const input = document.getElementById('chatInput');
    const msg = input?.value.trim();
    if (!msg) return;

    input.value = '';
    _chatBusy = true;
    _appendChatMsg('user', msg);
    _chatHistory.push({ role: 'user', content: msg });
    _showTyping();

    // Disable input while waiting
    if (input) input.disabled = true;

    let reply;
    try {
      reply = await _callChatAPI(msg);
    } catch {
      reply = _mockChatReply(msg);
    }

    _removeTyping();
    _appendChatMsg('bot', reply, true);
    _chatHistory.push({ role: 'bot', content: reply });

    // Persist last 20 messages
    localStorage.setItem(CHAT_KEY, JSON.stringify(_chatHistory.slice(-20)));

    if (input) input.disabled = false;
    input?.focus();
    _chatBusy = false;
  }

  // ── Settings ─────────────────────────────────────────────────────────────────
  function _loadSettings() {
    const urlEl   = document.getElementById('settingsApiUrl');
    const tokenEl = document.getElementById('settingsToken');
    if (urlEl)   urlEl.value   = localStorage.getItem('glowai_api_url')  || '';
    if (tokenEl) tokenEl.value = localStorage.getItem('glowai_token')    || '';
  }
  function saveSettings() {
    const url   = document.getElementById('settingsApiUrl')?.value.trim();
    const token = document.getElementById('settingsToken')?.value.trim();
    if (url)   localStorage.setItem('glowai_api_url', url);
    if (token) localStorage.setItem('glowai_token', token);
    const saved = document.getElementById('settingsSaved');
    if (saved) { saved.classList.remove('hidden'); setTimeout(() => saved.classList.add('hidden'), 2000); }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function _esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() {
    seedMockData();
    document.getElementById('headerBack').addEventListener('click', () => glowApp.goBack());
    window.addEventListener('popstate', () => { if (_history.length > 1) { _history.pop(); _render(); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    _render();
  }

  return {
    navigate, goBack, setApptMode,
    openModal, closeModal, closeModalIfBackdrop, saveAppointment, deleteAppointment,
    setScanState, showScanResult, bookFromScan,
    toggleConcern,
    getSelectedConcerns: () => [..._selectedConcerns],
    sendChat,
    saveSettings,
    init,
  };
})();

// Expose on window so scan.bundle.js can call window.glowApp.*
window.glowApp = glowApp;

document.addEventListener('DOMContentLoaded', () => glowApp.init());
