// AutoIQ Pro — app.js
// #ASSUMPTION: localStorage key 'glowai_appointments' stores planner service bookings.
// #ASSUMPTION: Backend URL in 'glowai_api_url'; token in 'glowai_token'.
// #ASSUMPTION: Offline-tolerant — all writes go to localStorage first, sync to backend in background.

'use strict';

const STORAGE_KEY = 'glowai_appointments';
const SESSION_KEY = 'glowai_studio_sessions';
const CAPTURE_KEY = 'glowai_studio_captures';
const STACK_KEY = 'glowai_stack_variants';
const LAST_STUDIO_PHOTO_KEY = 'glowai_last_studio_photo';

const MODULE_KEY_MAP = {
  skin: 'scan',
  brows: 'bumper',
  nails: 'wheel',
  toes: 'glass',
  outfit: 'panel',
  scan: 'scan',
  bumper: 'bumper',
  wheel: 'wheel',
  glass: 'glass',
  panel: 'panel',
};

const PERSONAL_TYPES = ['Body Shop', 'Dealer Service', 'Glass Repair', 'Mobile Mechanic', 'Paint Shop', 'Tire Shop', 'Detailer', 'Other'];

const TYPE_ICONS = {
  'Body Shop': '🛠️', 'Dealer Service': '🏬', 'Glass Repair': '🪟', 'Mobile Mechanic': '🚐',
  'Paint Shop': '🎨', 'Tire Shop': '🛞', Detailer: '🧽', Other: '📌',
};

const URGENCY_LABEL = { routine: 'Monitor and document', soon: 'Schedule repair soon', urgent: 'Drive carefully and inspect now' };
const URGENCY_COLOR = { routine: '#16a34a', soon: '#d97706', urgent: '#dc2626' };
const MODULE_META = {
  scan:   { icon: '🔬', label: 'Live Part ID', accent: 'rose' },
  bumper: { icon: '🛻', label: 'Bumper Mapper', accent: 'gold' },
  wheel:  { icon: '🛞', label: 'Wheel & Tire', accent: 'plum' },
  glass:  { icon: '💡', label: 'Glass & Lights', accent: 'teal' },
  panel:  { icon: '🎨', label: 'Panel & Paint', accent: 'slate' },
};
const TRY_ON_PRESETS = {
  bumper: {
    'lower-cover': { title: 'Lower Cover', note: 'Lower bumper cover impact with scrape and clip risk.' },
    'corner-hit': { title: 'Corner Hit', note: 'Corner bumper damage with wraparound seam involvement.' },
    'center-crack': { title: 'Center Crack', note: 'Front-center split or crack with likely bracket stress.' },
  },
  wheel: {
    'curb-rash': { title: 'Curb Rash', note: 'Wheel-face scrape with finish damage and cosmetic loss.' },
    'sidewall-mark': { title: 'Sidewall Mark', note: 'Tire sidewall hit that needs closer safety review.' },
    'tread-wear': { title: 'Tread Wear', note: 'Uneven tread wear pattern worth logging for alignment follow-up.' },
    'bent-lip': { title: 'Bent Lip', note: 'Possible rim lip bend or impact distortion near the edge.' },
  },
  glass: {
    'windshield-chip': { title: 'Windshield Chip', note: 'Small chip or star crack in the glass inspection zone.' },
    'lens-crack': { title: 'Lens Crack', note: 'Cracked headlight or taillight lens with moisture risk.' },
    'housing-break': { title: 'Housing Break', note: 'Broken lamp housing or mount near the light assembly.' },
    'trim-damage': { title: 'Trim Damage', note: 'Surrounding trim or seal damage around the glass area.' },
  },
  panel: {
    'dent-zone': { title: 'Dent Zone', note: 'Panel dent area with broad metal displacement.' },
    'paint-transfer': { title: 'Paint Transfer', note: 'Surface paint transfer that may polish out or need refinish work.' },
    'crease-line': { title: 'Crease Line', note: 'Sharper body-line deformation that can raise repair complexity.' },
    'clearcoat-break': { title: 'Clearcoat Break', note: 'Finish damage through the top coat with visible surface breakup.' },
  },
};
const DEFAULT_BUMPER_ALIGNMENT = {
  x: 15,
  y: 30,
  width: 34,
  height: 10,
  rotate: 6,
  offsetX: 0,
};
const DEFAULT_WHEEL_ALIGNMENT = {
  x: 12,
  y: 12,
  width: 76,
  height: 18,
  radius: 18,
};
const DEFAULT_GLASS_ALIGNMENT = {
  x: 10,
  y: 30,
  width: 82,
  height: 22,
  radius: 20,
};
const DEFAULT_PANEL_ALIGNMENT = {
  x: 14,
  y: 28,
  width: 68,
  height: 54,
  radius: 26,
};
const MODULE_CAPTURE_TARGET = {
  bumper: 'bumper photo',
  wheel: 'wheel photo',
  glass: 'glass or light photo',
  panel: 'panel photo',
};
const STACK_SCORE_WEIGHTS = {
  scan: 18,
  bumper: 22,
  wheel: 18,
  glass: 12,
  panel: 30,
};

function emptyStateHTML(icon, title, body) {
  return `<div class="empty-state"><span class="empty-icon">${icon}</span><div class="empty-title">${title}</div><p>${body}</p></div>`;
}

function normalizeModuleKey(module) {
  return MODULE_KEY_MAP[module] || module || 'scan';
}

function normalizeCaptureRecord(record = {}) {
  const next = { ...record };
  const legacyVariantMap = {
    bumper: { 'soft-lift': 'lower-cover', 'full-frame': 'corner-hit', 'clean-sculpt': 'center-crack' },
    wheel: { 'rose-glass': 'curb-rash', 'cherry-pop': 'sidewall-mark', 'mocha-satin': 'tread-wear', 'silver-chrome': 'bent-lip' },
    glass: { 'coral-wave': 'windshield-chip', 'ocean-mint': 'lens-crack', 'berry-gloss': 'housing-break', 'sand-nude': 'trim-damage' },
    panel: { 'city-noir': 'dent-zone', 'linen-muse': 'paint-transfer', 'cobalt-edge': 'crease-line', 'blush-set': 'clearcoat-break' },
  };
  if (next.variant) next.variant = legacyVariantMap[normalizeModuleKey(next.module || '')]?.[next.variant] || next.variant;
  return next;
}

function normalizeSession(session = {}) {
  const module = normalizeModuleKey(session.module);
  return {
    ...session,
    module,
    snapshot: session.snapshot ? normalizeCaptureRecord({ ...session.snapshot, module }) : session.snapshot || null,
  };
}

function normalizeSessionArray(list = []) {
  return list.map(normalizeSession);
}

function normalizeCapturesMap(map = {}) {
  const next = {};
  Object.entries(map || {}).forEach(([module, record]) => {
    const normalized = normalizeModuleKey(module);
    next[normalized] = normalizeCaptureRecord({ ...(record || {}), module: normalized });
  });
  return next;
}

function normalizeStackVariants(list = []) {
  return list.map(stack => ({
    ...stack,
    modules: (stack.modules || []).map(item => ({
      ...item,
      module: normalizeModuleKey(item.module),
    })),
  }));
}

function loadLastStudioPhoto() {
  try { return JSON.parse(localStorage.getItem(LAST_STUDIO_PHOTO_KEY) || 'null'); }
  catch { return null; }
}

function saveLastStudioPhoto(photo) {
  if (!photo?.dataUrl) {
    localStorage.removeItem(LAST_STUDIO_PHOTO_KEY);
    return;
  }
  localStorage.setItem(LAST_STUDIO_PHOTO_KEY, JSON.stringify({
    name: photo.name || `studio-photo-${Date.now()}.jpg`,
    dataUrl: photo.dataUrl,
    source: photo.source || 'studio',
    updatedAt: photo.updatedAt || new Date().toISOString(),
  }));
}

function _defaultImageTransform() {
  return { x: 0, y: 0 };
}

// ── Seed mock data once on first load ─────────────────────────────────────────
function seedMockData() {
  const existing = loadAppointments();
  if (existing.length > 0) return;
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const addDays = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  saveAppointments([
    { id: uid(), mode: 'personal', title: 'Front bumper inspection', date: fmt(addDays(2)), time: '10:00', type: 'Body Shop', status: 'confirmed', notes: 'Review scrape depth and clip damage', client: '' },
    { id: uid(), mode: 'personal', title: 'Wheel and tire check', date: fmt(addDays(4)), time: '13:30', type: 'Tire Shop', status: 'pending', notes: 'Confirm curb rash and sidewall condition', client: '' },
    { id: uid(), mode: 'personal', title: 'Glass repair quote', date: fmt(addDays(6)), time: '16:00', type: 'Glass Repair', status: 'confirmed', notes: 'Compare chip fill versus replacement', client: '' },
  ]);
}

function seedStudioSessions() {
  const existing = loadSessions();
  if (existing.length > 0) return;
  saveSessions([
    {
      id: uid(),
      module: 'scan',
      title: 'Primary damage triage',
      status: 'active',
      note: 'Start with part ID, confidence check, and repair-readiness notes.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      module: 'bumper',
      title: 'Front bumper case',
      status: 'draft',
      note: 'Corner scrape and lower cover damage mapped for follow-up.',
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: uid(),
      module: 'panel',
      title: 'Passenger door panel case',
      status: 'draft',
      note: 'Dent, paint transfer, and finish notes saved for a body-shop quote.',
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);
}

// ── Storage helpers ────────────────────────────────────────────────────────────
function loadAppointments() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveAppointments(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
function loadSessions() {
  try { return normalizeSessionArray(JSON.parse(localStorage.getItem(SESSION_KEY) || '[]')); }
  catch { return []; }
}
function saveSessions(arr) { localStorage.setItem(SESSION_KEY, JSON.stringify(arr)); }
function loadCaptures() {
  try { return normalizeCapturesMap(JSON.parse(localStorage.getItem(CAPTURE_KEY) || '{}')); }
  catch { return {}; }
}
function saveCaptures(obj) { localStorage.setItem(CAPTURE_KEY, JSON.stringify(obj)); }
function loadStackVariants() {
  try { return normalizeStackVariants(JSON.parse(localStorage.getItem(STACK_KEY) || '[]')); }
  catch { return []; }
}
function saveStackVariants(arr) { localStorage.setItem(STACK_KEY, JSON.stringify(arr)); }
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
  let _editingId = null;
  let _lastScanResult = null;
  let _plannerTab = 'looks';
  let _studioWorkspace = null;
  let _compareSlots = { left: null, right: null, focus: 'left' };
  let _stackCompare = { left: null, right: null };
  let _stackEditorState = null;

  const SCREENS = {
    home:       { title: 'AutoIQ Pro',      showBack: false, navId: 'navHome' },
    appointments:{ title: 'Caseboard',      showBack: true,  navId: 'navAppointments' },
    analysis:   { title: 'Camera Triage',   showBack: true,  navId: 'navAnalysis' },
    scanResult: { title: 'Repair Guidance', showBack: true,  navId: 'navAnalysis' },
    profile:    { title: 'Profile',       showBack: true,  navId: 'navProfile' },
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
        `<button onclick="glowApp.plannerPrimaryAction()" title="Add">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>`;
    }
    if (current === 'home') {
      document.getElementById('headerAction').innerHTML =
        `<button onclick="glowApp.navigate('settings')" title="Settings" aria-label="Settings">⚙️</button>`;
    }

    if (current === 'home')         { _renderHomePreview(); _initChat(); }
    if (current === 'appointments') _renderPlanner();
    if (current === 'analysis') {
      const analysisScreen = document.getElementById('screenAnalysis');
      if (analysisScreen) analysisScreen.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'auto' });
      _syncStudioWorkspace();
      _syncAllStudioCaptureUI();
    }
    if (current === 'profile')      _renderProfile();
    if (current === 'settings')     _loadSettings();
  }

  // ── Home preview ──────────────────────────────────────────────────────────────
  function _renderHomePreview() {
    const container = document.getElementById('homeApptPreview');
    if (!container) return;
    const sessions = loadSessions().sort(_sortSessionsByRecent).slice(0, 2);
    const stacks = _sortedStackVariants();
    const signature = stacks[0] || null;
    const bookings = loadAppointments()
      .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
      .sort(_sortByDateTime).slice(0, 2);

    container.innerHTML = `
      ${signature ? _homeSignatureHTML(signature) : ''}
      <div class="planner-home-grid">
        <div class="planner-home-stat">
          <span class="planner-home-stat-kicker">Saved Cases</span>
          <strong>${loadSessions().length}</strong>
          <span class="planner-home-stat-copy">Saved captures, notes, and repair-ready case areas.</span>
        </div>
        <div class="planner-home-stat">
          <span class="planner-home-stat-kicker">Scheduled Follow-Up</span>
          <strong>${bookings.length}</strong>
          <span class="planner-home-stat-copy">Your next inspections, quotes, and repair visits.</span>
        </div>
      </div>
      <div class="planner-home-stack">
        ${sessions.length
          ? sessions.map(s => _sessionCardHTML(s)).join('')
          : emptyStateHTML('🚗', 'No saved cases yet', 'Open Cases to save a bumper, wheel, glass, or panel case and start building your repair library.')}
        ${bookings.length
          ? bookings.map(a => _apptCardHTML(a, false)).join('')
          : ''}
      </div>`;
  }

  function _homeSignatureHTML(stack) {
    const coverage = Math.round(((stack.modules?.filter(Boolean).length || 0) / 5) * 100);
    const signatureLabel = stack.isDefault ? 'Signature Stack' : stack.favorite ? 'Favorite Stack' : 'Lead Stack';
    return `
      <section class="home-signature-card">
        <div class="home-signature-top">
          <div>
            <span class="home-signature-kicker">${_esc(signatureLabel)}</span>
            <h3 class="home-signature-title">${_esc(stack.name)}</h3>
            <p class="home-signature-copy">${_esc(stack.tone)} direction with ${coverage}% coverage across your repair stack.</p>
          </div>
          <div class="home-signature-score">
            <strong>${coverage}%</strong>
            <span>ready</span>
          </div>
        </div>
        ${_stackVariantPreviewHTML(stack)}
        <div class="home-signature-tags">
          ${(stack.modules || []).slice(0, 4).map(module => {
            const meta = MODULE_META[module.module] || MODULE_META.scan;
            return `<span class="compare-chip compare-${meta.accent}">${meta.icon} ${_esc(module.variantTitle || meta.label)}</span>`;
          }).join('')}
        </div>
        <div class="home-signature-actions">
          <button class="compare-pin-btn" onclick="glowApp.applyStackVariant('${stack.id}')">Load Signature</button>
          <button class="compare-pin-btn alt" onclick="glowApp.openStackCompareFromHome('${stack.id}')">Compare It</button>
        </div>
      </section>`;
  }

  function _renderPlanner() {
    const summary = document.getElementById('plannerSummary');
    if (summary) summary.innerHTML = _plannerSummaryHTML();
    _syncPlannerTabs();
    if (_plannerTab === 'looks') {
      _renderLooksList();
      return;
    }
    if (_plannerTab === 'compare') {
      _renderCompareLooks();
      return;
    }
    _renderCalendarList();
  }

  function _renderLooksList() {
    const container = document.getElementById('apptList');
    if (!container) return;
    const list = loadSessions().sort(_sortSessionsByRecent);
    if (list.length === 0) {
      container.innerHTML = emptyStateHTML('🚗', 'No cases saved yet', 'Create a bumper, wheel, glass, or panel case to start building the shared AutoIQ Pro caseboard.');
      return;
    }
    container.innerHTML = list.map(s => _sessionCardHTML(s)).join('');
  }

  function _renderCalendarList() {
    const container = document.getElementById('apptList');
    if (!container) return;
    const list = loadAppointments()
      .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
      .sort(_sortByDateTime);
    if (list.length === 0) {
      container.innerHTML = emptyStateHTML('📅', 'No services on deck', 'Add a body shop, glass repair, or tire visit so your repair plan has real dates attached.');
      return;
    }
    container.innerHTML = list.map(a => _apptCardHTML(a, true)).join('');
  }

  function _renderCompareLooks() {
    const container = document.getElementById('apptList');
    if (!container) return;
    const saved = loadSessions()
      .filter(session => session.snapshot?.dataUrl)
      .sort(_sortSessionsByRecent);
    if (saved.length === 0) {
      container.innerHTML = emptyStateHTML('🗂️', 'No cases ready to compare', 'Save two cases from Camera Triage and AutoIQ Pro will build a side-by-side compare board here.');
      return;
    }
    const featured = _buildCompareFeatured(saved);
    const compareList = featured.length ? featured : saved.slice(0, 6);
    _ensureCompareSlots(compareList);
    const badges = compareList.map(session => {
      const meta = MODULE_META[session.module] || MODULE_META.scan;
      return `<span class="compare-chip compare-${meta.accent}">${meta.icon} ${meta.label}</span>`;
    }).join('');
    const left = compareList.find(session => session.id === _compareSlots.left) || null;
    const right = compareList.find(session => session.id === _compareSlots.right) || null;
    container.innerHTML = `
      <section class="compare-shell" aria-label="Compare saved cases">
        <div class="compare-hero">
          <div>
            <span class="compare-kicker">Caseboard Compare</span>
            <h3 class="compare-title">Review repair decisions together.</h3>
            <p class="compare-copy">Compare saved cases across repair areas so bumper, wheel, glass, and panel findings stay consistent instead of becoming isolated notes.</p>
          </div>
          <div class="compare-chip-row">${badges}</div>
        </div>
        ${_compareSpotlightHTML(left, right)}
        ${_compareRecommendationHTML(left, right)}
        ${_fullStackBoardHTML(saved)}
        <div class="compare-grid">
          ${compareList.map(session => _compareCardHTML(session)).join('')}
        </div>
      </section>`;
  }

  function _buildCompareFeatured(sessions) {
    const seen = new Set();
    const featured = [];
    sessions.forEach(session => {
      if (seen.has(session.module)) return;
      seen.add(session.module);
      featured.push(session);
    });
    return featured;
  }

  function _sortByDateTime(a, b) {
    const da = a.date + 'T' + (a.time || '00:00');
    const db = b.date + 'T' + (b.time || '00:00');
    return da < db ? -1 : da > db ? 1 : 0;
  }

  function _sortSessionsByRecent(a, b) {
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
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
        <div class="appt-badge personal">${icon}</div>
        <div class="appt-info">
          <div class="appt-title">${_esc(a.title)}</div>
          <div class="appt-meta">${fmtDate(a.date)} · ${fmtTime(a.time)}${a.type ? ' · ' + _esc(a.type) : ''}</div>
        </div>
        <span class="appt-status ${_statusClass(a.status)}">${statusLabel}</span>
      </button>`;
  }

  function _sessionCardHTML(session) {
    const meta = MODULE_META[session.module] || MODULE_META.scan;
    const status = session.status === 'active' ? 'Active' : session.status === 'ready' ? 'Ready' : 'Draft';
    const updated = new Date(session.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const action = session.module === 'bumper' || session.module === 'wheel' || session.module === 'glass' || session.module === 'panel'
      ? `onclick="glowApp.openPlannerSession('${session.id}')"`
      : `onclick="glowApp.showStudioNotice('${_esc(meta.label)} is staged in the planner and will become interactive in a later pass.')"`
    return `
      <article class="session-card session-${meta.accent}">
        <div class="session-card-top">
          <div class="session-module-pill">${meta.icon} ${meta.label}</div>
          <div class="session-status-pill">${status}</div>
        </div>
        <div class="session-title">${_esc(session.title)}</div>
        <p class="session-copy">${_esc(session.note || 'Draft case saved to your caseboard.')}</p>
        <div class="session-footer">
          <span>Updated ${updated}</span>
          <button class="session-open-btn" ${action}>Open case</button>
        </div>
      </article>`;
  }

  function _compareCardHTML(session) {
    const meta = MODULE_META[session.module] || MODULE_META.scan;
    const snapshot = session.snapshot || {};
    const updated = new Date(session.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isLeft = _compareSlots.left === session.id;
    const isRight = _compareSlots.right === session.id;
    const coordinated = _sessionIsCoordinated(session);
    return `
      <article class="compare-card compare-${meta.accent}">
        <div class="compare-card-top">
          <div class="session-module-pill">${meta.icon} ${meta.label}</div>
          <div class="compare-updated">Updated ${updated}</div>
        </div>
        <div class="compare-stage-shell">
          ${_snapshotStageHTML(session)}
        </div>
        <div class="compare-body">
          <div class="compare-session-title">${_esc(session.title)}</div>
          <div class="compare-variant-row">
            <strong>${_esc(snapshot.variantTitle || 'Reference Saved')}</strong>
            <span>${_esc(snapshot.variant || 'capture')}</span>
          </div>
          <p class="compare-note">${_esc(session.note || snapshot.variantNote || 'Saved case snapshot.')}</p>
          <div class="compare-card-badges">
            ${coordinated ? '<span class="compare-status-badge ready">Coordinated</span>' : '<span class="compare-status-badge">Solo Study</span>'}
            ${isLeft ? '<span class="compare-slot-badge">Pinned A</span>' : ''}
            ${isRight ? '<span class="compare-slot-badge alt">Pinned B</span>' : ''}
          </div>
        </div>
        <div class="compare-actions">
          <button class="compare-pin-btn" onclick="glowApp.pinCompareSlot('left','${session.id}')">${isLeft ? 'Pinned A' : 'Pin A'}</button>
          <button class="compare-pin-btn alt" onclick="glowApp.pinCompareSlot('right','${session.id}')">${isRight ? 'Pinned B' : 'Pin B'}</button>
          <button class="session-open-btn" onclick="glowApp.openPlannerSession('${session.id}')">Open case</button>
        </div>
      </article>`;
  }

  function _compareSpotlightHTML(left, right) {
    const activeSlot = _compareSlots.focus === 'right' ? 'right' : 'left';
    const active = activeSlot === 'right' ? right : left;
    return `
      <section class="compare-spotlight">
        <div class="compare-toolbar">
          <div class="compare-toggle-group" role="tablist" aria-label="Compare spotlight">
            <button class="compare-toggle ${activeSlot === 'left' ? 'active' : ''}" onclick="glowApp.focusCompareSlot('left')" aria-selected="${String(activeSlot === 'left')}">A Spotlight</button>
            <button class="compare-toggle ${activeSlot === 'right' ? 'active' : ''}" onclick="glowApp.focusCompareSlot('right')" aria-selected="${String(activeSlot === 'right')}">B Spotlight</button>
          </div>
          <button class="compare-swap-btn" onclick="glowApp.swapCompareSlots()">Swap Cases</button>
        </div>
        <div class="compare-duel-grid">
          ${_comparePinnedPanelHTML('left', left)}
          ${_comparePinnedPanelHTML('right', right)}
        </div>
        <div class="compare-spotlight-stage">
          ${active ? `
            <div class="compare-spotlight-copy">
              <span class="compare-kicker">Live Spotlight</span>
              <h4 class="compare-spotlight-title">${_esc(active.title)}</h4>
              <p class="compare-copy">${_esc(active.note || active.snapshot?.variantNote || 'Saved case snapshot.')}</p>
            </div>
            <div class="compare-spotlight-frame">
              ${_snapshotStageHTML(active)}
            </div>`
            : `<div class="compare-spotlight-empty">Pin a saved case into slot A or B to create a fast compare spotlight.</div>`}
        </div>
      </section>`;
  }

  function _comparePinnedPanelHTML(slot, session) {
    const active = _compareSlots.focus === slot;
    const label = slot === 'left' ? 'A' : 'B';
    if (!session) {
      return `
        <div class="compare-pinned-panel empty ${active ? 'active' : ''}">
          <span class="compare-slot-label">Slot ${label}</span>
          <strong>Nothing pinned yet</strong>
          <span>Use the Pin buttons below to build a head-to-head compare.</span>
        </div>`;
    }
      const meta = MODULE_META[session.module] || MODULE_META.scan;
    return `
      <button class="compare-pinned-panel ${active ? 'active' : ''}" onclick="glowApp.focusCompareSlot('${slot}')">
        <span class="compare-slot-label">Slot ${label}</span>
        <strong>${meta.icon} ${_esc(session.title)}</strong>
        <span>${_esc(session.snapshot?.variantTitle || meta.label)}</span>
      </button>`;
  }

  function _compareRecommendationHTML(left, right) {
    const recommendation = _buildCompareRecommendation(left, right);
    return `
      <section class="compare-recommendation">
        <div class="compare-recommendation-copy">
          <span class="compare-kicker">AutoIQ Direction</span>
          <h4 class="compare-recommendation-title">${_esc(recommendation.title)}</h4>
          <p class="compare-copy">${_esc(recommendation.body)}</p>
        </div>
        <div class="compare-recommendation-points">
          ${recommendation.points.map(point => `<div class="compare-point">${_esc(point)}</div>`).join('')}
        </div>
      </section>`;
  }

  function _fullStackBoardHTML(sessions) {
    const bundle = _buildFullStackBundle(sessions);
    return `
      <section class="full-stack-board">
        <div class="full-stack-hero">
          <div>
            <span class="compare-kicker">Full Stack</span>
            <h4 class="full-stack-title">${_esc(bundle.title)}</h4>
            <p class="compare-copy">${_esc(bundle.body)}</p>
          </div>
          <div class="full-stack-score-shell">
            <span class="full-stack-score-kicker">Coverage</span>
            <strong>${bundle.coverage}%</strong>
            <span>${bundle.coveredCount}/${bundle.totalCount} case areas</span>
          </div>
        </div>
        <div class="full-stack-progress">
          <div class="full-stack-progress-bar">
            <span style="width:${bundle.coverage}%"></span>
          </div>
        </div>
        <div class="full-stack-grid">
          ${bundle.cards.map(card => card.session ? _fullStackCardHTML(card) : _fullStackMissingCardHTML(card)).join('')}
        </div>
        <div class="full-stack-actions">
          <div class="full-stack-actions-copy">
            <strong>Turn this bundle into a reusable case stack.</strong>
            <span>Save the current coverage, tone, and case mix so you can reload it later without rebuilding the repair picture from scratch.</span>
          </div>
          <button class="compare-pin-btn" onclick="glowApp.saveCurrentStackVariant()">${bundle.coveredCount === bundle.totalCount ? 'Save Complete Stack' : 'Save Stack Variant'}</button>
        </div>
        ${_fullStackConciergeHTML(bundle)}
        ${_stackCompareHTML()}
        ${_stackLibraryHTML()}
        <div class="full-stack-footer">
          ${bundle.nextSteps.map(step => `<div class="compare-point">${_esc(step)}</div>`).join('')}
        </div>
      </section>`;
  }

  function _fullStackConciergeHTML(bundle) {
    const brief = _buildConciergeBrief(bundle);
    return `
      <section class="concierge-board">
        <div class="concierge-top">
          <div>
            <span class="compare-kicker">AutoIQ Concierge</span>
            <h4 class="concierge-title">${_esc(brief.title)}</h4>
            <p class="compare-copy">${_esc(brief.body)}</p>
          </div>
          <div class="concierge-badge">${_esc(brief.badge)}</div>
        </div>
        <div class="concierge-grid">
          ${brief.cards.map(card => `
            <article class="concierge-card ${card.tone}">
              <span class="concierge-card-kicker">${_esc(card.kicker)}</span>
              <strong>${_esc(card.title)}</strong>
              <p>${_esc(card.body)}</p>
            </article>
          `).join('')}
        </div>
      </section>`;
  }

  function _buildConciergeBrief(bundle) {
    const covered = bundle.cards.filter(card => card.session);
    const missing = bundle.cards.filter(card => !card.session);
    const leader = covered
      .slice()
      .sort((a, b) => (STACK_SCORE_WEIGHTS[b.module] || 0) - (STACK_SCORE_WEIGHTS[a.module] || 0))[0] || null;
    const nextService = loadAppointments()
      .filter(item => item.status !== 'cancelled' && item.status !== 'completed')
      .sort(_sortByDateTime)[0] || null;

    const title = bundle.coveredCount >= 4
      ? 'A coordinated repair picture is starting to emerge'
      : 'This case stack can still gain leverage fast';
    const body = bundle.coveredCount >= 4
      ? 'AutoIQ Pro is now doing what most estimate apps never reach: connecting multiple repair decisions into one reusable case system.'
      : 'Most estimate tools stop at one photo. AutoIQ Pro gets stronger as soon as you connect scan, part-specific evidence, and follow-up timing into the same stack.';
    const badge = bundle.coveredCount === bundle.totalCount ? 'Full Case Ready' : `${bundle.coveredCount}/${bundle.totalCount} Active`;

    const keepCard = leader
      ? {
          kicker: 'Keep',
          title: `${leader.meta.label} is your anchor`,
          body: `${leader.session.snapshot?.variantTitle || leader.session.title} is carrying the strongest signal in this stack. Keep it stable while the rest of the case fills in around it.`,
          tone: 'keep',
        }
      : {
          kicker: 'Keep',
          title: 'No anchor yet',
          body: 'Save one strong case first so AutoIQ Pro has something reliable to build around.',
          tone: 'keep',
        };

    const elevateCard = missing[0]
      ? {
          kicker: 'Elevate',
          title: `Add ${missing[0].meta.label} next`,
          body: `That is the fastest way to move beyond one-off scans and make this feel like a complete repair system.`,
          tone: 'elevate',
        }
      : {
          kicker: 'Elevate',
          title: 'Create an alternate stack',
          body: 'You already have full coverage. Save an alternate variation so Compare can make sharper recommendations.',
          tone: 'elevate',
        };

    const deployCard = nextService
      ? {
          kicker: 'Deploy',
          title: `Prep for ${nextService.title}`,
          body: `Your next service is ${fmtDate(nextService.date)} at ${fmtTime(nextService.time)}. Use this stack as the visual brief before you go.`,
          tone: 'deploy',
        }
      : {
          kicker: 'Deploy',
          title: bundle.coveredCount >= 3 ? 'Book the repair' : 'Save before you book',
          body: bundle.coveredCount >= 3
            ? 'You have enough signal to walk into a body shop, tire shop, or glass repair appointment with a clear case and compare history.'
            : 'Add one more strong case area before turning this into an appointment-ready repair brief.',
          tone: 'deploy',
        };

    return {
      title,
      body,
      badge,
      cards: [keepCard, elevateCard, deployCard],
    };
  }

  function _buildFullStackBundle(sessions) {
    const order = ['scan', 'bumper', 'wheel', 'glass', 'panel'];
    const latestByModule = {};
    sessions.forEach(session => {
      if (!latestByModule[session.module]) latestByModule[session.module] = session;
    });
    const cards = order.map(module => ({
      module,
      meta: MODULE_META[module] || MODULE_META.scan,
      session: latestByModule[module] || null,
    }));
    const covered = cards.filter(card => card.session);
    const missing = cards.filter(card => !card.session);
    const coverage = Math.round((covered.length / order.length) * 100);
    const tone = _compareTone(covered.map(card => card.session));
    const title = covered.length === order.length
      ? `Complete ${tone} case ready`
      : `${tone.charAt(0).toUpperCase() + tone.slice(1)} case in progress`;
    const body = covered.length === order.length
      ? 'AutoIQ Pro now has a saved direction for every major repair area. This is your strongest coordinated repair bundle so far.'
      : `AutoIQ Pro can already read ${covered.length} case areas together. Fill the remaining gaps so damage evidence, part correction, and follow-up all move in the same direction.`;
    const nextSteps = missing.length
      ? missing.map(card => `Add ${card.meta.label} to push this stack toward a complete repair case.`)
      : [
          'This stack is complete. Save alternate variants if you want a conservative and a more severe bundle.',
          'Use Compare to pin one full-stack anchor and test a second case-area swap against it.',
        ];
    return {
      title,
      body,
      coverage,
      coveredCount: covered.length,
      totalCount: order.length,
      cards,
      nextSteps,
    };
  }

  function _fullStackCardHTML(card) {
    const session = card.session;
    const snapshot = session.snapshot || {};
    return `
      <article class="full-stack-card full-stack-${card.meta.accent}">
        <div class="full-stack-card-top">
          <div class="session-module-pill">${card.meta.icon} ${card.meta.label}</div>
          <span class="full-stack-state">Ready</span>
        </div>
        <div class="full-stack-stage">
          ${_snapshotStageHTML(session)}
        </div>
        <div class="full-stack-body">
          <strong>${_esc(snapshot.variantTitle || session.title)}</strong>
          <span>${_esc(session.note || snapshot.variantNote || 'Saved case snapshot.')}</span>
        </div>
        <button class="session-open-btn" onclick="glowApp.openPlannerSession('${session.id}')">Open case</button>
      </article>`;
  }

  function _fullStackMissingCardHTML(card) {
    return `
      <article class="full-stack-card missing">
        <div class="full-stack-card-top">
          <div class="session-module-pill">${card.meta.icon} ${card.meta.label}</div>
          <span class="full-stack-state muted">Missing</span>
        </div>
        <div class="full-stack-empty">
          <strong>${card.meta.label} not saved yet</strong>
          <span>Build this case area in Camera Triage so the full-stack board can grade your complete repair case.</span>
        </div>
        <button class="session-open-btn" onclick="glowApp.openStudioWorkspace('${card.module === 'scan' ? 'bumper' : card.module}')">${card.module === 'scan' ? 'Open Workspace' : 'Start case'}</button>
      </article>`;
  }

  function _stackLibraryHTML() {
    const stacks = _sortedStackVariants();
    _ensureStackCompare(stacks);
    if (!stacks.length) {
      return `
        <section class="stack-library empty">
          <div class="stack-library-top">
            <span class="compare-kicker">Case Library</span>
            <h4 class="stack-library-title">No named stacks yet</h4>
          </div>
          <p class="compare-copy">Save the current full-stack board to start building reusable case stacks for light damage, moderate repair, or quote-ready inspections.</p>
        </section>`;
    }
    return `
      <section class="stack-library">
        <div class="stack-library-top">
          <span class="compare-kicker">Case Library</span>
          <h4 class="stack-library-title">Named stack variants</h4>
        </div>
        <div class="stack-library-grid">
          ${stacks.map(stack => _stackVariantCardHTML(stack)).join('')}
        </div>
      </section>`;
  }

  function _stackVariantCardHTML(stack) {
    const coverage = Math.round(((stack.modules?.filter(Boolean).length || 0) / 5) * 100);
    const updated = new Date(stack.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `
      <article class="stack-variant-card ${stack.isDefault ? 'signature' : ''} ${stack.favorite ? 'favorite' : ''}">
        <div class="stack-variant-top">
          <div>
            <strong>${_esc(stack.name)}</strong>
            <span>${_esc(stack.tone)} direction</span>
          </div>
          <span class="stack-variant-score">${coverage}%</span>
        </div>
        <div class="stack-variant-badges">
          ${stack.isDefault ? '<span class="compare-slot-badge">Signature</span>' : ''}
          ${stack.favorite ? '<span class="compare-status-badge ready">Favorite</span>' : ''}
        </div>
        <div class="stack-variant-meta">
          <span>${(stack.modules || []).length} case areas saved</span>
          <span>Updated ${updated}</span>
        </div>
        ${_stackHybridReviewHTML(stack)}
        ${_stackVariantPreviewHTML(stack)}
        <div class="stack-variant-tags">
          ${(stack.modules || []).map(module => {
            const meta = MODULE_META[module.module] || MODULE_META.scan;
            return `<span class="compare-chip compare-${meta.accent}">${meta.icon} ${_esc(module.variantTitle || meta.label)}</span>`;
          }).join('')}
        </div>
        <div class="stack-variant-actions">
          <button class="compare-pin-btn alt" onclick="glowApp.pinStackCompare('left','${stack.id}')">${_stackCompare.left === stack.id ? 'Stack A' : 'Pin A'}</button>
          <button class="compare-pin-btn alt" onclick="glowApp.pinStackCompare('right','${stack.id}')">${_stackCompare.right === stack.id ? 'Stack B' : 'Pin B'}</button>
          <button class="compare-pin-btn alt" onclick="glowApp.openStackModuleSwapEditor('${stack.id}')">Swap Case Area</button>
          <button class="compare-pin-btn alt" onclick="glowApp.openStackRenameEditor('${stack.id}')">Rename</button>
          <button class="compare-pin-btn alt" onclick="glowApp.toggleFavoriteStackVariant('${stack.id}')">${stack.favorite ? 'Unfavorite' : 'Favorite'}</button>
          <button class="compare-pin-btn alt" onclick="glowApp.setDefaultStackVariant('${stack.id}')">${stack.isDefault ? 'Signature' : 'Set Signature'}</button>
          <button class="compare-pin-btn" onclick="glowApp.applyStackVariant('${stack.id}')">Load Stack</button>
        </div>
      </article>`;
  }

  function _stackHybridReviewHTML(stack) {
    if (!stack.hybridFrom || !stack.hybridSources) return '';
    const rows = Object.entries(stack.hybridSources);
    if (!rows.length) return '';
    return `
      <div class="stack-hybrid-review">
        <div class="stack-hybrid-top">
          <span class="compare-kicker">Hybrid Review</span>
          <strong>${_esc(stack.hybridFrom.leftName)} + ${_esc(stack.hybridFrom.rightName)}</strong>
        </div>
        <div class="stack-hybrid-list">
          ${rows.map(([module, source]) => {
            const meta = MODULE_META[module] || MODULE_META.scan;
            const alt = _hybridAlternateSourceLabel(stack, module, source);
            return `<div class="stack-hybrid-row"><span>${meta.icon} ${meta.label}</span><div class="stack-hybrid-row-actions"><strong>${_esc(source)}</strong>${alt ? `<button class="stack-hybrid-swap-btn" onclick="glowApp.toggleHybridModuleSource('${stack.id}','${module}')">Use ${_esc(alt)}</button>` : ''}</div></div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function _hybridAlternateSourceLabel(stack, module, currentSource) {
    const candidates = stack.hybridCandidates?.[module];
    if (!candidates) return '';
    if (candidates.leftName && candidates.leftName !== currentSource && candidates.left) return candidates.leftName;
    if (candidates.rightName && candidates.rightName !== currentSource && candidates.right) return candidates.rightName;
    return '';
  }

  function _stackCompareHTML() {
    const stacks = _sortedStackVariants();
    if (!stacks.length) return '';
    _ensureStackCompare(stacks);
    const left = stacks.find(stack => stack.id === _stackCompare.left) || null;
    const right = stacks.find(stack => stack.id === _stackCompare.right) || null;
    const diff = _stackCompareDiff(left, right);
    const scoring = _stackScorePair(left, right);
    const recommendation = _stackCompareRecommendation(left, right);
    const actions = _stackActionPlan(left, right, diff, scoring);
    return `
      <section class="stack-compare-board">
        <div class="stack-compare-top">
          <div>
            <span class="compare-kicker">Stack Compare</span>
            <h4 class="stack-compare-title">Compare named case stacks as full bundles.</h4>
            <p class="compare-copy">Pin two saved stacks and AutoIQ Pro will judge them as complete systems, not just isolated case areas.</p>
          </div>
          <button class="compare-swap-btn" onclick="glowApp.swapStackCompare()">Swap Stacks</button>
        </div>
        <div class="stack-compare-grid">
          ${_stackComparePanelHTML('A', left, scoring.left)}
          ${_stackComparePanelHTML('B', right, scoring.right)}
        </div>
        ${_stackScoreHTML(scoring)}
        ${_stackCompareDiffHTML(diff)}
        ${_stackActionPlanHTML(actions, left, right, scoring)}
        <div class="stack-compare-summary">
          <strong>${_esc(recommendation.title)}</strong>
          <p>${_esc(recommendation.body)}</p>
        </div>
      </section>`;
  }

  function _stackComparePanelHTML(label, stack, score) {
    if (!stack) {
      return `
        <div class="stack-compare-panel empty">
          <span class="compare-slot-label">Stack ${label}</span>
          <strong>No stack pinned</strong>
          <span>Use Pin A or Pin B in the library below.</span>
        </div>`;
    }
    const coverage = Math.round(((stack.modules?.filter(Boolean).length || 0) / 5) * 100);
    return `
      <div class="stack-compare-panel">
        <span class="compare-slot-label">Stack ${label}</span>
        <strong>${_esc(stack.name)}</strong>
        <span>${_esc(stack.tone)} direction</span>
        ${_stackVariantPreviewHTML(stack)}
        <div class="stack-compare-meta">
          <span>${coverage}% coverage</span>
          <span>${score?.total || 0} pts</span>
        </div>
      </div>`;
  }

  function _ensureStackCompare(stacks) {
    const ids = new Set(stacks.map(stack => stack.id));
    if (_stackCompare.left && !ids.has(_stackCompare.left)) _stackCompare.left = null;
    if (_stackCompare.right && !ids.has(_stackCompare.right)) _stackCompare.right = null;
    if (!_stackCompare.left && stacks[0]) _stackCompare.left = stacks[0].id;
    if ((!_stackCompare.right || _stackCompare.right === _stackCompare.left) && stacks[1]) _stackCompare.right = stacks[1].id;
    if (!_stackCompare.right && stacks[0] && stacks.length === 1) _stackCompare.right = stacks[0].id;
  }

  function _stackCompareRecommendation(left, right) {
    if (!left && !right) {
      return {
        title: 'Start by pinning two named stacks',
        body: 'The library will compare coverage, tone, and case completeness once both slots are filled.',
      };
    }
    if (left && right && left.id === right.id) {
      return {
        title: 'You are comparing the same stack twice',
        body: 'Pin a different saved case to the second slot so AutoIQ Pro can surface a real full-bundle recommendation.',
      };
    }
    const diff = _stackCompareDiff(left, right);
    const scoring = _stackScorePair(left, right);
    const pair = [left, right].filter(Boolean);
    const best = scoring.left.total >= scoring.right.total ? left : right;
    const tone = best?.tone || 'balanced';
    const focus = diff.changed.length ? `The biggest change is in ${diff.changed.map(item => MODULE_META[item].label).join(', ')}.` : 'The two stacks are currently very close.';
    return {
      title: `${best?.name || 'Current stack'} leads right now`,
      body: `${best?.name || 'This stack'} has the stronger ${tone} bundle signal at ${Math.max(scoring.left.total, scoring.right.total)} points. ${focus} Keep it as the anchor if you want the most complete repair system, and use the other stack as the contrast option.`,
    };
  }

  function _stackScorePair(left, right) {
    return {
      left: _stackScore(left),
      right: _stackScore(right),
    };
  }

  function _stackScore(stack) {
    const map = Object.fromEntries(((stack?.modules) || []).map(item => [item.module, item]));
    const rows = Object.entries(STACK_SCORE_WEIGHTS).map(([module, weight]) => {
      const present = Boolean(map[module]);
      return {
        module,
        weight,
        present,
        score: present ? weight : 0,
      };
    });
    return {
      total: rows.reduce((sum, row) => sum + row.score, 0),
      rows,
    };
  }

  function _stackScoreHTML(scoring) {
    return `
      <section class="stack-score-board">
        <div class="stack-diff-top">
          <span class="compare-kicker">Score Detail</span>
          <strong>${scoring.left.total} vs ${scoring.right.total}</strong>
        </div>
        <div class="stack-score-list">
          ${scoring.left.rows.map((row, index) => {
            const meta = MODULE_META[row.module] || MODULE_META.scan;
            const rightRow = scoring.right.rows[index];
            return `
              <div class="stack-score-row">
                <div class="stack-diff-module">${meta.icon} ${meta.label}</div>
                <div class="stack-score-bars">
                  <div class="stack-score-bar">
                    <span style="width:${row.score ? Math.max((row.score / row.weight) * 100, 16) : 0}%"></span>
                    <strong>${row.score}/${row.weight}</strong>
                  </div>
                  <div class="stack-score-bar">
                    <span style="width:${rightRow.score ? Math.max((rightRow.score / rightRow.weight) * 100, 16) : 0}%"></span>
                    <strong>${rightRow.score}/${rightRow.weight}</strong>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </section>`;
  }

  function _stackCompareDiff(left, right) {
    const order = ['scan', 'bumper', 'wheel', 'glass', 'panel'];
    const leftMap = Object.fromEntries(((left?.modules) || []).map(item => [item.module, item]));
    const rightMap = Object.fromEntries(((right?.modules) || []).map(item => [item.module, item]));
    const rows = order.map(module => {
      const l = leftMap[module] || null;
      const r = rightMap[module] || null;
      const leftLabel = l?.variantTitle || 'Missing';
      const rightLabel = r?.variantTitle || 'Missing';
      const same = leftLabel === rightLabel;
      return { module, leftLabel, rightLabel, same };
    });
    return {
      rows,
      changed: rows.filter(row => !row.same).map(row => row.module),
    };
  }

  function _stackCompareDiffHTML(diff) {
    return `
      <section class="stack-diff-board">
        <div class="stack-diff-top">
          <span class="compare-kicker">Stack Diff</span>
          <strong>${diff.changed.length ? `${diff.changed.length} case-area changes` : 'No case-area changes'}</strong>
        </div>
        <div class="stack-diff-list">
          ${diff.rows.map(row => {
            const meta = MODULE_META[row.module] || MODULE_META.scan;
            return `
              <div class="stack-diff-row ${row.same ? 'same' : 'changed'}">
                <div class="stack-diff-module">${meta.icon} ${meta.label}</div>
                <div class="stack-diff-values">
                  <span>${_esc(row.leftLabel)}</span>
                  <span>${_esc(row.rightLabel)}</span>
                </div>
              </div>`;
          }).join('')}
        </div>
      </section>`;
  }

  function _stackActionPlan(left, right, diff, scoring) {
    if (!left || !right) {
      return {
        title: 'Action plan unlocks with two stacks',
        items: ['Pin two named stacks to get keep, swap, and fill guidance for each case area.'],
      };
    }
    const leader = scoring.left.total >= scoring.right.total ? left : right;
    const trailer = leader.id === left.id ? right : left;
    const items = [];
    diff.rows.forEach(row => {
      const meta = MODULE_META[row.module] || MODULE_META.scan;
      if (row.same) {
        items.push(`Keep ${meta.label}: both stacks already agree on ${row.leftLabel}.`);
        return;
      }
      if (row.leftLabel === 'Missing' || row.rightLabel === 'Missing') {
        const source = row.leftLabel === 'Missing' ? 'Stack B' : 'Stack A';
        const value = row.leftLabel === 'Missing' ? row.rightLabel : row.leftLabel;
        items.push(`Fill ${meta.label}: bring ${value} over from ${source} so the weaker stack stops leaking points here.`);
        return;
      }
      const chosen = leader.id === left.id ? row.leftLabel : row.rightLabel;
      const dropped = leader.id === left.id ? row.rightLabel : row.leftLabel;
      items.push(`Swap ${meta.label}: keep ${chosen} from ${leader.name} and drop ${dropped} from ${trailer.name}.`);
    });
    return {
      title: `${leader.name} is the anchor stack`,
      items,
    };
  }

  function _stackActionPlanHTML(plan, left, right, scoring) {
    const canMerge = Boolean(left && right);
    const suggestedName = canMerge ? _nextHybridStackName(left, right, scoring) : '';
    return `
      <section class="stack-action-board">
        <div class="stack-diff-top">
          <span class="compare-kicker">AutoIQ Actions</span>
          <strong>${_esc(plan.title)}</strong>
        </div>
        <div class="stack-action-list">
          ${plan.items.map(item => `<div class="compare-point">${_esc(item)}</div>`).join('')}
        </div>
        ${canMerge ? `<div class="stack-action-merge">
          <div class="full-stack-actions-copy">
            <strong>Build the recommended hybrid automatically.</strong>
            <span>AutoIQ Pro will create a new named stack using the strongest case mix from both pinned cases.</span>
          </div>
          <button class="compare-pin-btn" onclick="glowApp.createHybridStackFromCompare('${_esc(suggestedName)}')">Create ${_esc(suggestedName)}</button>
        </div>` : ''}
      </section>`;
  }

  function _nextHybridStackName(left, right, scoring) {
    const leader = scoring.left.total >= scoring.right.total ? left : right;
    const trailer = leader?.id === left?.id ? right : left;
    const base = `${leader?.name || 'Lead'} x ${trailer?.name || 'Blend'}`.slice(0, 34);
    const existing = new Set(loadStackVariants().map(stack => stack.name));
    if (!existing.has(base)) return base;
    let index = 2;
    while (existing.has(`${base} ${index}`)) index += 1;
    return `${base} ${index}`;
  }

  function createHybridStackFromCompare(nameHint) {
    const stacks = _sortedStackVariants();
    const left = stacks.find(stack => stack.id === _stackCompare.left) || null;
    const right = stacks.find(stack => stack.id === _stackCompare.right) || null;
    if (!left || !right) {
      showStudioNotice('Pin two stacks before creating a hybrid.');
      return;
    }
    const diff = _stackCompareDiff(left, right);
    const scoring = _stackScorePair(left, right);
    const leader = scoring.left.total >= scoring.right.total ? left : right;
    const trailer = leader.id === left.id ? right : left;
    const leaderMap = Object.fromEntries((leader.modules || []).map(item => [item.module, item]));
    const trailerMap = Object.fromEntries((trailer.modules || []).map(item => [item.module, item]));
    const hybridSources = {};
    const hybridCandidates = {};
    const mergedModules = Object.keys(STACK_SCORE_WEIGHTS).map(module => {
      hybridCandidates[module] = {
        left: left.modules?.find(item => item.module === module) || null,
        right: right.modules?.find(item => item.module === module) || null,
        leftName: left.name,
        rightName: right.name,
      };
      if (leaderMap[module]) {
        hybridSources[module] = leader.name;
        return leaderMap[module];
      }
      if (trailerMap[module]) {
        hybridSources[module] = trailer.name;
        return trailerMap[module];
      }
      return null;
    }).filter(Boolean);
    const stacksAll = loadStackVariants();
    const name = nameHint || _nextHybridStackName(left, right, scoring);
    const tone = _compareTone(mergedModules.map(item => loadSessions().find(session => session.id === item.sessionId)).filter(Boolean));
    stacksAll.unshift({
      id: uid(),
      name,
      tone,
      favorite: false,
      isDefault: false,
      modules: mergedModules,
      hybridFrom: { leftId: left.id, rightId: right.id, leftName: left.name, rightName: right.name, leaderName: leader.name },
      hybridSources,
      hybridCandidates,
      updatedAt: new Date().toISOString(),
    });
    saveStackVariants(stacksAll);
    _stackCompare.left = stacksAll[0].id;
    _stackCompare.right = trailer.id;
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
    showStudioNotice(`${name} was created from the recommended hybrid mix. ${diff.changed.length ? 'Review the merged case areas in Case Library.' : ''}`);
  }

  function toggleHybridModuleSource(stackId, module) {
    const stacks = loadStackVariants();
    const stack = stacks.find(item => item.id === stackId);
    if (!stack?.hybridCandidates?.[module]) {
      showStudioNotice('This hybrid module cannot be swapped yet.');
      return;
    }
    const candidates = stack.hybridCandidates[module];
    const current = stack.hybridSources?.[module];
    const currentIsLeft = current === candidates.leftName;
    const nextCandidate = currentIsLeft ? candidates.right : candidates.left;
    const nextLabel = currentIsLeft ? candidates.rightName : candidates.leftName;
    if (!nextCandidate || !nextLabel) {
      showStudioNotice('There is no alternate source for this module.');
      return;
    }
    stack.modules = (stack.modules || []).filter(item => item.module !== module);
    stack.modules.push(nextCandidate);
    stack.hybridSources[module] = nextLabel;
    stack.tone = _compareTone(stack.modules.map(item => loadSessions().find(session => session.id === item.sessionId)).filter(Boolean));
    stack.updatedAt = new Date().toISOString();
    saveStackVariants(stacks);
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
    showStudioNotice(`${MODULE_META[module]?.label || 'Case area'} now uses ${nextLabel} in ${stack.name}.`);
  }

  function _stackVariantPreviewHTML(stack) {
    const sessions = loadSessions();
    const modules = (stack.modules || []).slice(0, 4);
    if (!modules.length) {
      return '<div class="stack-variant-preview empty"><span>No visual case areas saved yet.</span></div>';
    }
    return `
      <div class="stack-variant-preview">
        ${modules.map(item => {
          const meta = MODULE_META[item.module] || MODULE_META.scan;
          const session = sessions.find(entry => entry.id === item.sessionId);
          const image = session?.snapshot?.dataUrl;
          return `
            <div class="stack-variant-preview-cell ${meta.accent}">
              ${image
                ? `<img class="stack-variant-preview-image" src="${image}" alt="${_esc(item.variantTitle || meta.label)}" />`
                : `<div class="stack-variant-preview-fallback">${meta.icon}</div>`}
              <span class="stack-variant-preview-label">${meta.icon}</span>
            </div>`;
        }).join('')}
      </div>`;
  }

  function _sortedStackVariants() {
    return loadStackVariants().sort((a, b) => {
      if (Boolean(b.isDefault) !== Boolean(a.isDefault)) return Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault));
      if (Boolean(b.favorite) !== Boolean(a.favorite)) return Number(Boolean(b.favorite)) - Number(Boolean(a.favorite));
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }

  function _nextStackName(stacks, tone, coveredCount) {
    const base = coveredCount === 5
      ? (tone === 'bold' ? 'Severe Repair' : tone === 'soft' ? 'Light Damage' : 'Signature Case')
      : (tone === 'bold' ? 'Quote Ready' : tone === 'soft' ? 'Monitor Only' : 'Case Draft');
    const existing = new Set(stacks.map(stack => stack.name));
    if (!existing.has(base)) return base;
    let index = 2;
    while (existing.has(`${base} ${index}`)) index += 1;
    return `${base} ${index}`;
  }

  function _ensureCompareSlots(sessions) {
    const ids = new Set(sessions.map(session => session.id));
    if (_compareSlots.left && !ids.has(_compareSlots.left)) _compareSlots.left = null;
    if (_compareSlots.right && !ids.has(_compareSlots.right)) _compareSlots.right = null;
    if (!_compareSlots.left && sessions[0]) _compareSlots.left = sessions[0].id;
    if ((!_compareSlots.right || _compareSlots.right === _compareSlots.left) && sessions[1]) {
      _compareSlots.right = sessions[1].id;
    }
    if (!_compareSlots.right && sessions[0] && sessions.length === 1) _compareSlots.right = sessions[0].id;
  }

  function _buildCompareRecommendation(left, right) {
    if (!left && !right) {
      return {
        title: 'Start with two saved cases',
        body: 'Pin any two Studio snapshots and AutoIQ Pro will start reading them as a coordinated system instead of isolated experiments.',
        points: ['Save two repair cases first', 'Use Pin A and Pin B to create a compare stack'],
      };
    }
    if (left && right && left.id === right.id) {
      return {
        title: 'Duplicate compare detected',
        body: 'Slot A and slot B are showing the same saved case. Swap one side to a different repair area or variant so the compare board can give you a real decision.',
        points: ['Pin a second case to B', 'Keep one anchor case and change only one repair area at a time'],
      };
    }
    const selected = [left, right].filter(Boolean);
    const tone = _compareTone(selected);
    const title = selected.length === 2
      ? `Best together: ${_labelForSession(selected[0])} + ${_labelForSession(selected[1])}`
      : `Lead with ${_labelForSession(selected[0])}`;
    const body = selected.length === 2
      ? `${_labelForSession(selected[0])} and ${_labelForSession(selected[1])} read as a ${tone} direction. Keep those two as the anchors, then fill the remaining case areas around that energy.`
      : `${_labelForSession(selected[0])} is currently your strongest saved direction. Add a second pinned case to test whether you want to stay ${tone} or balance it with contrast.`;
    const points = selected.length === 2
      ? [
          `${_labelForSession(selected[0])} sets the first anchor.`,
          `${_labelForSession(selected[1])} adds the second anchor for a ${tone} finish.`,
          _compareNextStep(selected),
        ]
      : [
          `${_labelForSession(selected[0])} is ready for side-by-side review.`,
          'Add one more saved case area to unlock a stronger recommendation.',
        ];
    return { title, body, points };
  }

  function _compareTone(sessions) {
    const text = sessions.map(session => `${session.title} ${session.snapshot?.variantTitle || ''} ${session.snapshot?.variant || ''}`.toLowerCase()).join(' ');
    if (/(crack|bent|severe|crease|break|center|corner|sidewall)/.test(text)) return 'bold';
    if (/(light|chip|trim|paint|monitor|lower|curb)/.test(text)) return 'soft';
    return 'balanced';
  }

  function _compareNextStep(sessions) {
    const modules = new Set(sessions.map(session => session.module));
    if (!modules.has('panel')) return 'Add a panel case next so dents and finish damage connect to the full repair recommendation.';
    if (!modules.has('bumper')) return 'Add a bumper case next so impact mapping matches the rest of the repair picture.';
    if (!modules.has('wheel')) return 'Add a wheel case next to carry the same damage narrative through the lower-body details.';
    return 'This stack is already coordinated. Save a new variant only if you want a stronger contrast option.';
  }

  function _labelForSession(session) {
    return session?.snapshot?.variantTitle || session?.title || 'Saved case';
  }

  function _sessionIsCoordinated(session) {
    return session.id === _compareSlots.left || session.id === _compareSlots.right;
  }

  function _snapshotStageHTML(session) {
    const snapshot = session.snapshot || {};
    if (!snapshot.dataUrl) {
      return `<div class="compare-stage empty"><span class="compare-stage-empty">Add a repair capture to render this case area here.</span></div>`;
    }
    return `<div class="compare-stage">${_snapshotOverlayHTML(session.module, snapshot)}<img class="compare-stage-image" src="${snapshot.dataUrl}" alt="${_esc(snapshot.name || session.title || 'Saved case')}" /></div>`;
  }

  function _snapshotOverlayHTML(module, snapshot) {
    if (module === 'bumper') {
      const alignment = { ...DEFAULT_BUMPER_ALIGNMENT, ...(snapshot.alignment || {}) };
      return `<div class="bumper-overlay ${_esc(snapshot.variant || 'none')}" style="--bumper-top:${alignment.y}%;--bumper-inset:${alignment.x}%;--bumper-width:${alignment.width}%;--bumper-height:${alignment.height}%;--bumper-rotate:${alignment.rotate}deg;"><span class="bumper-zone left"></span><span class="bumper-zone right"></span></div>`;
    }
    if (module === 'wheel') {
      const alignment = { ...DEFAULT_WHEEL_ALIGNMENT, ...(snapshot.alignment || {}) };
      return `<div class="wheel-overlay ${_esc(snapshot.variant || 'none')}" style="--wheel-top:${alignment.y}%;--wheel-inset:${alignment.x}%;--wheel-width:${alignment.width}%;--wheel-height:${alignment.height}%;--wheel-radius:${alignment.radius}px;"></div>`;
    }
    if (module === 'glass') {
      const alignment = { ...DEFAULT_GLASS_ALIGNMENT, ...(snapshot.alignment || {}) };
      return `<div class="glass-overlay ${_esc(snapshot.variant || 'none')}" style="--glass-top:${alignment.y}%;--glass-inset:${alignment.x}%;--glass-width:${alignment.width}%;--glass-height:${alignment.height}%;--glass-radius:${alignment.radius}px;"></div>`;
    }
    if (module === 'panel') {
      const alignment = { ...DEFAULT_PANEL_ALIGNMENT, ...(snapshot.alignment || {}) };
      return `<div class="panel-overlay ${_esc(snapshot.variant || 'none')}" style="--panel-top:${alignment.y}%;--panel-inset:${alignment.x}%;--panel-width:${alignment.width}%;--panel-height:${alignment.height}%;--panel-radius:${alignment.radius}px;"></div>`;
    }
    return '';
  }

  function _plannerSummaryHTML() {
    const sessions = loadSessions();
    const bookings = loadAppointments().filter(a => a.status !== 'cancelled' && a.status !== 'completed');
    return `
      <div class="planner-summary-card">
        <span class="planner-summary-kicker">Cases Saved</span>
        <strong>${sessions.length}</strong>
        <span class="planner-summary-copy">Bumper, wheel, glass, panel, and live-scan drafts in one stack.</span>
      </div>
      <div class="planner-summary-card">
        <span class="planner-summary-kicker">Upcoming Services</span>
        <strong>${bookings.length}</strong>
        <span class="planner-summary-copy">Appointments tied to the same repair plan.</span>
      </div>`;
  }

  function _renderProfile() {
    const shell = document.getElementById('profileShell');
    if (!shell) return;
    const sessions = loadSessions();
    const bookings = loadAppointments().filter(a => a.status !== 'cancelled');
    const nextService = bookings.sort(_sortByDateTime)[0];
    shell.innerHTML = `
      <section class="profile-hero">
        <div class="profile-avatar">🚗</div>
        <div class="profile-eyebrow">AutoIQ Pro Driver</div>
        <h2 class="profile-title">Your repair system is taking shape.</h2>
        <p class="profile-copy">AutoIQ Pro is now tracking scan plans, saved cases, and service timing in one place so each new repair area has context from day one.</p>
      </section>
      <div class="profile-stat-grid">
        <div class="profile-stat-card">
          <span class="profile-stat-kicker">Saved Cases</span>
          <strong>${sessions.length}</strong>
        </div>
        <div class="profile-stat-card">
          <span class="profile-stat-kicker">Planned Services</span>
          <strong>${bookings.length}</strong>
        </div>
      </div>
      <div class="profile-panel">
        <div class="profile-panel-title">Current Focus</div>
        <div class="profile-focus-list">
          <div class="profile-focus-item"><span>🔬</span><div><strong>Live scan active</strong><p>Use camera triage now and save repair plans into Cases.</p></div></div>
          <div class="profile-focus-item"><span>🛻</span><div><strong>Bumper mapping ready</strong><p>Use alignment controls to map impact areas on your own photo.</p></div></div>
          <div class="profile-focus-item"><span>🛞</span><div><strong>Wheel evidence saved</strong><p>Reference captures and compare-ready cases all live in the same system.</p></div></div>
        </div>
      </div>
      <div class="profile-panel">
        <div class="profile-panel-title">Next Service</div>
        ${nextService
          ? `<div class="profile-next-service"><strong>${_esc(nextService.title)}</strong><span>${fmtDate(nextService.date)} at ${fmtTime(nextService.time)}</span></div>`
          : `<div class="profile-next-service empty"><strong>No service booked yet</strong><span>Use Cases to add your first body shop, glass repair, or tire visit.</span></div>`}
      </div>`;
  }

  function setPlannerTab(tab) {
    _plannerTab = tab === 'calendar' ? 'calendar' : tab === 'compare' ? 'compare' : 'looks';
    if (_currentScreen() === 'appointments') _renderPlanner();
  }

  function pinCompareSlot(slot, sessionId) {
    if (slot !== 'left' && slot !== 'right') return;
    _compareSlots[slot] = sessionId;
    _compareSlots.focus = slot;
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
  }

  function pinStackCompare(slot, stackId) {
    if (slot !== 'left' && slot !== 'right') return;
    _stackCompare[slot] = stackId;
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
  }

  function openStackCompareFromHome(stackId) {
    const stacks = _sortedStackVariants();
    if (stackId) _stackCompare.left = stackId;
    if (!_stackCompare.right || _stackCompare.right === _stackCompare.left) {
      const next = stacks.find(stack => stack.id !== _stackCompare.left);
      if (next) _stackCompare.right = next.id;
    }
    _plannerTab = 'compare';
    if (_currentScreen() !== 'appointments') navigate('appointments');
    else _renderPlanner();
  }

  function swapStackCompare() {
    const left = _stackCompare.left;
    _stackCompare.left = _stackCompare.right;
    _stackCompare.right = left;
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
  }

  function saveCurrentStackVariant() {
    const bundle = _buildFullStackBundle(loadSessions().filter(session => session.snapshot?.dataUrl).sort(_sortSessionsByRecent));
    if (!bundle.coveredCount) {
      showStudioNotice('Save at least one case snapshot before creating a named stack variant.');
      return;
    }
    const stacks = loadStackVariants();
    const name = _nextStackName(stacks, _compareTone(bundle.cards.filter(card => card.session).map(card => card.session)), bundle.coveredCount);
    stacks.unshift({
      id: uid(),
      name,
      tone: _compareTone(bundle.cards.filter(card => card.session).map(card => card.session)),
      favorite: false,
      isDefault: stacks.length === 0,
      modules: bundle.cards.filter(card => card.session).map(card => ({
        module: card.module,
        sessionId: card.session.id,
        title: card.session.title,
        variantTitle: card.session.snapshot?.variantTitle || card.session.title,
      })),
      updatedAt: new Date().toISOString(),
    });
    saveStackVariants(stacks);
    showStudioNotice(`${name} was saved to your Case Library.`);
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
  }

  function applyStackVariant(stackId) {
    const stack = loadStackVariants().find(item => item.id === stackId);
    if (!stack) {
      showStudioNotice('That stack variant could not be found.');
      return;
    }
    const sessions = loadSessions();
    const picks = (stack.modules || [])
      .map(item => sessions.find(session => session.id === item.sessionId))
      .filter(Boolean);
    if (!picks.length) {
      showStudioNotice('This stack no longer has matching saved sessions. Save a fresh stack variant.');
      return;
    }
    _compareSlots.left = picks[0]?.id || null;
    _compareSlots.right = picks[1]?.id || picks[0]?.id || null;
    _compareSlots.focus = 'left';
    _plannerTab = 'compare';
    if (_currentScreen() !== 'appointments') navigate('appointments');
    else _renderPlanner();
    showStudioNotice(`${stack.name} is now loaded into Compare. Pin or open any case area to refine it.`);
  }

  function openStackRenameEditor(stackId) {
    const stacks = loadStackVariants();
    const stack = stacks.find(item => item.id === stackId);
    if (!stack) {
      showStudioNotice('That stack variant could not be found.');
      return;
    }
    _stackEditorState = { mode: 'rename', stackId };
    const kicker = document.getElementById('stackEditorKicker');
    const title = document.getElementById('stackEditorTitle');
    const copy = document.getElementById('stackEditorCopy');
    const body = document.getElementById('stackEditorBody');
    const saveBtn = document.getElementById('stackEditorSaveBtn');
    if (kicker) kicker.textContent = 'Case Library';
    if (title) title.textContent = 'Rename Stack';
    if (copy) copy.textContent = 'Give this saved case stack a clearer name so it is easier to scan beside your other bundles.';
    if (saveBtn) saveBtn.textContent = 'Save Name';
    if (body) {
      body.innerHTML = `
        <label class="form-label" for="stackRenameInput">Stack Name</label>
        <input class="form-input" id="stackRenameInput" type="text" maxlength="40" value="${_esc(stack.name)}" placeholder="Light Damage" />
      `;
    }
    document.getElementById('stackEditorBackdrop')?.classList.remove('hidden');
    setTimeout(() => document.getElementById('stackRenameInput')?.focus(), 30);
  }

  function toggleFavoriteStackVariant(stackId) {
    const stacks = loadStackVariants();
    const stack = stacks.find(item => item.id === stackId);
    if (!stack) {
      showStudioNotice('That stack variant could not be found.');
      return;
    }
    stack.favorite = !stack.favorite;
    stack.updatedAt = new Date().toISOString();
    saveStackVariants(stacks);
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
  }

  function setDefaultStackVariant(stackId) {
    const stacks = loadStackVariants();
    let found = false;
    stacks.forEach(stack => {
      const isTarget = stack.id === stackId;
      if (isTarget) found = true;
      stack.isDefault = isTarget;
      if (isTarget) stack.updatedAt = new Date().toISOString();
    });
    if (!found) {
      showStudioNotice('That stack variant could not be found.');
      return;
    }
    saveStackVariants(stacks);
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
  }

  function openStackModuleSwapEditor(stackId) {
    const stacks = loadStackVariants();
    const stack = stacks.find(item => item.id === stackId);
    if (!stack) {
      showStudioNotice('That stack variant could not be found.');
      return;
    }
    _stackEditorState = { mode: 'swap', stackId };
    _renderStackSwapEditor(stack);
    document.getElementById('stackEditorBackdrop')?.classList.remove('hidden');
  }

  function _renderStackSwapEditor(stack) {
    const currentModules = stack.modules || [];
    const moduleOptions = currentModules.length ? currentModules : Object.keys(MODULE_META).map(module => ({ module }));
    const kicker = document.getElementById('stackEditorKicker');
    const title = document.getElementById('stackEditorTitle');
    const copy = document.getElementById('stackEditorCopy');
    const body = document.getElementById('stackEditorBody');
    const saveBtn = document.getElementById('stackEditorSaveBtn');
    if (kicker) kicker.textContent = 'Stack Editor';
    if (title) title.textContent = 'Swap One Case Area';
    if (copy) copy.textContent = 'Pick the part of the case you want to replace, then choose another saved session from that category.';
    if (saveBtn) saveBtn.textContent = 'Apply Swap';
    if (body) {
      body.innerHTML = `
        <div class="stack-editor-section">
          <div class="stack-editor-label">Case Area</div>
          <div class="stack-editor-chip-row">
            ${moduleOptions.map(item => {
              const meta = MODULE_META[item.module] || MODULE_META.scan;
              const active = _stackEditorState?.selectedModule === item.module ? 'active' : '';
              return `<button type="button" class="stack-editor-chip ${active}" onclick="glowApp.selectStackEditorModule('${item.module}')">${meta.icon} ${meta.label}</button>`;
            }).join('')}
          </div>
        </div>
        <div class="stack-editor-section">
          <div class="stack-editor-label">Saved Options</div>
          <div class="stack-editor-option-list">
            ${_stackEditorOptionListHTML()}
          </div>
        </div>
      `;
    }
  }

  function _stackEditorOptionListHTML() {
    const module = _stackEditorState?.selectedModule;
    if (!module) {
      return '<div class="stack-editor-empty">Choose a case area first to see saved options.</div>';
    }
    const candidates = loadSessions().filter(session => session.module === module).sort(_sortSessionsByRecent);
    if (!candidates.length) {
      return `<div class="stack-editor-empty">No saved ${MODULE_META[module].label.toLowerCase()} sessions yet.</div>`;
    }
    return candidates.map(session => {
      const chosen = _stackEditorState?.selectedSessionId === session.id ? 'active' : '';
      return `<button type="button" class="stack-editor-option ${chosen}" onclick="glowApp.selectStackEditorSession('${session.id}')"><strong>${_esc(session.snapshot?.variantTitle || session.title)}</strong><span>${_esc(session.note || 'Saved case option')}</span></button>`;
    }).join('');
  }

  function selectStackEditorModule(module) {
    if (!_stackEditorState || _stackEditorState.mode !== 'swap') return;
    _stackEditorState.selectedModule = module;
    _stackEditorState.selectedSessionId = null;
    const stack = loadStackVariants().find(item => item.id === _stackEditorState.stackId);
    if (!stack) return;
    _renderStackSwapEditor(stack);
  }

  function selectStackEditorSession(sessionId) {
    if (!_stackEditorState || _stackEditorState.mode !== 'swap') return;
    _stackEditorState.selectedSessionId = sessionId;
    const list = document.querySelector('.stack-editor-option-list');
    if (list) list.innerHTML = _stackEditorOptionListHTML();
  }

  function confirmStackEditor() {
    if (!_stackEditorState) return;
    if (_stackEditorState.mode === 'rename') {
      const stacks = loadStackVariants();
      const stack = stacks.find(item => item.id === _stackEditorState.stackId);
      const input = document.getElementById('stackRenameInput');
      const cleaned = String(input?.value || '').trim().slice(0, 40);
      if (!stack) {
        showStudioNotice('That stack variant could not be found.');
        closeStackEditor();
        return;
      }
      if (!cleaned) {
        showStudioNotice('Stack names cannot be empty.');
        return;
      }
      stack.name = cleaned;
      stack.updatedAt = new Date().toISOString();
      saveStackVariants(stacks);
      closeStackEditor();
      if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
      return;
    }
    if (_stackEditorState.mode === 'swap') {
      const module = _stackEditorState.selectedModule;
      const sessionId = _stackEditorState.selectedSessionId;
      if (!module || !sessionId) {
        showStudioNotice('Choose a case area and a saved option before applying the swap.');
        return;
      }
      const stacks = loadStackVariants();
      const stack = stacks.find(item => item.id === _stackEditorState.stackId);
      const chosen = loadSessions().find(session => session.id === sessionId);
      if (!stack || !chosen) {
        showStudioNotice('That saved option could not be found.');
        closeStackEditor();
        return;
      }
      const nextModules = (stack.modules || []).filter(item => item.module !== module);
      nextModules.push({
        module,
        sessionId: chosen.id,
        title: chosen.title,
        variantTitle: chosen.snapshot?.variantTitle || chosen.title,
      });
      stack.modules = nextModules;
      stack.tone = _compareTone(nextModules
        .map(item => loadSessions().find(session => session.id === item.sessionId))
        .filter(Boolean));
      stack.updatedAt = new Date().toISOString();
      saveStackVariants(stacks);
      closeStackEditor();
      if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
      showStudioNotice(`${MODULE_META[module].label} was swapped inside ${stack.name}.`);
    }
  }

  function closeStackEditor() {
    _stackEditorState = null;
    document.getElementById('stackEditorBackdrop')?.classList.add('hidden');
  }

  function closeStackEditorIfBackdrop(e) {
    if (e.target === document.getElementById('stackEditorBackdrop')) closeStackEditor();
  }

  function focusCompareSlot(slot) {
    if (slot !== 'left' && slot !== 'right') return;
    _compareSlots.focus = slot;
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
  }

  function swapCompareSlots() {
    const left = _compareSlots.left;
    _compareSlots.left = _compareSlots.right;
    _compareSlots.right = left;
    _compareSlots.focus = _compareSlots.focus === 'left' ? 'right' : 'left';
    if (_currentScreen() === 'appointments' && _plannerTab === 'compare') _renderPlanner();
  }

  function _syncPlannerTabs() {
    const looks = document.getElementById('plannerTabLooks');
    const compare = document.getElementById('plannerTabCompare');
    const calendar = document.getElementById('plannerTabCalendar');
    if (!looks || !compare || !calendar) return;
    looks.classList.toggle('active', _plannerTab === 'looks');
    compare.classList.toggle('active', _plannerTab === 'compare');
    calendar.classList.toggle('active', _plannerTab === 'calendar');
    looks.setAttribute('aria-selected', String(_plannerTab === 'looks'));
    compare.setAttribute('aria-selected', String(_plannerTab === 'compare'));
    calendar.setAttribute('aria-selected', String(_plannerTab === 'calendar'));
  }

  function _buildSession(module, overrides = {}) {
    const meta = MODULE_META[module] || MODULE_META.scan;
    return {
      id: uid(),
      module,
      title: overrides.title || `${meta.label} Draft`,
      status: overrides.status || 'draft',
      note: overrides.note || `Saved as a ${meta.label.toLowerCase()} case inside your AutoIQ Pro planning system.`,
      snapshot: overrides.snapshot || null,
      updatedAt: new Date().toISOString(),
    };
  }

  function _currentCaptureSnapshot(module) {
    const capture = loadCaptures()[module];
    if (!capture) return null;
    return {
      name: capture.name || '',
      dataUrl: capture.dataUrl || '',
      variant: capture.variant || '',
      variantTitle: capture.variantTitle || '',
      variantNote: capture.variantNote || '',
      alignment: capture.alignment || null,
      imageTransform: capture.imageTransform || null,
      updatedAt: capture.updatedAt || new Date().toISOString(),
    };
  }

  function createStudioSession(module) {
    const sessions = loadSessions();
    const session = _buildSession(module);
    sessions.unshift(session);
    saveSessions(sessions);
    _plannerTab = 'looks';
    if (_currentScreen() === 'home') _renderHomePreview();
    if (_currentScreen() === 'appointments') _renderPlanner();
  }

  function saveStudioPreset(module, title, note) {
    const sessions = loadSessions();
    sessions.unshift(_buildSession(module, {
      title,
      status: 'ready',
      note,
      snapshot: _currentCaptureSnapshot(module),
    }));
    saveSessions(sessions);
    showStudioNotice(`${title} was saved to Cases. You can reopen it anytime to refine the case and compare it with the rest of your stack.`);
    if (_currentScreen() === 'home') _renderHomePreview();
    if (_currentScreen() === 'appointments') _renderPlanner();
    if (_currentScreen() === 'profile') _renderProfile();
  }

  function applyStudioTryOn(module, variant, title, note) {
    const captures = loadCaptures();
    captures[module] = {
      ...(captures[module] || {}),
      variant,
      variantTitle: title,
      variantNote: note,
      updatedAt: new Date().toISOString(),
    };
    if (module === 'bumper' && !captures[module].alignment) {
      captures[module].alignment = { ...DEFAULT_BUMPER_ALIGNMENT };
    }
    if (module === 'wheel' && !captures[module].alignment) {
      captures[module].alignment = { ...DEFAULT_WHEEL_ALIGNMENT };
    }
    if (module === 'glass' && !captures[module].alignment) {
      captures[module].alignment = { ...DEFAULT_GLASS_ALIGNMENT };
    }
    if (module === 'panel' && !captures[module].alignment) {
      captures[module].alignment = { ...DEFAULT_PANEL_ALIGNMENT };
    }
    saveCaptures(captures);
    _syncStudioSelectionUI(module);
    _syncStudioCaptureUI(module);
    const hasImage = Boolean(captures[module]?.dataUrl);
    if (!hasImage) {
      const target = module === 'wheel'
        ? 'wheel'
        : module === 'glass'
          ? 'glass or light'
        : module === 'panel'
            ? 'panel'
            : 'bumper';
      showStudioNotice(`${title} is selected. Add a ${target} photo to see the live repair overlay.`);
    }
  }

  function openStudioWorkspace(module) {
    _seedWorkspaceFromLastPhoto(module);
    _studioWorkspace = module;
    navigate('analysis');
    setTimeout(() => {
      _syncStudioWorkspace();
      const target = document.getElementById(
        module === 'wheel' ? 'wheelWorkspace' :
        module === 'glass' ? 'glassWorkspace' :
        module === 'panel' ? 'panelWorkspace' :
        'bumperWorkspace'
      );
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  }

  function openPlannerSession(sessionId) {
    const session = loadSessions().find(item => item.id === sessionId);
    if (!session) {
      showStudioNotice('That saved session could not be found. Create a fresh case in Camera Triage and save it again.');
      return;
    }
    if (session.module === 'bumper' || session.module === 'wheel' || session.module === 'glass' || session.module === 'panel') {
      if (session.snapshot) {
        const captures = loadCaptures();
        captures[session.module] = {
          ...(captures[session.module] || {}),
          ...session.snapshot,
        };
        saveCaptures(captures);
      }
      openStudioWorkspace(session.module);
      return;
    }
    showStudioNotice('This saved case is already stored in Cases. Open the matching workspace to keep refining it.');
  }

  function _syncStudioWorkspace() {
    const bumper = document.getElementById('bumperWorkspace');
    const wheel = document.getElementById('wheelWorkspace');
    const glass = document.getElementById('glassWorkspace');
    const panel = document.getElementById('panelWorkspace');
    if (!bumper || !wheel || !glass || !panel) return;
    bumper.classList.toggle('workspace-active', _studioWorkspace === 'bumper');
    wheel.classList.toggle('workspace-active', _studioWorkspace === 'wheel');
    glass.classList.toggle('workspace-active', _studioWorkspace === 'glass');
    panel.classList.toggle('workspace-active', _studioWorkspace === 'panel');
    _syncStudioSelectionUI('bumper');
    _syncStudioSelectionUI('wheel');
    _syncStudioSelectionUI('glass');
    _syncStudioSelectionUI('panel');
  }

  async function triggerStudioUpload(module) {
    const usesFrontCamera = false;
    const isNative = window.Capacitor?.isNativePlatform?.() ?? false;

    if (isNative && window.scanModule?.captureStudioPhoto) {
      try {
        const capture = await window.scanModule.captureStudioPhoto({
          facing: usesFrontCamera ? 'front' : 'rear',
        });
        if (!capture?.dataUrl) return;
        _applyStudioCapture(module, capture.name, capture.dataUrl);
        return;
      } catch (err) {
        const msg = String(err || '');
        if (msg.includes('cancel') || msg.includes('No image') || msg.includes('User cancelled')) return;
        console.warn('studio capture fallback to file input', err);
      }
    }

    const input = document.getElementById(
      module === 'wheel' ? 'wheelUploadInput' :
      module === 'glass' ? 'glassUploadInput' :
      module === 'panel' ? 'panelUploadInput' :
      'bumperUploadInput'
    );
    if (!input) return;
    input.value = '';
    input.click();
  }

  function handleStudioUpload(module, event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      _applyStudioCapture(module, file.name, String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  }

  function _applyStudioCapture(module, name, dataUrl) {
    const img = new Image();
    img.onload = () => {
      const captures = loadCaptures();
      const next = {
        ...(captures[module] || {}),
        name,
        dataUrl,
        imageWidth: img.naturalWidth || img.width || 0,
        imageHeight: img.naturalHeight || img.height || 0,
        updatedAt: new Date().toISOString(),
      };
      next.alignment = _estimateAlignment(module, next);
      next.fitMode = 'smart';
      captures[module] = next;
      saveCaptures(captures);
      _syncStudioCaptureAfterSave(module);
      showStudioNotice(`${MODULE_META[module]?.label || 'Studio capture'} added with a Smart Fit baseline. Fine-tune it if needed, then save it to Cases.`);
    };
    img.onerror = () => {
      const captures = loadCaptures();
      const next = {
        ...(captures[module] || {}),
        name,
        dataUrl,
        updatedAt: new Date().toISOString(),
      };
      next.alignment = _estimateAlignment(module, next);
      next.fitMode = 'smart';
      captures[module] = next;
      saveCaptures(captures);
      _syncStudioCaptureAfterSave(module);
      showStudioNotice(`${MODULE_META[module]?.label || 'Studio capture'} added. AutoIQ Pro set a Smart Fit baseline using the default guide.`);
    };
    img.src = dataUrl;
  }

  function _syncStudioCaptureAfterSave(module) {
    _syncStudioCaptureUI(module);
    _syncBumperAlignmentUI();
    _syncWheelAlignmentUI();
    _syncGlassAlignmentUI();
    _syncPanelAlignmentUI();
  }

  function _seedWorkspaceFromLastPhoto(module) {
    if (module !== 'bumper' && module !== 'wheel') return;
    const captures = loadCaptures();
    if (captures[module]?.dataUrl) return;
    const photo = loadLastStudioPhoto();
    if (!photo?.dataUrl) return;

    captures[module] = {
      ...(captures[module] || {}),
      name: photo.name || `${module}-reference-${Date.now()}.jpg`,
      dataUrl: photo.dataUrl,
      updatedAt: new Date().toISOString(),
      variant: captures[module]?.variant || '',
      variantTitle: captures[module]?.variantTitle || '',
      variantNote: captures[module]?.variantNote || '',
      alignment: captures[module]?.alignment || _defaultAlignment(module),
      fitMode: captures[module]?.fitMode || 'smart',
    };
    saveCaptures(captures);
  }

  function saveStudioCapture(module) {
    const capture = loadCaptures()[module];
    if (!capture?.dataUrl) {
      showStudioNotice(`Add a ${module === 'wheel' ? 'wheel' : module === 'glass' ? 'glass or light' : module === 'panel' ? 'panel' : 'bumper'} photo first so AutoIQ Pro has a real reference image to save.`);
      return;
    }
    const selected = capture.variant && TRY_ON_PRESETS[module]?.[capture.variant];
    const title = selected?.title || (module === 'wheel'
      ? 'Wheel Capture Reference'
      : module === 'glass'
        ? 'Glass Capture Reference'
        : module === 'panel'
          ? 'Panel Capture Reference'
        : 'Bumper Capture Reference');
    const note = selected?.note || (module === 'wheel'
      ? 'Wheel reference saved for curb rash, tire wear, and compare-ready overlays.'
      : module === 'glass'
        ? 'Glass reference saved for chip, crack, and compare-ready overlays.'
        : module === 'panel'
          ? 'Panel reference saved for dent, finish, and compare-ready review.'
        : 'Bumper reference saved for impact mapping and compare-ready overlays.');
    const sessions = loadSessions();
    sessions.unshift(_buildSession(module, {
      title,
      status: 'ready',
      note,
      snapshot: _currentCaptureSnapshot(module),
    }));
    saveSessions(sessions);
    showStudioNotice(`${title} was saved to Cases. The image reference is now attached to your ${MODULE_META[module]?.label?.toLowerCase() || 'case'} workflow.`);
    if (_currentScreen() === 'home') _renderHomePreview();
    if (_currentScreen() === 'appointments') _renderPlanner();
    if (_currentScreen() === 'profile') _renderProfile();
  }

  function _syncAllStudioCaptureUI() {
    _syncStudioCaptureUI('bumper');
    _syncStudioCaptureUI('wheel');
    _syncStudioCaptureUI('glass');
    _syncStudioCaptureUI('panel');
    _syncStudioSelectionUI('bumper');
    _syncStudioSelectionUI('wheel');
    _syncStudioSelectionUI('glass');
    _syncStudioSelectionUI('panel');
    _syncBumperAlignmentUI();
    _syncWheelAlignmentUI();
    _syncGlassAlignmentUI();
    _syncPanelAlignmentUI();
  }

  function _syncStudioCaptureUI(module) {
    const preview = document.getElementById(
      module === 'wheel' ? 'wheelPreview' :
      module === 'glass' ? 'glassPreview' :
      module === 'panel' ? 'panelPreview' :
      'bumperPreview'
    );
    if (!preview) return;
    const capture = loadCaptures()[module];
    if (!capture?.dataUrl) {
      preview.classList.add('empty');
      preview.innerHTML = module === 'wheel'
        ? `<span class="workspace-capture-icon">🛞</span><div class="workspace-capture-title">Add a wheel photo</div><p class="workspace-capture-copy">Capture the full wheel and tire in even lighting so saved damage notes are tied to a real reference image.</p>`
        : module === 'glass'
          ? `<span class="workspace-capture-icon">💡</span><div class="workspace-capture-title">Add a glass or light photo</div><p class="workspace-capture-copy">Capture the crack, chip, or damaged lens in even light so AutoIQ Pro can map the affected zone.</p>`
        : module === 'panel'
          ? `<span class="workspace-capture-icon">🎨</span><div class="workspace-capture-title">Add a panel photo</div><p class="workspace-capture-copy">Use a straight-on panel photo so AutoIQ Pro can preview dents, paint transfer, and finish damage cleanly.</p>`
        : `<span class="workspace-capture-icon">🛻</span><div class="workspace-capture-title">Add a bumper photo</div><p class="workspace-capture-copy">Use a straight-on bumper shot with good light for cleaner impact mapping and easier alignment.</p>`;
      return;
    }
    preview.classList.remove('empty');
    const bumperAlignment = { ...DEFAULT_BUMPER_ALIGNMENT, ...(capture.alignment || {}) };
    const wheelAlignment = { ...DEFAULT_WHEEL_ALIGNMENT, ...(capture.alignment || {}) };
    const glassAlignment = { ...DEFAULT_GLASS_ALIGNMENT, ...(capture.alignment || {}) };
    const panelAlignment = { ...DEFAULT_PANEL_ALIGNMENT, ...(capture.alignment || {}) };
    const imageTransform = { ..._defaultImageTransform(), ...(capture.imageTransform || {}) };
    const bumperOverlay = module === 'bumper'
      ? `<div class="bumper-overlay ${_esc(capture.variant || 'none')}" data-drag-target="overlay" data-module="bumper" style="--bumper-top:${bumperAlignment.y}%;--bumper-inset:${bumperAlignment.x}%;--bumper-width:${bumperAlignment.width}%;--bumper-height:${bumperAlignment.height}%;--bumper-rotate:${bumperAlignment.rotate}deg;--bumper-offset-x:${bumperAlignment.offsetX || 0}%;" aria-label="Drag bumper overlay to reposition"><span class="bumper-zone left"></span><span class="bumper-zone right"></span></div>`
      : '';
    const wheelOverlay = module === 'wheel'
      ? `<div class="wheel-overlay ${_esc(capture.variant || 'none')}" data-drag-target="overlay" data-module="wheel" style="--wheel-top:${wheelAlignment.y}%;--wheel-inset:${wheelAlignment.x}%;--wheel-width:${wheelAlignment.width}%;--wheel-height:${wheelAlignment.height}%;--wheel-radius:${wheelAlignment.radius}px;" aria-label="Drag wheel overlay to reposition"></div>`
      : '';
    const glassOverlay = module === 'glass'
      ? `<div class="glass-overlay ${_esc(capture.variant || 'none')}" style="--glass-top:${glassAlignment.y}%;--glass-inset:${glassAlignment.x}%;--glass-width:${glassAlignment.width}%;--glass-height:${glassAlignment.height}%;--glass-radius:${glassAlignment.radius}px;"></div>`
      : '';
    const panelOverlay = module === 'panel'
      ? `<div class="panel-overlay ${_esc(capture.variant || 'none')}" style="--panel-top:${panelAlignment.y}%;--panel-inset:${panelAlignment.x}%;--panel-width:${panelAlignment.width}%;--panel-height:${panelAlignment.height}%;--panel-radius:${panelAlignment.radius}px;"></div>`
      : '';
    preview.innerHTML = `<div class="workspace-preview-stage" data-module="${_esc(module)}">${_previewGuideHTML(module, capture)}${wheelOverlay}${glassOverlay}${panelOverlay}<img class="workspace-preview-image" data-drag-target="image" data-module="${_esc(module)}" src="${capture.dataUrl}" alt="${_esc(capture.name || 'Studio capture')}" style="--image-offset-x:${imageTransform.x}%;--image-offset-y:${imageTransform.y}%;" />${bumperOverlay}</div><div class="workspace-preview-meta"><strong>${_esc(capture.variantTitle || capture.name || 'Reference image')}</strong><span>${_esc(_captureMetaLine(module, capture))}</span></div>`;
    _bindWorkspaceDrag(module, preview);
  }

  function _defaultAlignment(module) {
    if (module === 'wheel') return { ...DEFAULT_WHEEL_ALIGNMENT };
    if (module === 'glass') return { ...DEFAULT_GLASS_ALIGNMENT };
    if (module === 'panel') return { ...DEFAULT_PANEL_ALIGNMENT };
    return { ...DEFAULT_BUMPER_ALIGNMENT };
  }

  function _estimateAlignment(module, capture) {
    const ratio = capture.imageWidth && capture.imageHeight ? capture.imageWidth / capture.imageHeight : 0.75;
    const next = _defaultAlignment(module);
    if (module === 'bumper') {
      if (ratio < 0.72) Object.assign(next, { x: 16, y: 28, width: 31, height: 9, rotate: 6 });
      else if (ratio > 0.95) Object.assign(next, { x: 12, y: 31, width: 38, height: 10, rotate: 4 });
      return next;
    }
    if (module === 'wheel') {
      if (ratio > 1.05) Object.assign(next, { x: 10, y: 14, width: 80, height: 16, radius: 16 });
      else Object.assign(next, { x: 12, y: 18, width: 74, height: 18, radius: 18 });
      return next;
    }
    if (module === 'glass') {
      if (ratio > 1.05) Object.assign(next, { x: 8, y: 34, width: 84, height: 18, radius: 18 });
      else Object.assign(next, { x: 10, y: 30, width: 80, height: 22, radius: 20 });
      return next;
    }
    if (ratio < 0.72) Object.assign(next, { x: 16, y: 26, width: 62, height: 58, radius: 28 });
    else if (ratio > 0.92) Object.assign(next, { x: 12, y: 24, width: 74, height: 60, radius: 24 });
    return next;
  }

  function autoFitAlignment(module) {
    const captures = loadCaptures();
    const next = { ...(captures[module] || {}) };
    if (!next.dataUrl) {
      showStudioNotice(`Add a ${MODULE_CAPTURE_TARGET[module] || 'reference photo'} first so AutoIQ Pro can set a Smart Fit baseline.`);
      return;
    }
    next.alignment = _estimateAlignment(module, next);
    next.fitMode = 'smart';
    next.updatedAt = new Date().toISOString();
    captures[module] = next;
    saveCaptures(captures);
    _syncStudioCaptureUI(module);
    _syncBumperAlignmentUI();
    _syncWheelAlignmentUI();
    _syncGlassAlignmentUI();
    _syncPanelAlignmentUI();
    showStudioNotice(`${MODULE_META[module]?.label || 'Studio module'} was auto-aligned. Nudge the sliders if you want a custom fit.`);
  }

  function _captureMetaLine(module, capture) {
    const mode = capture.fitMode === 'manual' ? 'Custom fit' : 'Smart Fit';
    const active = capture.variantTitle ? `Inspection active · ${capture.variantTitle}` : 'Reference ready';
    return `${mode} · ${active} · Drag photo or overlay to adjust`;
  }

  function _previewGuideHTML(module, capture) {
    const mode = capture.fitMode === 'manual' ? 'custom' : 'smart';
    if (module === 'bumper') {
      return `<div class="workspace-guide workspace-guide-bumper ${mode}"><span class="guide-line bumper-line left"></span><span class="guide-line bumper-line right"></span><span class="guide-center-line"></span></div>`;
    }
    if (module === 'wheel') {
      return `<div class="workspace-guide workspace-guide-wheel ${mode}"><span class="guide-zone-box"></span><span class="guide-center-line horizontal"></span></div>`;
    }
    if (module === 'glass') {
      return `<div class="workspace-guide workspace-guide-glass ${mode}"><span class="guide-zone-box"></span><span class="guide-center-line horizontal low"></span></div>`;
    }
    return `<div class="workspace-guide workspace-guide-panel ${mode}"><span class="guide-center-line"></span><span class="guide-center-line horizontal"></span><span class="guide-zone-box tall"></span></div>`;
  }

  function setBumperAlignment(key, value) {
    const captures = loadCaptures();
    const next = { ...(captures.bumper || {}) };
    next.alignment = { ...DEFAULT_BUMPER_ALIGNMENT, ...(next.alignment || {}), [key]: Number(value) };
    next.fitMode = 'manual';
    next.updatedAt = new Date().toISOString();
    captures.bumper = next;
    saveCaptures(captures);
    _syncStudioCaptureUI('bumper');
    _syncBumperAlignmentUI();
  }

  function _updateCapture(module, updater) {
    const captures = loadCaptures();
    const current = { ...(captures[module] || {}) };
    if (!current.dataUrl) return;
    const next = updater(current);
    next.updatedAt = new Date().toISOString();
    captures[module] = next;
    saveCaptures(captures);
    _syncStudioCaptureUI(module);
    _syncBumperAlignmentUI();
    _syncWheelAlignmentUI();
    _syncGlassAlignmentUI();
    _syncPanelAlignmentUI();
  }

  function _clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function _bindWorkspaceDrag(module, preview) {
    if (module !== 'bumper' && module !== 'wheel') return;
    const stage = preview.querySelector('.workspace-preview-stage');
    const image = preview.querySelector('.workspace-preview-image');
    const overlay = preview.querySelector('[data-drag-target="overlay"]');
    if (!stage || !image) return;

    const bindTarget = (node, type) => {
      if (!node) return;
      node.onpointerdown = event => {
        const rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const startX = event.clientX;
        const startY = event.clientY;
        const capture = loadCaptures()[module] || {};
        const startImage = { ..._defaultImageTransform(), ...(capture.imageTransform || {}) };
        const startAlignment = { ..._defaultAlignment(module), ...(capture.alignment || {}) };
        node.setPointerCapture?.(event.pointerId);

        const move = moveEvent => {
          const dxPct = ((moveEvent.clientX - startX) / rect.width) * 100;
          const dyPct = ((moveEvent.clientY - startY) / rect.height) * 100;
          if (type === 'image') {
            _updateCapture(module, current => ({
              ...current,
              imageTransform: {
                x: _clamp(startImage.x + dxPct, -35, 35),
                y: _clamp(startImage.y + dyPct, -35, 35),
              },
              fitMode: 'manual',
            }));
            return;
          }
          if (module === 'bumper') {
            _updateCapture(module, current => ({
              ...current,
              alignment: {
                ...DEFAULT_BUMPER_ALIGNMENT,
                ...(current.alignment || {}),
                ...startAlignment,
                offsetX: _clamp((startAlignment.offsetX || 0) + dxPct, -18, 18),
                y: _clamp(startAlignment.y + dyPct, 18, 42),
              },
              fitMode: 'manual',
            }));
            return;
          }
          _updateCapture(module, current => ({
            ...current,
            alignment: {
              ...DEFAULT_WHEEL_ALIGNMENT,
              ...(current.alignment || {}),
              ...startAlignment,
              x: _clamp(startAlignment.x + dxPct, 2, 24),
              y: _clamp(startAlignment.y + dyPct, 6, 50),
            },
            fitMode: 'manual',
          }));
        };

        const stop = stopEvent => {
          node.releasePointerCapture?.(stopEvent.pointerId);
          node.removeEventListener('pointermove', move);
          node.removeEventListener('pointerup', stop);
          node.removeEventListener('pointercancel', stop);
        };

        node.addEventListener('pointermove', move);
        node.addEventListener('pointerup', stop);
        node.addEventListener('pointercancel', stop);
      };
    };

    bindTarget(image, 'image');
    bindTarget(overlay, 'overlay');
  }

  function _syncBumperAlignmentUI() {
    const alignment = { ...DEFAULT_BUMPER_ALIGNMENT, ...(loadCaptures().bumper?.alignment || {}) };
    const map = {
      bumperAlignY: alignment.y,
      bumperAlignX: alignment.x,
      bumperAlignWidth: alignment.width,
      bumperAlignHeight: alignment.height,
      bumperAlignRotate: alignment.rotate,
    };
    Object.entries(map).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.value = String(value);
    });
  }

  function setWheelAlignment(key, value) {
    const captures = loadCaptures();
    const next = { ...(captures.wheel || {}) };
    next.alignment = { ...DEFAULT_WHEEL_ALIGNMENT, ...(next.alignment || {}), [key]: Number(value) };
    next.fitMode = 'manual';
    next.updatedAt = new Date().toISOString();
    captures.wheel = next;
    saveCaptures(captures);
    _syncStudioCaptureUI('wheel');
    _syncWheelAlignmentUI();
  }

  function _syncWheelAlignmentUI() {
    const alignment = { ...DEFAULT_WHEEL_ALIGNMENT, ...(loadCaptures().wheel?.alignment || {}) };
    const map = {
      wheelAlignY: alignment.y,
      wheelAlignX: alignment.x,
      wheelAlignWidth: alignment.width,
      wheelAlignHeight: alignment.height,
      wheelAlignRadius: alignment.radius,
    };
    Object.entries(map).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.value = String(value);
    });
  }

  function setGlassAlignment(key, value) {
    const captures = loadCaptures();
    const next = { ...(captures.glass || {}) };
    next.alignment = { ...DEFAULT_GLASS_ALIGNMENT, ...(next.alignment || {}), [key]: Number(value) };
    next.fitMode = 'manual';
    next.updatedAt = new Date().toISOString();
    captures.glass = next;
    saveCaptures(captures);
    _syncStudioCaptureUI('glass');
    _syncGlassAlignmentUI();
  }

  function _syncGlassAlignmentUI() {
    const alignment = { ...DEFAULT_GLASS_ALIGNMENT, ...(loadCaptures().glass?.alignment || {}) };
    const map = {
      glassAlignY: alignment.y,
      glassAlignX: alignment.x,
      glassAlignWidth: alignment.width,
      glassAlignHeight: alignment.height,
      glassAlignRadius: alignment.radius,
    };
    Object.entries(map).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.value = String(value);
    });
  }

  function setPanelAlignment(key, value) {
    const captures = loadCaptures();
    const next = { ...(captures.panel || {}) };
    next.alignment = { ...DEFAULT_PANEL_ALIGNMENT, ...(next.alignment || {}), [key]: Number(value) };
    next.fitMode = 'manual';
    next.updatedAt = new Date().toISOString();
    captures.panel = next;
    saveCaptures(captures);
    _syncStudioCaptureUI('panel');
    _syncPanelAlignmentUI();
  }

  function _syncPanelAlignmentUI() {
    const alignment = { ...DEFAULT_PANEL_ALIGNMENT, ...(loadCaptures().panel?.alignment || {}) };
    const map = {
      panelAlignY: alignment.y,
      panelAlignX: alignment.x,
      panelAlignWidth: alignment.width,
      panelAlignHeight: alignment.height,
      panelAlignRadius: alignment.radius,
    };
    Object.entries(map).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.value = String(value);
    });
  }

  function _syncStudioSelectionUI(module) {
    const capture = loadCaptures()[module] || {};
    if (module === 'bumper') {
      document.getElementById('bumperOptionLowerCover')?.classList.toggle('selected', capture.variant === 'lower-cover');
      document.getElementById('bumperOptionCornerHit')?.classList.toggle('selected', capture.variant === 'corner-hit');
      document.getElementById('bumperOptionCenterCrack')?.classList.toggle('selected', capture.variant === 'center-crack');
      return;
    }
    if (module === 'wheel') {
      document.getElementById('wheelSwatchCurbRash')?.classList.toggle('selected', capture.variant === 'curb-rash');
      document.getElementById('wheelSwatchSidewallMark')?.classList.toggle('selected', capture.variant === 'sidewall-mark');
      document.getElementById('wheelSwatchTreadWear')?.classList.toggle('selected', capture.variant === 'tread-wear');
      document.getElementById('wheelSwatchBentLip')?.classList.toggle('selected', capture.variant === 'bent-lip');
      return;
    }
    if (module === 'glass') {
      document.getElementById('glassSwatchWindshieldChip')?.classList.toggle('selected', capture.variant === 'windshield-chip');
      document.getElementById('glassSwatchLensCrack')?.classList.toggle('selected', capture.variant === 'lens-crack');
      document.getElementById('glassSwatchHousingBreak')?.classList.toggle('selected', capture.variant === 'housing-break');
      document.getElementById('glassSwatchTrimDamage')?.classList.toggle('selected', capture.variant === 'trim-damage');
      return;
    }
    document.getElementById('panelSwatchDentZone')?.classList.toggle('selected', capture.variant === 'dent-zone');
    document.getElementById('panelSwatchPaintTransfer')?.classList.toggle('selected', capture.variant === 'paint-transfer');
    document.getElementById('panelSwatchCreaseLine')?.classList.toggle('selected', capture.variant === 'crease-line');
    document.getElementById('panelSwatchClearcoatBreak')?.classList.toggle('selected', capture.variant === 'clearcoat-break');
  }

  function plannerPrimaryAction() {
    if (_plannerTab === 'calendar') {
      openModal();
      return;
    }
    if (_plannerTab === 'compare') {
      openStudioWorkspace('bumper');
      return;
    }
    createStudioSession('bumper');
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

    const issueChips  = (result.issues || []).map(i =>
      `<span class="result-chip issue">${_esc(i.replace(/_/g, ' '))}</span>`).join('');
    const recItems    = (result.recommendations || []).map(r =>
      `<li class="result-rec-item">✅ ${_esc(r)}</li>`).join('');

    const demoBanner = result._demo
      ? `<div class="result-demo-banner">${result._apiError ? '⚠️ API unreachable — showing demo results. Set your backend URL in ⚙️ Settings.' : '🔬 Demo mode — connect a backend in ⚙️ Settings for real vehicle analysis.'}</div>`
      : '';

    const partName = result.part_name || result.skin_type || 'unknown area';

    document.getElementById('scanResultWrap').innerHTML = `
      ${demoBanner}
      <div class="result-card">
        <div class="result-overline">AutoIQ Pro: Live Triage</div>
        <div class="result-skin-type">
          <span class="result-skin-icon">🚗</span>
          <div>
            <div class="result-skin-label">Likely Part</div>
            <div class="result-skin-value">${_esc(partName.charAt(0).toUpperCase() + partName.slice(1))}</div>
          </div>
        </div>

        <div class="result-meta-strip">
          <div class="result-meta-pill">
            <span class="result-meta-kicker">Findings</span>
            <strong>${result.issues?.length || 0}</strong>
          </div>
          <div class="result-meta-pill">
            <span class="result-meta-kicker">Next Step</span>
            <strong style="color:${urgencyColor}">${urgencyLabel}</strong>
          </div>
        </div>

        ${result.issues?.length ? `
        <div class="result-section">
          <div class="result-section-title">Observed Damage</div>
          <div class="result-chips">${issueChips}</div>
        </div>` : ''}

        ${result.recommendations?.length ? `
        <div class="result-section">
          <div class="result-section-title">Repair Guidance</div>
          <ul class="result-rec-list">${recItems}</ul>
        </div>` : ''}

        <div class="result-appt-suggest" style="border-left: 4px solid ${urgencyColor}">
          <div class="result-appt-header">
            <span class="result-appt-icon">📅</span>
            <div>
              <div class="result-appt-type">${_esc(result.suggested_appointment?.type || 'Body Shop')}</div>
              <div class="result-appt-urgency" style="color:${urgencyColor}">${urgencyLabel}</div>
            </div>
          </div>
          ${result.suggested_appointment?.reason ? `<p class="result-appt-reason">${_esc(result.suggested_appointment.reason)}</p>` : ''}
        </div>

        <button class="btn-primary result-book-btn"
          onclick="glowApp.bookFromScan()">
          ✨ Add Repair Plan To Cases
        </button>
        <button class="btn-ghost" style="width:100%;margin-top:0.5rem"
          onclick="glowApp.openStudioWorkspace('bumper')">
          Open Bumper Mapper
        </button>
        <button class="btn-ghost" style="width:100%;margin-top:0.5rem"
          onclick="glowApp.openStudioWorkspace('wheel')">
          Open Wheel & Tire
        </button>
        <button class="btn-ghost" style="width:100%;margin-top:0.5rem"
          onclick="glowApp.navigate('analysis')">
          Scan Again
        </button>
      </div>`;

    navigate('scanResult');
  }

  // ── Book from scan: create planner draft + prefill service modal ─────────────
  function bookFromScan() {
    if (!_lastScanResult) return;
    const apptType = _lastScanResult.suggested_appointment?.type || 'Body Shop';
    const reason   = _lastScanResult.suggested_appointment?.reason || '';
    const sessions = loadSessions();
    sessions.unshift(_buildSession('scan', {
      title: 'Repair Triage Plan',
      status: 'active',
      note: reason || 'Vehicle scan imported into your caseboard for follow-up and repair tracking.',
    }));
    saveSessions(sessions);
    _plannerTab = 'calendar';

    navigate('appointments');
    setTimeout(() => {
      openModal(null, {
        title: apptType + ' visit',
        type:  PERSONAL_TYPES.includes(apptType) ? apptType : 'Body Shop',
        notes: reason,
      });
    }, 100);
  }

  // ── Modal ─────────────────────────────────────────────────────────────────────
  function openModal(id, prefill) {
    _editingId = id || null;
    document.getElementById('apptForm').reset();
    _populateTypeSelect();
    document.getElementById('formClientGroup').style.display = 'none';

    if (id) {
      const appt = loadAppointments().find(a => a.id === id);
      if (!appt) return;
      document.getElementById('modalTitle').textContent = 'Edit Service';
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
      document.getElementById('modalTitle').textContent = 'New Service';
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
  function _populateTypeSelect() {
    document.getElementById('formType').innerHTML = PERSONAL_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  function saveAppointment(e) {
    e.preventDefault();
    const title  = document.getElementById('formTitle').value.trim();
    const date   = document.getElementById('formDate').value;
    const time   = document.getElementById('formTime').value;
    if (!title || !date || !time) return;

    const record = {
      id:     document.getElementById('formId').value || uid(),
      mode:   'personal',
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
    if (_currentScreen() === 'appointments') _renderPlanner();
    if (_currentScreen() === 'home')         _renderHomePreview();
  }

  function deleteAppointment(id) {
    const appts = loadAppointments().filter(a => a.id !== id);
    saveAppointments(appts);
    deleteApptFromBackend(id); // fire-and-forget
    closeModal();
    if (_currentScreen() === 'appointments') _renderPlanner();
    if (_currentScreen() === 'home')         _renderHomePreview();
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────
  const CHAT_KEY = 'glowai_chat_history';
  let _chatHistory = [];
  let _chatBusy = false;

  const OPENING_QUESTIONS = [
    'Start with the camera. What part of the car are you looking at?',
    'Tell me what happened and I will point you to the fastest triage flow.',
    'Need help with part ID, repair steps, or price context?',
    'Point at the damage and I will help turn that into a repair plan.',
  ];

  // Smart mock replies when no backend configured
  const MOCK_REPLIES = [
    { keys: ['bumper','fender','panel','door'], reply: 'Start with a straight-on photo of the damaged area, then use the repair workspace that matches the panel so the case stays organized.' },
    { keys: ['wheel','tire','rim','curb'], reply: 'Wheel and tire damage can mix cosmetic and safety issues. Capture the full wheel face plus the tire sidewall so the next step is clearer.' },
    { keys: ['glass','windshield','headlight','taillight'], reply: 'Glass and light damage should be photographed in even light with the crack or break fully visible from edge to edge.' },
    { keys: ['estimate','price','cost','repair'], reply: 'AutoIQ Pro is strongest when it starts with the camera first, then turns the corrected part into guidance and price context.' },
    { keys: ['scan','camera','photo','picture','analyze'], reply: 'Tap <strong>Start Camera Triage</strong> and begin with the damaged area. The core promise is part ID first, repair guidance second.' },
    { keys: ['appointment','book','shop','body'], reply: 'Use the Cases tab to save the scan and line up a body shop, glass shop, or tire follow-up.' },
  ];

  function _mockChatReply(msg) {
    const lower = msg.toLowerCase();
    for (const { keys, reply } of MOCK_REPLIES) {
      if (keys.some(k => lower.includes(k))) return reply;
    }
    return 'For the most personalized answer, connect your backend in ⚙️ Settings so I can use Claude AI. In the meantime, start with a scan so we can identify the likely part first.';
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

  function showStudioNotice(message) {
    const text = message || 'This repair update is ready inside AutoIQ Pro.';
    const title = document.getElementById('studioNoticeTitle');
    const copy = document.getElementById('studioNoticeCopy');
    const icon = document.getElementById('studioNoticeIcon');
    const kicker = document.getElementById('studioNoticeKicker');
    if (title) title.textContent = 'Repair Update';
    if (copy) copy.textContent = text;
    if (icon) icon.textContent = text.toLowerCase().includes('bumper') ? '🛻' :
      text.toLowerCase().includes('wheel') || text.toLowerCase().includes('tire') ? '🛞' :
      text.toLowerCase().includes('glass') || text.toLowerCase().includes('light') ? '💡' :
      text.toLowerCase().includes('panel') || text.toLowerCase().includes('paint') ? '🎨' : '🚗';
    if (kicker) kicker.textContent = 'AutoIQ Pro';
    document.getElementById('studioNoticeBackdrop')?.classList.remove('hidden');
  }

  function closeStudioNotice() {
    document.getElementById('studioNoticeBackdrop')?.classList.add('hidden');
  }

  function closeStudioNoticeIfBackdrop(e) {
    if (e.target === document.getElementById('studioNoticeBackdrop')) closeStudioNotice();
  }

  function scrollToSkinScan() {
    if (_currentScreen() !== 'analysis') {
      navigate('analysis');
      setTimeout(() => scrollToSkinScan(), 40);
      return;
    }
    _studioWorkspace = null;
    _syncStudioWorkspace();
    const anchor = document.querySelector('[data-scan-anchor="true"]');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setLastStudioPhoto(photo) {
    saveLastStudioPhoto(photo);
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() {
    seedMockData();
    seedStudioSessions();
    document.getElementById('headerBack').addEventListener('click', () => glowApp.goBack());
    window.addEventListener('popstate', () => { if (_history.length > 1) { _history.pop(); _render(); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeStudioNotice(); closeStackEditor(); } });
    _render();
  }

  return {
    navigate, goBack, setPlannerTab, plannerPrimaryAction, createStudioSession,
    pinCompareSlot, focusCompareSlot, swapCompareSlots, pinStackCompare, swapStackCompare, openStackCompareFromHome, saveCurrentStackVariant, applyStackVariant, createHybridStackFromCompare, toggleHybridModuleSource,
    openStackRenameEditor, openStackModuleSwapEditor, selectStackEditorModule, selectStackEditorSession, confirmStackEditor, closeStackEditor, closeStackEditorIfBackdrop,
    toggleFavoriteStackVariant, setDefaultStackVariant,
    openStudioWorkspace, openPlannerSession, saveStudioPreset, triggerStudioUpload, handleStudioUpload, saveStudioCapture,
    applyStudioTryOn, autoFitAlignment, setBumperAlignment, setWheelAlignment, setGlassAlignment, setPanelAlignment,
    openModal, closeModal, closeModalIfBackdrop, saveAppointment, deleteAppointment,
    setScanState, showScanResult, bookFromScan,
    setLastStudioPhoto,
    sendChat, showStudioNotice, closeStudioNotice, closeStudioNoticeIfBackdrop, scrollToSkinScan,
    saveSettings,
    init,
  };
})();

// Expose on window so scan.bundle.js can call window.glowApp.*
window.glowApp = glowApp;

document.addEventListener('DOMContentLoaded', () => glowApp.init());
