'use strict';

window.glowaiApp = {
  currentPage: 'home',
  pageHistory: [],
  lastTopLevelPage: 'home',
  suppressNextPop: false,
  currentService: 'brows',
  latestScan: null,
  liveScan: {
    active: false,
    samples: [],
    lastFrame: '',
  },
  scanUX: {
    lastAutoLaunchAt: 0,
  },
  voiceCoach: {
    recognition: null,
    active: false,
    speakReplies: false,
  },
  tryonState: {
    mode: 'brows',
    product: 'spf',
    browStyle: 'soft',
    browOffset: { x: 0, y: 0 },
    browSpread: 0,
    nailColor: 'var(--nail-berry)',
    nailLength: 'short',
    photos: {
      brows: '',
      nails: '',
    },
  },
  storageKeys: {
    favorites: 'glowai_favorites',
    bookings: 'glowai_bookings',
    chat: 'glowai_chat_history',
    scans: 'glowai_scans',
    climate: 'glowai_climate_profile',
    agentConfig: 'glowai_agent_config',
    agentLog: 'glowai_agent_log',
    subscription: 'glowai_subscription',
    whiteLabel: 'glowai_white_label',
    appType: 'glowai_app_type',
    habits: 'glowai_habit_preferences',
    adherence: 'glowai_adherence_loop',
    evalCases: 'glowai_skin_eval_cases',
    reportExports: 'glowai_report_exports',
    greeting: 'glowai_greeting_spoken',
    intro: 'glowai_intro_seen',
  },

  defaultPortrait: './assets/glow-guide-avatar.png',

  benchmarkProof: {
    weightedScore: 99.4,
    cases: 50,
    concernMatch: 98,
    routineRelevance: 100,
    safetyPass: 100,
    overlayStability: 100,
    productSurface: 100,
  },

  whiteLabelThemes: {
    blush: {
      accent: '#b9857d',
      accentDeep: '#8f5f58',
      primary: 'linear-gradient(135deg, #9d7068, #b9857d 54%, #c8ae79)',
      hero: 'linear-gradient(135deg, rgba(255,253,249,0.98), rgba(247,239,233,0.94) 54%, rgba(239,243,238,0.88))',
      pill: 'linear-gradient(135deg, rgba(234,208,202,0.52), rgba(220,196,146,0.24))',
    },
    sage: {
      accent: '#7e948d',
      accentDeep: '#526963',
      primary: 'linear-gradient(135deg, #607a73, #8ea79d 54%, #c8b68f)',
      hero: 'linear-gradient(135deg, rgba(255,253,249,0.98), rgba(240,244,238,0.94) 54%, rgba(247,239,233,0.88))',
      pill: 'linear-gradient(135deg, rgba(201,215,201,0.52), rgba(220,196,146,0.2))',
    },
    champagne: {
      accent: '#b6975f',
      accentDeep: '#80683d',
      primary: 'linear-gradient(135deg, #9f8150, #c8ae79 54%, #d8aaa5)',
      hero: 'linear-gradient(135deg, rgba(255,253,249,0.98), rgba(249,242,228,0.94) 54%, rgba(247,234,230,0.88))',
      pill: 'linear-gradient(135deg, rgba(234,217,185,0.54), rgba(216,170,165,0.2))',
    },
  },

  avatarIntro: {
    timers: [],
    lineIndex: 0,
    active: false,
    recognition: null,
    listening: false,
    lines: [
      'Give me a second. I am checking the light and easing you into the scan.',
      'Hi, I am your GlowAI guide. We can scan your face now, or you can tell me what brought you here.',
      'If we scan, I will ask permission first and keep this focused on cosmetic skin guidance.',
    ],
  },

  shareConfig: {
    title: 'GlowAI',
    url: 'https://808cadger.github.io/GlowAI/download.html',
    downloadUrl: 'https://raw.githubusercontent.com/808cadger/GlowAI/main/www/download.html',
    text: 'Try GlowAI. Open the instant downloadable PWA, scan your face, and share a skin report in seconds.',
  },

  pageLabels: {
    home: 'Home',
    scan: 'Face Scan',
    services: 'Services',
    detail: 'Service Detail',
    booking: 'Booking',
    journey: 'Journey',
    agents: 'Agents',
    concierge: 'Coach',
    notes: 'Favorites',
  },

  topLevelPages: ['home', 'scan', 'services', 'journey', 'agents', 'concierge', 'notes'],

  focusContent: {
    brows: {
      label: 'Brow Studio',
      title: 'Frame the face after the skin read.',
      description: 'Preview soft arch, lifted shape, and cleanup timing with camera guidance and a clear booking path.',
      points: ['Shape read', 'Tint timing', 'Artist fit'],
      heroTitle: 'Brows come after the baseline.',
      heroCopy: 'Use the current scan to decide how much skin prep the complexion needs before shape and finish choices lock in.',
      previewLabel: 'Selected service',
      previewTitle: 'Brow design studio',
      previewBody: 'Shape mapping, tint guidance, and cleanup timing built around face framing.',
      previewTone: 'Warm sculpt',
      previewCTA: 'Open details',
      detailTitle: 'Brow design studio',
      detailSubtitle: 'Shape mapping, tint guidance, and cleanup timing built around face framing.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Clean framing, no overdone finish.',
      detailMoodBody: 'Use brows as the anchor when the skin read is stable and the face needs definition. The goal is structure that feels easy, not heavy.',
      detailTags: ['Shape mapping', 'Tint edit', 'Artist fit'],
      detailList: ['Ideal for weddings, dinners, and polished day looks', 'Helps frame makeup and hair choices more clearly', 'Works best when booked before finish and final styling'],
      detailCTA: 'Book brow studio',
      favoriteTitle: 'Brows first with soft polish follow-up',
      favoriteSummary: 'Clean brow framing before makeup, with prep timed to keep the look polished and lifted.',
    },
    nails: {
      label: 'Nail Studio',
      title: 'Try color and finish without overthinking it.',
      description: 'Move from clean neutrals to stronger sets with saved inspiration and direct booking into manicure services.',
      points: ['Color preview', 'Finish compare', 'Rebook path'],
      heroTitle: 'Nails support the whole plan.',
      heroCopy: 'Use the scan to keep skin prep realistic, then choose finish, color, and set direction around timing.',
      previewLabel: 'Selected service',
      previewTitle: 'Manicure mood board',
      previewBody: 'Move from neutrals to statement sets with clearer finish direction and rebooking logic.',
      previewTone: 'Gloss focus',
      previewCTA: 'Open details',
      detailTitle: 'Manicure mood board',
      detailSubtitle: 'Move from neutrals to statement sets with clearer finish and rebooking direction.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'A small detail that changes the whole read.',
      detailMoodBody: 'Use nails to set finish, color, and texture early. A clear nail choice makes the rest of the beauty direction easier to settle.',
      detailTags: ['Color preview', 'Finish compare', 'Rebook favorites'],
      detailList: ['Best when you want one beauty detail to lead the whole look', 'Great for event planning and repeat studio visits', 'Easy to pair with soft polish or stronger fashion direction'],
      detailCTA: 'Reserve nail set',
      favoriteTitle: 'Gloss nails with soft evening finish',
      favoriteSummary: 'A polished manicure path that keeps the rest of the beauty look clean, tonal, and event-ready.',
    },
    tryon: {
      label: 'Style Try-On',
      title: 'Coordinate style with the skin plan.',
      description: 'Use virtual try-on as part of one complete plan so clothing, makeup, brows, and nails feel aligned.',
      points: ['Outfit pairing', 'Palette lock', 'Look saves'],
      heroTitle: 'Style comes after skin context.',
      heroCopy: 'Set silhouette and palette once the skin plan is clear so finish, hair, and nails support the same impression.',
      previewLabel: 'Selected service',
      previewTitle: 'Clothes and look try-on',
      previewBody: 'Pair outfit direction with makeup and nails so the whole look feels intentional before booking.',
      previewTone: 'Style sync',
      previewCTA: 'Open details',
      detailTitle: 'Clothes and look try-on',
      detailSubtitle: 'Pair outfit direction with makeup and nails so the whole look feels intentional.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Choose the silhouette, then simplify the rest.',
      detailMoodBody: 'Try-on works best when it does not live alone. Use it to decide whether the rest of the look should go softer, sharper, cleaner, or more expressive.',
      detailTags: ['Outfit pairing', 'Palette lock', 'Look saves'],
      detailList: ['Best for weddings, parties, shoots, and big nights out', 'Useful when you are between two styling directions', 'Helps hair and makeup feel matched instead of random'],
      detailCTA: 'Save styled look',
      favoriteTitle: 'Outfit-led beauty direction',
      favoriteSummary: 'Use the dress or outfit first, then let GlowAI align makeup, hair, nails, and prep around it.',
    },
    makeup: {
      label: 'Finish Studio',
      title: 'Compare finish directions before booking.',
      description: 'Explore soft, polished, editorial, and day-to-night looks with artist and timing guidance.',
      points: ['Finish choice', 'Artist guidance', 'Look compare'],
      heroTitle: 'Finish works better with scan-led care.',
      heroCopy: 'Use the latest skin read to decide whether the finish should stay dewy, satin, brightening, or coverage-focused.',
      previewLabel: 'Selected service',
      previewTitle: 'Soft polish planner',
      previewBody: 'Compare finish directions and move users toward the right artist, timing, and event finish energy.',
      previewTone: 'Finish edit',
      previewCTA: 'Open details',
      detailTitle: 'Soft polish planner',
      detailSubtitle: 'Compare finish directions and move toward the right artist, timing, and event finish energy.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Decide the finish before the plan gets crowded.',
      detailMoodBody: 'Soft polish, editorial shine, or clean skin-forward makeup all pull the rest of the plan in different directions. Settle that decision early.',
      detailTags: ['Finish selection', 'Artist guidance', 'Look comparison'],
      detailList: ['Best when the makeup look is the centerpiece', 'Pairs well with saved outfit and brow decisions', 'Useful for timing estimates and artist matching'],
      detailCTA: 'Plan finish session',
      favoriteTitle: 'Soft polish with skin-led prep',
      favoriteSummary: 'A smooth, polished finish plan that keeps brows, prep, and final finish aligned.',
    },
    skin: {
      label: 'Skin Ritual',
      title: 'Keep the scan as the base layer.',
      description: 'The current read should support prep, product, and treatment recommendations across the full flow.',
      points: ['Skin scan', 'Routine', 'Treatment fit'],
      heroTitle: 'Prep starts with measurable skin signals.',
      heroCopy: 'Lead with camera-guided prep so routines, products, and service timing respond to hydration, tone, clarity, and texture.',
      previewLabel: 'Selected service',
      previewTitle: 'Skin read and routine',
      previewBody: 'Keep scan-led care as the base layer inside the broader beauty flow.',
      previewTone: 'Base layer',
      previewCTA: 'Open details',
      detailTitle: 'Skin read and routine',
      detailSubtitle: 'Keep scan-led care as the base layer inside the broader beauty flow.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Let the skin set the pace.',
      detailMoodBody: 'Skin care should make the rest of the services easier. Use scan-led planning to decide timing, hydration, recovery, and what to avoid.',
      detailTags: ['Skin scan', 'Prep routine', 'Treatment fit'],
      detailList: ['Best started before any finish-heavy event week', 'Helps avoid overdoing treatments too close to the date', 'Supports brow, finish, and hair planning with better timing'],
      detailCTA: 'Start skin prep',
      favoriteTitle: 'Prep-first beauty week',
      favoriteSummary: 'Use skin as the base layer so makeup, brows, and hair all sit better on the final event day.',
    },
    hair: {
      label: 'Hair Studio',
      title: 'Pair styling with the rest of the plan.',
      description: 'Organize blowouts, silk press, curl sets, and finish work inside the same flow as skin, outfit, and makeup choices.',
      points: ['Style preview', 'Care notes', 'Return booking'],
      heroTitle: 'Hair is the final shape.',
      heroCopy: 'Use hair as the finishing layer after scan-led care, finish timing, and event styling are settled.',
      previewLabel: 'Selected service',
      previewTitle: 'Style and finish lounge',
      previewBody: 'Bring blowouts, curls, and finish work into the same planning stack as finish so the look lands cohesively.',
      previewTone: 'Finish motion',
      previewCTA: 'Open details',
      detailTitle: 'Style and finish lounge',
      detailSubtitle: 'Bring blowouts, curls, and finish work into the same planning stack as finish.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Finish with shape, movement, and timing.',
      detailMoodBody: 'Hair often lands last, but it changes everything. Use this page to decide whether the look needs soft movement, polished structure, or a cleaner return path.',
      detailTags: ['Style preview', 'Care notes', 'Return booking'],
      detailList: ['Best when hair needs to harmonize with outfit neckline and finish', 'Useful for timing around makeup and prep services', 'Supports repeat styling and maintenance planning'],
      detailCTA: 'Book hair finish',
      favoriteTitle: 'Finish-first hair timing',
      favoriteSummary: 'A polished hair finish plan that works with outfit shape, makeup timing, and repeat studio visits.',
    },
  },

  isOwnerMode() {
    return this.getAppType() === 'owner';
  },

  getAppType() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('mode') || params.get('app') || '';
    const path = window.location.pathname;

    if (params.get('owner') === '1') return 'owner';
    if (requested === 'owner' || requested === 'client') return requested;
    if (path.endsWith('/owner.html')) return 'owner';
    if (path.endsWith('/client.html')) return 'client';

    const stored = localStorage.getItem(this.storageKeys.appType);
    return stored === 'owner' ? 'owner' : 'client';
  },

  init() {
    this.ensureSeedData();
    this.seedLocalApiKey();
    const appType = this.getAppType();
    localStorage.setItem(this.storageKeys.appType, appType);
    document.body.dataset.appType = appType;
    document.body.classList.toggle('owner-version', appType === 'owner');
    document.body.classList.toggle('client-version', appType === 'client');
    document.body.classList.toggle('mobile-scan-entry', this.shouldUseSelfieEntry());
    this.applyWhiteLabelWorkspace(this.isOwnerMode() ? this.getStored(this.storageKeys.whiteLabel, {}) : {});
    this.configureAppTypeUI();
    this.bindMenu();
    this.bindAppTypeSwitcher();
    this.bindPageButtons();
    this.bindFocusTabs();
    this.bindServiceCards();
    this.bindBookingFlow();
    this.bindFavorites();
    this.bindChat();
    this.bindScan();
    this.bindShare();
    this.bindVoiceCoach();
    this.bindAgentOps();
    this.bindTryOn();
    this.bindAvatarSkills();
    if (!this.isOwnerMode()) {
      this.bindAvatarIntro();
    }
    this.registerServiceWorker();
    if (window.GLOWAI_ENABLE_PUSH === true) {
      this.registerPushNotifications();
    }
    this.renderFocus('brows');
    this.renderFavorites();
    this.renderBookings();
    this.renderChat();
    this.renderScanSummary();
    this.renderForecast();
    this.renderAdherenceLoop();
    this.renderAgentOps();
    this.loadSalonWorkspaceFromBackend();
    this.bindBackNavigation();
    this.forceIntroVisibleState();
    this.showPage(this.getPageFromHash() || this.getInitialPage(), { replace: true, source: 'init' });
    if (!this.isOwnerMode() && !this.startAvatarIntro()) {
      window.setTimeout(() => this.greetUserOnce({ forceSpeech: true }), 450);
    }
  },

  forceIntroVisibleState() {
    if (this.isOwnerMode()) return;
    const intro = document.getElementById('glowIntro');
    if (!intro) return;
    // Hard reset in case a prior session left stale hidden/closing classes.
    intro.classList.remove('hidden', 'is-closing', 'is-listening');
    intro.style.display = 'grid';
    intro.style.visibility = 'visible';
    intro.style.opacity = '1';
  },

  shouldUseSelfieEntry() {
    const isNative = window.Capacitor?.isNativePlatform?.() === true;
    const userAgent = navigator.userAgent || '';
    const isMobileRuntime = /Android|iPhone|iPad|iPod/i.test(userAgent);
    const viewportWidth = Math.min(
      window.innerWidth || 9999,
      document.documentElement?.clientWidth || 9999,
      window.screen?.width || 9999,
    );
    const isSmallScreen = window.matchMedia?.('(max-width: 640px)').matches === true || viewportWidth <= 760;
    return !this.isOwnerMode() && (isNative || isMobileRuntime || isSmallScreen);
  },

  getInitialPage() {
    if (this.isOwnerMode()) return 'agents';
    return this.shouldUseSelfieEntry() ? 'scan' : 'home';
  },

  ensureSeedData() {
    if (!localStorage.getItem(this.storageKeys.chat)) {
      const seeded = [
        { role: 'assistant', text: "Welcome to GlowAI. Scan your face to get instant skincare insights, AM/PM routine direction, and product suggestions that keep your barrier, hydration, and SPF rhythm clear." },
      ];
      localStorage.setItem(this.storageKeys.chat, JSON.stringify(seeded));
    }
    if (!localStorage.getItem(this.storageKeys.scans)) {
      const scan = this.createDemoScanRecord();
      localStorage.setItem(this.storageKeys.scans, JSON.stringify([scan]));
      this.latestScan = scan;
    }
  },

  getStored(key, fallback = []) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  },

  seedLocalApiKey() {
    const key = window.GLOWAI_LOCAL_API_KEY;
    if (typeof key === 'string' && key.startsWith('sk-ant-') && !this.getApiKey()) {
      localStorage.setItem('glowai_apikey', key);
    }
    try {
      delete window.GLOWAI_LOCAL_API_KEY;
    } catch {
      window.GLOWAI_LOCAL_API_KEY = '';
    }
  },

  setStored(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  trySetStored(key, value) {
    try {
      this.setStored(key, value);
      return true;
    } catch {
      return false;
    }
  },

  getLatestScan() {
    return this.latestScan || this.getStored(this.storageKeys.scans)[0] || null;
  },

  getReusableFacePhoto() {
    return this.tryonState.photos.brows || this.getLatestScan()?.photo || '';
  },

  getTryOnPhoto(mode = this.tryonState.mode) {
    return mode === 'nails'
      ? this.tryonState.photos.nails || ''
      : this.tryonState.photos[mode] || this.getReusableFacePhoto();
  },

  createDemoScanImage() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#28113a"/><stop offset=".52" stop-color="#b74e83"/><stop offset="1" stop-color="#ffd76a"/></linearGradient>
        <radialGradient id="glow" cx=".5" cy=".35" r=".48"><stop stop-color="#fff7fb" stop-opacity=".72"/><stop offset=".42" stop-color="#ffcfdf" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="900" height="1200" fill="url(#bg)"/>
      <circle cx="450" cy="410" r="350" fill="url(#glow)"/>
      <ellipse cx="450" cy="550" rx="215" ry="300" fill="#d99683"/>
      <path d="M250 330c80-150 315-165 412-12 55 87 54 210 20 289-28-48-46-115-78-165-66-103-222-118-306-19-38 45-55 112-76 180-34-78-27-186 28-273z" fill="#23101f"/>
      <circle cx="367" cy="520" r="18" fill="#20111b"/><circle cx="533" cy="520" r="18" fill="#20111b"/>
      <path d="M374 676c49 35 103 35 152 0" fill="none" stroke="#7e3449" stroke-width="18" stroke-linecap="round"/>
      <ellipse cx="322" cy="605" rx="64" ry="32" fill="#ff7b9c" opacity=".42"/><ellipse cx="578" cy="605" rx="64" ry="32" fill="#ff7b9c" opacity=".42"/>
      <rect x="110" y="110" width="680" height="880" rx="48" fill="none" stroke="#ffd76a" stroke-width="12" stroke-dasharray="38 24"/>
      <rect x="120" y="90" width="360" height="72" rx="18" fill="#110819" opacity=".72"/>
      <text x="150" y="137" fill="#fff7fb" font-size="34" font-family="Arial" font-weight="700">GlowAI demo scan</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  },

  createDemoTryOnImage(mode = 'brows') {
    if (mode !== 'nails') return this.createDemoScanImage();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#170c24"/><stop offset=".5" stop-color="#7d2f68"/><stop offset="1" stop-color="#ffd76a"/></linearGradient>
        <radialGradient id="shine" cx=".5" cy=".2" r=".55"><stop stop-color="#fff7fb" stop-opacity=".62"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="900" height="1200" fill="url(#bg)"/>
      <circle cx="450" cy="320" r="360" fill="url(#shine)"/>
      <path d="M238 990c20-124 55-296 83-430 15-71 37-118 78-112 39 6 43 50 35 110l-27 204 32-298c8-72 33-122 78-119 45 4 55 56 48 131l-28 310 48-269c13-72 44-110 85-100 39 10 44 57 29 126l-58 280 35-137c15-58 45-86 80-75 36 11 44 51 28 109l-77 281c-26 93-98 151-194 151H374c-82 0-149-67-136-162z" fill="#d99a86"/>
      <path d="M352 435c12-34 35-51 65-45 30 6 44 30 40 67M488 338c18-30 42-43 72-34 30 9 43 35 36 75M626 406c21-24 45-33 73-22 29 11 40 38 31 74" fill="none" stroke="#ffd1c6" stroke-width="14" stroke-linecap="round" opacity=".55"/>
      <ellipse cx="399" cy="421" rx="42" ry="23" fill="#ff6fae"/><ellipse cx="532" cy="330" rx="43" ry="24" fill="#ff6fae"/><ellipse cx="671" cy="399" rx="42" ry="23" fill="#ff6fae"/><ellipse cx="762" cy="603" rx="36" ry="20" fill="#ff6fae"/>
      <rect x="110" y="110" width="680" height="880" rx="48" fill="none" stroke="#ffd76a" stroke-width="12" stroke-dasharray="38 24"/>
      <rect x="120" y="90" width="380" height="72" rx="18" fill="#110819" opacity=".72"/>
      <text x="150" y="137" fill="#fff7fb" font-size="34" font-family="Arial" font-weight="700">GlowAI nail try-on</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  },

  createDemoScanRecord() {
    const base = this.generateFaceAnalysis({ available: false, detected: true, confidence: 88 }, {
      hydration: 72,
      clarity: 78,
      texture: 74,
      tone: 80,
      oil: 58,
      redness: 18,
      humidityStress: 46,
      segmentation: 'guided-demo',
    });
    return {
      id: `demo-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      photo: this.createDemoScanImage(),
      demo: true,
      ...base,
      overlays: this.generateScanOverlays(base.metrics, base.concerns),
    };
  },

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (window.Capacitor?.isNativePlatform?.()) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
        if (window.caches?.keys) {
          const cacheNames = await window.caches.keys();
          await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
        }
        this.logAgentAction('pwa', 'Native cache cleared', {
          clearedAt: new Date().toISOString(),
        });
      } catch (error) {
        this.logAgentAction('pwa', 'Native cache clear failed', { error: error.message });
      }
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { type: 'module' });
      this.logAgentAction('pwa', 'Offline scan cache ready', {
        scope: registration.scope,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logAgentAction('pwa', 'Service worker registration failed', { error: error.message });
    }
  },

  async registerPushNotifications() {
    if (window.GLOWAI_ENABLE_PUSH !== true) {
      this.logAgentAction('push', 'Push registration skipped', { reason: 'firebase-not-configured' });
      return;
    }
    try {
      const result = await window.GlowAIPush?.registerPush?.({ userId: 'local-demo-user' });
      if (result?.registered) {
        this.logAgentAction('push', 'Capacitor push registered', { updatedAt: new Date().toISOString() });
      }
    } catch (error) {
      this.logAgentAction('push', 'Capacitor push unavailable', { error: error.message });
    }
  },

  getGlowAISystemPrompt(extraContext = '') {
    return `You are GlowAI, a proactive, friendly, and reliable AI agent that helps the user build healthy habits and stay on track with daily routines. You speak in warm, concise, human-like English, and you always prioritize action and clarity over being verbose.

Core identity:
- You are a personal assistant, not just a chatbot.
- Your main tasks are reminders, check-ins, habit coaching, simple planning, skin routines, and scan-based follow-through.
- Assume the user is mobile-first and may be mid-task, tired, or distracted, so responses should be short, clear, and minimally intrusive.

Behavior rules:
- Always keep responses under 2-3 sentences unless the user asks for more detail.
- Use natural, friendly language. No markdown, no code blocks, and no lists unless explicitly asked.
- If unsure about intent, ask 1 short clarifying question instead of elaborating.
- Never pretend to know private facts you have not been told.
- Never pressure or shame the user; be supportive and non-judgmental.

Reminder and task protocol:
- If the user mentions a goal, habit, or chore, propose a time and an optional follow-up check-in.
- If the user asks whether they did a habit today, lightly confirm if clear; if not done, ask whether they want to do it now or be reminded later.
- For recurring reminders, ask how often and what time window they prefer.
- If the user says "don't ask me again", "turn this off", or "cancel that", confirm briefly and stop that reminder.
- If tools exist, confirm intent before triggering reminders. If no real tool exists, keep behavior virtual and remember the preference in chat memory.

Communication style:
- For check-ins, start with a short recap, then ask status.
- If they say yes, celebrate briefly and ask if they want another reminder.
- If they say no or not yet, offer "do it now" or "remind me later" with a specific time.
- If they get annoyed, de-escalate and offer to mute the reminder.

Error handling and ambiguity:
- If the user says only "remind me", ask: "What should I remind you about?"
- If the user changes their mind, confirm briefly: "OK, I've turned that reminder off."

Goal:
Keep the loop short: ask, confirm, set reminder, follow up, close. In every interaction, identify the next concrete action and phrase the reply so it helps the user act now or commit to a specific time/trigger later.

${extraContext}`.trim();
  },

  bindMenu() {
    const trigger = document.getElementById('menuTrigger');
    const menu = document.getElementById('pageMenu');
    const backdrop = document.getElementById('menuBackdrop');

    trigger?.addEventListener('click', () => {
      const open = !menu?.classList.contains('hidden');
      this.setMenuOpen(!open);
    });

    document.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        this.showPage(button.getAttribute('data-page'));
        this.setMenuOpen(false);
      });
    });

    document.addEventListener('click', (event) => {
      if (!menu || !trigger) return;
      if (menu.contains(event.target) || trigger.contains(event.target)) return;
      this.setMenuOpen(false);
    });

    backdrop?.addEventListener('click', () => this.setMenuOpen(false));
  },

  bindAppTypeSwitcher() {
    document.querySelectorAll('[data-app-type]').forEach((button) => {
      button.addEventListener('click', () => {
        const appType = button.getAttribute('data-app-type') === 'owner' ? 'owner' : 'client';
        this.setAppType(appType);
      });
    });
  },

  setAppType(appType) {
    localStorage.setItem(this.storageKeys.appType, appType);
    const params = new URLSearchParams(window.location.search);
    params.set('mode', appType);
    params.delete('owner');
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  },

  configureAppTypeUI() {
    const ownerMode = this.isOwnerMode();
    const brand = document.getElementById('appBrandName');
    const headline = document.getElementById('appBrandHeadline');
    const agentsKicker = document.getElementById('agentsKicker');
    const agentsTitle = document.getElementById('agentsTitle');
    const agentsCopy = document.getElementById('agentsCopy');

    document.querySelectorAll('[data-app-type]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-app-type') === (ownerMode ? 'owner' : 'client'));
    });

    document.querySelectorAll('[data-owner-label][data-client-label]').forEach((node) => {
      node.textContent = ownerMode ? node.getAttribute('data-owner-label') : node.getAttribute('data-client-label');
    });

    if (ownerMode) {
      if (brand) brand.textContent = 'GlowAI Owner';
      if (headline) headline.textContent = 'Studio controls, clients, and agents.';
      if (agentsKicker) agentsKicker.textContent = 'Owner app';
      if (agentsTitle) agentsTitle.textContent = 'Run the studio side of GlowAI.';
      if (agentsCopy) {
        agentsCopy.textContent = 'Configure booking, commerce, white-label branding, and agent workflows. The client app stays focused on scanning, coaching, favorites, and booking.';
      }
      return;
    }

    if (brand) brand.textContent = 'GlowAI Client';
    if (headline) headline.textContent = 'Skin clarity, guided.';
    if (agentsKicker) agentsKicker.textContent = 'Client actions';
    if (agentsTitle) agentsTitle.textContent = 'Turn your scan into the next step.';
    if (agentsCopy) {
      agentsCopy.textContent = 'Use GlowAI to prepare booking, product, and routine actions from your latest skin read. Owner-only studio setup stays out of the client app.';
    }
  },

  bindPageButtons() {
    document.querySelectorAll('[data-nav-target]').forEach((button) => {
      button.addEventListener('click', () => {
        this.showPage(button.getAttribute('data-nav-target'));
      });
    });

    document.querySelectorAll('.bottom-nav-item').forEach((button) => {
      button.addEventListener('click', () => {
        this.showPage(button.getAttribute('data-page'));
      });
    });
  },

  bindBackNavigation() {
    const backButton = document.getElementById('appBackButton');
    backButton?.addEventListener('click', () => this.goBack());

    window.addEventListener('popstate', (event) => {
      if (document.body.classList.contains('is-guided-scanning')) {
        this.cancelCameraScan('Camera closed from browser Back. Start again when you are ready.');
        return;
      }
      const page = event.state?.page || this.getPageFromHash() || this.getInitialPage();
      this.showPage(page, { replace: true, skipHistory: true, source: 'browser' });
    });
  },

  getPageFromHash() {
    const page = (window.location.hash || '').replace(/^#/, '').trim();
    return this.pageLabels[page] ? page : '';
  },

  bindFocusTabs() {
    document.querySelectorAll('[data-focus]').forEach((button) => {
      button.addEventListener('click', () => {
        this.renderFocus(button.getAttribute('data-focus'));
      });
    });
  },

  bindServiceCards() {
    document.querySelectorAll('[data-service]').forEach((card) => {
      const openService = () => {
        const service = card.getAttribute('data-service');
        this.renderFocus(service);
        this.showPage('detail');
      };

      card.addEventListener('click', openService);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openService();
        }
      });
    });

    document.querySelectorAll('[data-open-detail]').forEach((button) => {
      button.addEventListener('click', () => {
        const service = button.getAttribute('data-open-detail') || this.currentService;
        this.renderFocus(service);
        this.showPage('detail');
      });
    });

    document.querySelectorAll('[data-open-tryon]').forEach((button) => {
      button.addEventListener('click', async () => {
        const service = button.getAttribute('data-open-tryon') || 'brows';
        this.renderFocus(service);
        this.showPage('detail');
        if (this.getTryOnPhoto(this.tryonState.mode)) {
          this.renderTryOn();
          return;
        }
        await this.startTryOnCapture();
      });
    });
  },

  bindTryOn() {
    document.getElementById('tryonCaptureBtn')?.addEventListener('click', () => this.startTryOnCapture());
    document.getElementById('browCloserBtn')?.addEventListener('click', () => this.adjustBrowSpread(-6));
    document.getElementById('browWiderBtn')?.addEventListener('click', () => this.adjustBrowSpread(6));
    document.getElementById('browResetBtn')?.addEventListener('click', () => {
      this.tryonState.browOffset = { x: 0, y: 0 };
      this.tryonState.browSpread = 0;
      this.renderTryOn();
    });
    this.bindBrowDrag();

    document.querySelectorAll('[data-brow-style]').forEach((button) => {
      button.addEventListener('click', () => {
        this.tryonState.browStyle = button.getAttribute('data-brow-style') || 'soft';
        this.renderTryOn();
      });
    });

    document.querySelectorAll('[data-nail-color]').forEach((button) => {
      button.addEventListener('click', () => {
        this.tryonState.nailColor = button.getAttribute('data-nail-color') || 'var(--nail-berry)';
        this.renderTryOn();
      });
    });

    document.querySelectorAll('[data-nail-length]').forEach((button) => {
      button.addEventListener('click', () => {
        this.tryonState.nailLength = button.getAttribute('data-nail-length') || 'short';
        this.renderTryOn();
      });
    });

    document.querySelectorAll('[data-product-tryon]').forEach((button) => {
      button.addEventListener('click', () => {
        this.tryonState.product = button.getAttribute('data-product-tryon') || 'spf';
        this.renderTryOn();
      });
    });
  },

  adjustBrowSpread(delta) {
    this.tryonState.browSpread = Math.max(-24, Math.min(34, this.tryonState.browSpread + delta));
    this.renderTryOn();
  },

  bindBrowDrag() {
    const overlay = document.getElementById('browOverlay');
    const stage = document.getElementById('tryonStage');
    if (!overlay || !stage) return;

    let drag = null;
    const startDrag = (event) => {
      if (this.tryonState.mode !== 'brows' || overlay.classList.contains('hidden')) return;
      event.preventDefault();
      overlay.setPointerCapture?.(event.pointerId);
      overlay.classList.add('is-dragging');
      drag = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: this.tryonState.browOffset.x,
        originY: this.tryonState.browOffset.y,
      };
    };
    const moveDrag = (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const rect = stage.getBoundingClientRect();
      const limitX = rect.width * 0.28;
      const limitY = rect.height * 0.22;
      this.tryonState.browOffset = {
        x: Math.max(-limitX, Math.min(limitX, drag.originX + event.clientX - drag.startX)),
        y: Math.max(-limitY, Math.min(limitY, drag.originY + event.clientY - drag.startY)),
      };
      this.renderTryOn();
    };
    const endDrag = (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      overlay.releasePointerCapture?.(event.pointerId);
      overlay.classList.remove('is-dragging');
      drag = null;
    };

    overlay.addEventListener('pointerdown', startDrag);
    overlay.addEventListener('pointermove', moveDrag);
    overlay.addEventListener('pointerup', endDrag);
    overlay.addEventListener('pointercancel', endDrag);
  },

  bindBookingFlow() {
    const detailCTA = document.getElementById('detailCTA');
    const form = document.getElementById('bookingForm');
    const dateInput = document.getElementById('bookingDate');
    const timeInput = document.getElementById('bookingTime');

    if (dateInput && !dateInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().slice(0, 10);
    }
    if (timeInput && !timeInput.value) timeInput.value = '10:30';

    detailCTA?.addEventListener('click', () => {
      this.syncBookingService();
      this.showPage('booking');
    });

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const booking = {
        id: Date.now().toString(36),
        service: this.currentService,
        serviceTitle: this.focusContent[this.currentService].detailTitle,
        name: document.getElementById('bookingName')?.value.trim() || 'Guest',
        date: document.getElementById('bookingDate')?.value || '',
        time: document.getElementById('bookingTime')?.value || '',
        notes: document.getElementById('bookingNotes')?.value.trim() || '',
      };

      const bookings = this.getStored(this.storageKeys.bookings);
      bookings.unshift(booking);
      this.setStored(this.storageKeys.bookings, bookings);
      form.reset();

      if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().slice(0, 10);
      }
      if (timeInput) timeInput.value = '10:30';

      this.renderBookings();
      this.pushAssistantMessage(`Booked ${booking.serviceTitle} for ${booking.name} on ${booking.date} at ${booking.time || 'your selected time'}.`);
      this.showPage('notes');
    });
  },

  bindFavorites() {
    const saveButton = document.getElementById('saveFavoriteCTA');
    saveButton?.addEventListener('click', () => {
      const content = this.focusContent[this.currentService];
      const favorites = this.getStored(this.storageKeys.favorites);
      const exists = favorites.some((item) => item.service === this.currentService);
      if (exists) {
        this.pushAssistantMessage(`${content.detailTitle} is already saved in your favorites.`);
        this.showPage('notes');
        return;
      }

      favorites.unshift({
        id: Date.now().toString(36),
        service: this.currentService,
        title: content.favoriteTitle,
        summary: content.favoriteSummary,
      });
      this.setStored(this.storageKeys.favorites, favorites);
      this.renderFavorites();
      this.pushAssistantMessage(`Saved ${content.detailTitle} to your favorites.`);
      this.showPage('notes');
    });
  },

  bindAgentOps() {
    document.getElementById('saveAgentConfigBtn')?.addEventListener('click', () => this.saveAgentConfig());
    document.getElementById('agentBookBtn')?.addEventListener('click', () => this.runAgentAction('booking'));
    document.getElementById('agentOrderBtn')?.addEventListener('click', () => this.runAgentAction('commerce'));
    document.getElementById('agentReelBtn')?.addEventListener('click', () => this.runAgentAction('reel'));
    document.getElementById('agentAutopilotBtn')?.addEventListener('click', async () => {
      await this.runAgentAction('booking');
      await this.runAgentAction('commerce');
      await this.runAgentAction('reel');
    });
    document.getElementById('whiteLabelLaunchBtn')?.addEventListener('click', () => this.launchWhiteLabelWorkspace());
    document.getElementById('whiteLabelPortraitInput')?.addEventListener('change', (event) => this.saveWhiteLabelPortrait(event));
    document.getElementById('unlockForecastsBtn')?.addEventListener('click', () => this.startSubscription('freemium_unlock'));
    document.getElementById('subscribeSalonBtn')?.addEventListener('click', () => this.startSubscription('salon_monthly'));
    document.getElementById('skinEvalInput')?.addEventListener('change', (event) => this.importSkinEvalFile(event));
    document.getElementById('seedEvalTemplateBtn')?.addEventListener('click', () => this.seedSkinEvalTemplate());
    document.getElementById('exportEvalTemplateBtn')?.addEventListener('click', () => this.exportSkinEvalTemplate());
    document.getElementById('runSkinEvalBtn')?.addEventListener('click', () => this.renderSkinEvalStats(this.scoreSkinEvalCases()));
  },

  saveAgentConfig() {
    const config = {
      calendarEndpoint: document.getElementById('calendarEndpoint')?.value.trim() || '',
      shopifyEndpoint: document.getElementById('shopifyEndpoint')?.value.trim() || '',
      reelEndpoint: document.getElementById('reelEndpoint')?.value.trim() || '',
      updatedAt: new Date().toISOString(),
    };
    this.setStored(this.storageKeys.agentConfig, config);
    this.logAgentAction('config', 'Integrations saved', config);
    this.pushAssistantMessage('Agent integrations saved. Actions will run in demo mode unless a production endpoint is configured.');
    this.renderAgentOps();
  },

  runAgentAction(type) {
    const latest = this.latestScan || this.getStored(this.storageKeys.scans)[0] || null;
    const config = this.getStored(this.storageKeys.agentConfig, {});
    const payload = this.buildAgentPayload(type, latest, config);
    const endpoint = type === 'booking' ? config.calendarEndpoint : type === 'commerce' ? config.shopifyEndpoint : config.reelEndpoint;
    const status = endpoint ? 'Ready for API handoff' : 'Demo executed';
    const label = type === 'booking'
      ? 'Appointment agent prepared esthetician booking'
      : type === 'commerce'
        ? 'Shopify agent built routine cart'
        : 'Reel agent generated TikTok-ready before/after plan';

    this.logAgentAction(type, label, { status, endpoint: endpoint || 'local-demo', payload });
    if (type === 'booking') this.materializeAgentBooking(payload);
    if (type === 'commerce') this.materializeShopifyCart(payload);
    if (type === 'reel') this.materializeReelPlan(payload);
    this.pushAssistantMessage(`${label}. ${endpoint ? 'Production endpoint is configured for handoff.' : 'Demo mode saved it locally.'}`);
    this.renderAgentOps();
  },

  buildAgentPayload(type, latest, config) {
    const service = latest?.serviceKey || this.currentService || 'skin';
    const content = this.focusContent[service] || this.focusContent.skin;
    const metrics = latest?.metrics || { hydration: '70%', clarity: '72%', texture: '74%', oil: '58%' };
    const routine = latest?.routine || { morning: 'Gentle cleanse, gel moisturizer, SPF', night: 'Cleanse, barrier support' };
    const base = {
      userId: 'local-demo-user',
      source: 'GlowAI agent cockpit',
      createdAt: new Date().toISOString(),
      scan: {
        title: latest?.title || 'No scan yet',
        summary: latest?.summary || 'Agent used default skin-prep profile.',
        metrics,
        routine,
        concerns: latest?.concerns?.slice?.(0, 5) || [],
        priorityAction: latest?.priorityAction || null,
        progress: latest?.progress || null,
      },
      climate: this.getStored(this.storageKeys.climate, { location: 'coastal climate', humidityMode: 'humid' }),
    };

    if (type === 'booking') {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      return {
        ...base,
        appointment: {
          service: content.detailTitle,
          date: date.toISOString().slice(0, 10),
          time: '10:30',
          staffPreference: 'First available esthetician',
          notes: `${base.scan.summary} Routine: AM ${routine.morning}; PM ${routine.night}`,
        },
      };
    }

    if (type === 'commerce') {
      return {
        ...base,
        shopify: {
          cartUrl: config.shopifyEndpoint || 'local-demo-cart',
          products: this.recommendProductsFromMetrics(metrics),
          discountCode: 'GLOWAI30',
          attribution: 'scan-to-cart-agent',
        },
      };
    }

    return {
      ...base,
      reel: {
        format: '9:16',
        durationSeconds: 18,
        hook: 'I let AI scan my skin and build my 30-day glow plan.',
        scenes: [
          'Before selfie with hydration and texture overlay',
          `Routine reveal: AM ${routine.morning}`,
          `Progress forecast: ${latest?.forecast?.[2]?.score || '86'}% glow score by day 30`,
          'After frame with studio CTA and product cart code GLOWAI30',
        ],
        captions: ['AI skin scan', 'coastal humidity routine', '30-day skin forecast', 'Build routine from scan'],
      },
    };
  },

  recommendProductsFromMetrics(metrics) {
    const hydration = Number.parseInt(String(metrics.hydration || '70'), 10);
    const texture = Number.parseInt(String(metrics.texture || '72'), 10);
    const oil = Number.parseInt(String(metrics.oil || '58'), 10);
    return [
      { handle: 'gentle-cleanser', title: 'Low-pH gentle cleanser', reason: 'Daily reset without stripping.' },
      { handle: hydration < 68 ? 'hyaluronic-serum' : 'antioxidant-serum', title: hydration < 68 ? 'Hyaluronic hydration serum' : 'Vitamin C antioxidant serum', reason: hydration < 68 ? 'Rebuilds water balance.' : 'Supports brightness and daytime defense.' },
      { handle: oil > 66 ? 'gel-moisturizer' : 'barrier-cream', title: oil > 66 ? 'Humidity-safe gel moisturizer' : 'Ceramide barrier cream', reason: oil > 66 ? 'Lightweight for humid shine control.' : 'Supports overnight recovery.' },
      { handle: 'water-resistant-spf', title: 'Water-resistant SPF 30+', reason: 'coastal sun and humidity baseline.' },
      ...(texture < 70 ? [{ handle: 'pha-exfoliant', title: 'PHA gentle exfoliant', reason: 'Texture support 1-2 nights weekly.' }] : []),
    ];
  },

  materializeAgentBooking(payload) {
    const bookings = this.getStored(this.storageKeys.bookings);
    bookings.unshift({
      id: `agent-${Date.now().toString(36)}`,
      service: payload.appointment.service,
      serviceTitle: payload.appointment.service,
      name: 'GlowAI client',
      date: payload.appointment.date,
      time: payload.appointment.time,
      notes: payload.appointment.notes,
      agentGenerated: true,
    });
    this.setStored(this.storageKeys.bookings, bookings.slice(0, 12));
    this.renderBookings();
  },

  materializeShopifyCart(payload) {
    const favorites = this.getStored(this.storageKeys.favorites);
    favorites.unshift({
      id: `cart-${Date.now().toString(36)}`,
      service: 'skin',
      title: 'Agent-built Shopify routine cart',
      summary: payload.shopify.products.map((item) => item.title).join(', '),
    });
    this.setStored(this.storageKeys.favorites, favorites.slice(0, 12));
    this.renderFavorites();
  },

  materializeReelPlan(payload) {
    const favorites = this.getStored(this.storageKeys.favorites);
    favorites.unshift({
      id: `reel-${Date.now().toString(36)}`,
      service: 'tryon',
      title: 'TikTok-ready before/after reel',
      summary: `${payload.reel.durationSeconds}s, ${payload.reel.format}: ${payload.reel.hook}`,
    });
    this.setStored(this.storageKeys.favorites, favorites.slice(0, 12));
    this.renderFavorites();
  },

  async saveWhiteLabelPortrait(event) {
    if (!this.isOwnerMode()) return;
    const file = event?.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.pushAssistantMessage('Use a PNG, JPG, or WebP image for the replaceable studio model photo.');
      return;
    }
    try {
      const portrait = await this.compressBrandImage(file);
      const workspace = {
        ...this.getStored(this.storageKeys.whiteLabel, {}),
        portrait,
        portraitName: file.name,
        updatedAt: new Date().toISOString(),
      };
      this.setStored(this.storageKeys.whiteLabel, workspace);
      this.applyWhiteLabelWorkspace(workspace);
      this.pushAssistantMessage('Client model photo replaced. This demo now uses the shop image locally on this device.');
    } catch (error) {
      this.pushAssistantMessage(`Could not save that image: ${error?.message || 'try a smaller photo.'}`);
    }
  },

  compressBrandImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('image could not be read'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('image could not be loaded'));
        image.onload = () => {
          const maxSide = 900;
          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { alpha: false });
          ctx.fillStyle = '#fbf7f1';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  },

  applyWhiteLabelWorkspace(workspace = this.getStored(this.storageKeys.whiteLabel, {})) {
    const studio = workspace.studio || 'GlowAI';
    const headline = workspace.headline || (workspace.studio ? `${workspace.studio}, guided.` : 'Skin clarity, guided.');
    const brandName = document.getElementById('appBrandName');
    const brandHeadline = document.getElementById('appBrandHeadline');
    const portrait = document.getElementById('whiteLabelPortrait');
    const theme = this.whiteLabelThemes[workspace.accent || 'blush'] || this.whiteLabelThemes.blush;

    if (brandName) brandName.textContent = studio;
    if (brandHeadline) brandHeadline.textContent = headline;
    if (portrait) {
      portrait.src = workspace.portrait || this.defaultPortrait;
      portrait.alt = `${studio} replaceable model portrait`;
    }

    document.body.classList.toggle('is-white-labeled', Boolean(workspace.studio || workspace.portrait));
    document.documentElement.style.setProperty('--color-accent', theme.accent);
    document.documentElement.style.setProperty('--color-accent-deep', theme.accentDeep);
    document.documentElement.style.setProperty('--gradient-primary', theme.primary);
    document.documentElement.style.setProperty('--gradient-hero', theme.hero);
    document.documentElement.style.setProperty('--gradient-pill-active', theme.pill);
  },

  salonPlanFallback(plan) {
    return plan === 'starter'
      ? { monthlyPrice: 299, features: ['Branded scan app', 'Agent booking leads', 'Basic Shopify cart'] }
      : plan === 'growth'
        ? { monthlyPrice: 799, features: ['White-label app', 'Calendar + Shopify agents', 'Reel generator', 'Lead analytics'] }
        : { monthlyPrice: 'custom', features: ['Custom domain', 'Multi-location routing', 'POS/CRM integration', 'Dedicated model tuning'] };
  },

  async fetchApi(path, options = {}) {
    const apiBase = window.GLOWAI_API_BASE;
    const apiToken = localStorage.getItem('glowai_api_token') || '';
    if (!apiBase || !apiToken) return null;
    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) throw new Error(await res.text() || `${path} failed`);
    return res.json();
  },

  async loadSalonWorkspaceFromBackend() {
    if (!this.isOwnerMode()) return;
    try {
      const remote = await this.fetchApi('/api/salon-workspace?user_id=local-demo-user');
      if (!remote) return;
      const workspace = {
        ...this.getStored(this.storageKeys.whiteLabel, {}),
        studio: remote.studio,
        headline: remote.headline,
        accent: remote.accent,
        plan: remote.plan,
        monthlyPrice: remote.monthly_price || 'custom',
        features: remote.features,
      };
      this.setStored(this.storageKeys.whiteLabel, workspace);
      this.applyWhiteLabelWorkspace(workspace);
      this.renderAgentOps();
    } catch {
      // No saved workspace on the backend yet, or backend unreachable; keep local state.
    }
  },

  async launchWhiteLabelWorkspace() {
    if (!this.isOwnerMode()) {
      this.pushAssistantMessage('Owner customization is available in the Version 2 owner link. The customer demo stays polished and locked.');
      return;
    }
    const studio = document.getElementById('whiteLabelStudio')?.value.trim() || 'Pearl City Glow Studio';
    const headline = document.getElementById('whiteLabelHeadline')?.value.trim() || `${studio}, guided.`;
    const accent = document.getElementById('whiteLabelAccent')?.value || 'blush';
    const plan = document.getElementById('whiteLabelPlan')?.value || 'starter';
    const existing = this.getStored(this.storageKeys.whiteLabel, {});
    let workspace = {
      ...existing,
      studio,
      headline,
      accent,
      plan,
      ...this.salonPlanFallback(plan),
      launchedAt: new Date().toISOString(),
    };

    try {
      const remote = await this.fetchApi('/api/salon-workspace', {
        method: 'PUT',
        body: JSON.stringify({ user_id: 'local-demo-user', studio, headline, accent, plan }),
      });
      if (remote) {
        workspace = {
          ...workspace,
          studio: remote.studio,
          headline: remote.headline,
          accent: remote.accent,
          plan: remote.plan,
          monthlyPrice: remote.monthly_price || 'custom',
          features: remote.features,
        };
      }
    } catch (error) {
      this.logAgentAction('white-label', 'Studio workspace saved locally (backend unavailable)', { error: error.message });
    }

    this.setStored(this.storageKeys.whiteLabel, workspace);
    this.applyWhiteLabelWorkspace(workspace);
    this.logAgentAction('white-label', `Studio workspace launched for ${studio}`, workspace);
    this.pushAssistantMessage(`${studio} white-label workspace launched on the ${plan} plan. The app now shows replaceable client branding, colors, services, and model imagery for the sales demo.`);
    this.renderAgentOps();
  },

  async startSubscription(plan) {
    const label = plan === 'salon_monthly' ? 'Salon subscription' : 'Forecast and reel unlock';
    const hasBackend = Boolean(window.GLOWAI_API_BASE);

    if (!hasBackend) {
      const demoUnlock = {
        plan,
        label,
        status: 'demo_active',
        checkoutMode: 'local-demo',
        activatedAt: new Date().toISOString(),
        benefits: plan === 'salon_monthly'
          ? ['Salon workspace demo enabled', 'Lead capture workflow active', 'Booking/cart/reel agent logs unlocked']
          : ['Forecast demo unlocked', 'Reel plan generator active', 'Scan-to-cart recommendations active'],
      };
      this.setStored(this.storageKeys.subscription, demoUnlock);
      this.logAgentAction('subscription', `${label} demo activated`, demoUnlock);
      this.pushAssistantMessage(`${label} demo activated. In production this button opens Stripe Checkout; for this customer demo the paid workflow is now unlocked locally.`);
      this.renderAgentOps();
      return;
    }

    try {
      this.pushAssistantMessage(`Opening Stripe Checkout for ${label.toLowerCase()}.`);
      await window.GlowAIPayments?.subscribe?.({ plan });
    } catch (error) {
      this.setStored(this.storageKeys.subscription, {
        plan,
        status: 'checkout_unavailable',
        error: error.message,
        updatedAt: new Date().toISOString(),
      });
      this.logAgentAction('subscription', `${label} checkout unavailable`, { plan, error: error.message });
      this.pushAssistantMessage(`${label} checkout could not open, so I activated demo access locally and logged the handoff for follow-up.`);
      this.renderAgentOps();
    }
  },

  logAgentAction(type, title, detail) {
    const log = this.getStored(this.storageKeys.agentLog);
    log.unshift({
      id: `${type}-${Date.now().toString(36)}`,
      type,
      title,
      detail,
      createdAt: new Date().toISOString(),
    });
    this.setStored(this.storageKeys.agentLog, log.slice(0, 20));
  },

  renderAgentOps() {
    const config = this.getStored(this.storageKeys.agentConfig, {});
    const whiteLabel = this.getStored(this.storageKeys.whiteLabel, {});
    const calendar = document.getElementById('calendarEndpoint');
    const shopify = document.getElementById('shopifyEndpoint');
    const reel = document.getElementById('reelEndpoint');
    const studio = document.getElementById('whiteLabelStudio');
    const headline = document.getElementById('whiteLabelHeadline');
    const accent = document.getElementById('whiteLabelAccent');
    const plan = document.getElementById('whiteLabelPlan');
    if (calendar && config.calendarEndpoint) calendar.value = config.calendarEndpoint;
    if (shopify && config.shopifyEndpoint) shopify.value = config.shopifyEndpoint;
    if (reel && config.reelEndpoint) reel.value = config.reelEndpoint;
    if (studio && whiteLabel.studio) studio.value = whiteLabel.studio;
    if (headline && whiteLabel.headline) headline.value = whiteLabel.headline;
    if (accent && whiteLabel.accent) accent.value = whiteLabel.accent;
    if (plan && whiteLabel.plan) plan.value = whiteLabel.plan;
    if (this.isOwnerMode()) this.applyWhiteLabelWorkspace(whiteLabel);
    this.renderOwnerDashboard();
    this.renderSkinEvalStats(this.scoreSkinEvalCases());

    const container = document.getElementById('agentLogList');
    if (!container) return;
    const log = this.getStored(this.storageKeys.agentLog);
    if (!log.length) {
      container.innerHTML = '<article class="agent-log-item"><p class="card-label">No actions yet</p><h3>Run an agent to create booking, commerce, reel, or white-label output.</h3><p>Every action writes a payload that can be sent to your production APIs.</p></article>';
      return;
    }
    container.innerHTML = log.slice(0, 8).map((item) => `
      <article class="agent-log-item">
        <p class="card-label">${this.escapeHtml(item.type || 'agent')}</p>
        <h3>${this.escapeHtml(item.title || 'Agent action')}</h3>
        <p>${this.escapeHtml(new Date(item.createdAt || Date.now()).toLocaleString())}</p>
        <pre>${this.escapeHtml(JSON.stringify(item.detail || {}, null, 2))}</pre>
      </article>
    `).join('');
  },

  // #ASSUMPTION: API key stored in localStorage under 'glowai_apikey'
  getApiKey() {
    return localStorage.getItem('glowai_apikey') || '';
  },

  bindChat() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const keyBar = document.getElementById('coachKeyBar');
    const keySaveBtn = document.getElementById('coachApiKeySave');
    const keyInput = document.getElementById('coachApiKeyInput');

    if (keyBar) keyBar.classList.add('hidden');

    keySaveBtn?.addEventListener('click', () => {
      const k = keyInput?.value.trim();
      if (!k.startsWith('sk-ant-')) {
        this.pushAssistantMessage('That does not look like a Claude key. Demo coach still works locally; paste a key starting with sk-ant- only when you want live Claude responses.');
        return;
      }
      localStorage.setItem('glowai_apikey', k);
      if (keyBar) keyBar.classList.add('hidden');
      this.pushAssistantMessage("Key saved! I'm your GlowAI beauty coach. Tell me about your skin — type, concerns, goals — and I'll build a real plan for you.");
    });

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = input?.value.trim();
      if (!message) return;
      if (this.handleLocalHabitIntent(message)) {
        input.value = '';
        return;
      }
      const apiKey = this.getApiKey();
      if (!apiKey) {
        this.pushUserMessage(message);
        input.value = '';
        const reply = this.generateLocalCoachReply(message);
        this.pushAssistantMessage(reply);
        this.speak(reply);
        return;
      }
      this.pushUserMessage(message);
      input.value = '';
      await this.callBeautyCoach(apiKey);
    });
  },

  handleLocalHabitIntent(message) {
    const text = message.toLowerCase();
    const habits = this.getStored(this.storageKeys.habits, {});
    const stopMatch = /(stop|cancel|turn off|don't ask|do not ask).*(remind|reminder|ask)/.test(text);
    const reminderMatch = /(remind me|reminder|check in|check-in)/.test(text);
    const habitMatch = /(wash my face|face wash|drink water|work out|exercise|backup|back up|charge|routine|skin routine)/.test(text);
    const doneCheck = /(did i|did you|have i).*(wash|drink|work out|exercise|backup|back up|charge|routine)/.test(text);

    if (stopMatch) {
      this.pushUserMessage(message);
      this.setStored(this.storageKeys.habits, { ...habits, muted: true, mutedAt: new Date().toISOString() });
      this.pushAssistantMessage('OK, I’ve turned that reminder off.');
      return true;
    }

    if (doneCheck) {
      this.pushUserMessage(message);
      const lastHabit = habits.lastHabit || 'that habit';
      this.pushAssistantMessage(`Last time you wanted help with ${lastHabit}. Did you manage to do it?`);
      return true;
    }

    if (reminderMatch && !habitMatch) {
      this.pushUserMessage(message);
      this.pushAssistantMessage('What should I remind you about?');
      return true;
    }

    if (habitMatch || reminderMatch) {
      this.pushUserMessage(message);
      const habit = this.extractHabitName(text);
      const suggestedTime = text.includes('tonight') || text.includes('bed') ? 'tonight' : text.includes('tomorrow') ? 'tomorrow morning' : 'in 30 minutes';
      this.setStored(this.storageKeys.habits, {
        ...habits,
        lastHabit: habit,
        suggestedTime,
        updatedAt: new Date().toISOString(),
      });
      this.pushAssistantMessage(`Want me to remind you ${suggestedTime}? I can also check in after.`);
      return true;
    }

    return false;
  },

  extractHabitName(text) {
    if (text.includes('wash') || text.includes('face')) return 'washing your face';
    if (text.includes('water')) return 'drinking water';
    if (text.includes('work out') || text.includes('exercise')) return 'working out';
    if (text.includes('backup') || text.includes('back up')) return 'backing things up';
    if (text.includes('charge')) return 'charging your device';
    if (text.includes('routine')) return 'your routine';
    return 'that habit';
  },

  generateLocalCoachReply(message) {
    const text = message.toLowerCase();
    const latest = this.latestScan || this.getStored(this.storageKeys.scans)[0] || null;
    const climate = this.getStored(this.storageKeys.climate, { location: 'coastal climate', humidityMode: 'humid' });
    const routine = latest?.routine || {
      morning: 'Gentle cleanse, hydration serum, moisturizer, SPF 50',
      night: 'Cleanse, barrier cream, and no harsh scrubs tonight',
    };
    const metrics = latest?.metrics || { hydration: '70%', clarity: '72%', texture: '74%', oil: '58%' };

    if (/(scan|camera|analyz)/.test(text)) {
      return 'I can start a face scan from the Scan tab. Use soft front light, keep your face centered, and I will turn the photo into hydration, clarity, texture, oil, tone, AM/PM routine steps, and ingredient direction.';
    }

    if (/(acne|breakout|pimple|red|irritat)/.test(text)) {
      return `For a cosmetic breakout-safe routine: AM ${routine.morning}. PM ${routine.night}. Keep actives simple for 48 hours, avoid picking, and refer painful, spreading, or unusual symptoms to a licensed professional. Current scan context: hydration ${metrics.hydration}, clarity ${metrics.clarity}.`;
    }

    if (/(dry|dehydrat|barrier|flak)/.test(text)) {
      return `Your best next move is barrier support. AM: gentle cleanse, hydrating serum, moisturizer, SPF. PM: cleanse, ceramide cream, skip exfoliation. In ${climate.location}, reapply SPF and keep the routine light enough for humidity.`;
    }

    if (/(oil|shine|humid|hawaii|sweat)/.test(text)) {
      return 'For Hawaii humidity: use a gel moisturizer, water-resistant SPF, blot instead of over-cleansing, and keep exfoliation to 1-2 nights weekly. If shine is high, use niacinamide before moisturizer rather than drying the skin out.';
    }

    if (/(product|buy|cart|shop|spf|serum|moisturizer)/.test(text)) {
      const products = this.recommendProductsFromMetrics(metrics).map((item) => item.title).join(', ');
      return `Based on the current GlowAI profile, I would build the cart with: ${products}. Start with cleanser, moisturizer, and SPF before adding extra actives.`;
    }

    if (/(book|appointment|esthetician|facial|brow)/.test(text)) {
      return 'I can prepare a local booking from the Booking tab or the Agents tab. The demo stores the appointment on this device and logs the payload a real calendar webhook would receive.';
    }

    return `Here is the practical GlowAI plan: AM ${routine.morning}. PM ${routine.night}. Keep it cosmetic, simple, and consistent for 7 days, then scan again to compare hydration, clarity, texture, and tone.`;
  },

  bindVoiceCoach() {
    const start = document.getElementById('voiceCoachStart');
    const stop = document.getElementById('voiceCoachStop');
    start?.addEventListener('click', () => this.startVoiceCoach());
    stop?.addEventListener('click', () => this.stopVoiceCoach());
  },

  startVoiceCoach() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const status = document.getElementById('voiceCoachStatus');
    const start = document.getElementById('voiceCoachStart');
    const stop = document.getElementById('voiceCoachStop');
    if (!SpeechRecognition) {
      const reply = 'Voice recognition is not available in this WebView, so I opened typed Coach instead. The same scan, routine, booking, and agent actions work from chat.';
      if (status) status.textContent = 'Typed coach ready.';
      this.pushAssistantMessage(reply);
      this.showPage('concierge');
      document.getElementById('chatInput')?.focus();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    this.voiceCoach = { recognition, active: true, speakReplies: true };
    start?.classList.add('hidden');
    stop?.classList.remove('hidden');
    if (status) status.textContent = 'Listening...';
    this.greetUserOnce({ forceSpeech: true });

    recognition.onresult = async (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      if (!text) return;
      if (status) status.textContent = `Heard: ${text}`;
      await this.handleVoiceCommand(text);
    };
    recognition.onerror = () => {
      if (status) status.textContent = 'Voice input stopped. Tap Voice coach to try again.';
      this.stopVoiceCoach(false);
    };
    recognition.onend = () => {
      if (this.voiceCoach.active) {
        start?.classList.remove('hidden');
        stop?.classList.add('hidden');
        this.voiceCoach.active = false;
      }
    };
    recognition.start();
  },

  stopVoiceCoach(cancelSpeech = true) {
    const status = document.getElementById('voiceCoachStatus');
    const start = document.getElementById('voiceCoachStart');
    const stop = document.getElementById('voiceCoachStop');
    this.voiceCoach.active = false;
    try { this.voiceCoach.recognition?.stop?.(); } catch {}
    if (cancelSpeech) window.speechSynthesis?.cancel?.();
    start?.classList.remove('hidden');
    stop?.classList.add('hidden');
    if (status) status.textContent = 'Voice coach ready.';
  },

  async handleVoiceCommand(text) {
    const normalized = text.toLowerCase();
    const wantsScan = normalized.includes('scan') && (normalized.includes('skin') || normalized.includes('face'));
    const wantsHumidity = normalized.includes('hawaii') || normalized.includes('humidity') || normalized.includes('humid');
    const wantsAgent = normalized.includes('book') || normalized.includes('order') || normalized.includes('shopify') || normalized.includes('reel') || normalized.includes('tiktok') || normalized.includes('autopilot');

    if (wantsHumidity) {
      this.setStored(this.storageKeys.climate, {
        location: 'coastal climate',
        humidityMode: 'humid',
        updatedAt: new Date().toISOString(),
      });
    }

    if (wantsScan) {
      this.pushUserMessage(text);
      this.pushAssistantMessage('Starting a live skin scan now. Keep your face centered and I will adjust the routine for coastal humidity.');
      this.speak('Starting a live skin scan now. Keep your face centered.');
      this.showPage('scan');
      await this.startLiveSkinScan();
      return;
    }

    if (this.handleLocalHabitIntent(text)) {
      const messages = this.getStored(this.storageKeys.chat);
      const latest = messages[messages.length - 1]?.text || 'OK, I’ll help you stay on track.';
      this.speak(latest);
      return;
    }

    if (wantsAgent) {
      this.pushUserMessage(text);
      this.showPage('agents');
      if (normalized.includes('autopilot')) {
        await this.runAgentAction('booking');
        await this.runAgentAction('commerce');
        await this.runAgentAction('reel');
        this.speak('Autopilot prepared booking, product cart, and reel plan.');
        return;
      }
      if (normalized.includes('book')) await this.runAgentAction('booking');
      if (normalized.includes('order') || normalized.includes('shopify')) await this.runAgentAction('commerce');
      if (normalized.includes('reel') || normalized.includes('tiktok')) await this.runAgentAction('reel');
      this.speak('Agent action prepared. Review the agent log.');
      return;
    }

    const apiKey = this.getApiKey();
    this.pushUserMessage(text);
    if (!apiKey) {
      const reply = this.generateLocalCoachReply(text);
      this.pushAssistantMessage(reply);
      this.speak(reply);
      return;
    }
    await this.callBeautyCoach(apiKey);
  },

  speak(text, { force = false } = {}) {
    if ((!force && !this.voiceCoach.speakReplies) || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\s+/g, ' ').slice(0, 260));
    const voices = window.speechSynthesis.getVoices?.() || [];
    const calmVoice = voices.find((voice) => /hawai|hawaiian/i.test(`${voice.name} ${voice.lang}`))
      || voices.find((voice) => /samantha|ava|allison|google us english|english united states/i.test(`${voice.name} ${voice.lang}`));
    if (calmVoice) utterance.voice = calmVoice;
    utterance.lang = calmVoice?.lang || 'en-US';
    utterance.rate = 0.88;
    utterance.pitch = 0.96;
    utterance.volume = 0.92;
    window.speechSynthesis.speak(utterance);
  },

  greetUserOnce({ forceSpeech = false } = {}) {
    const greeting = 'Welcome to GlowAI. Scan your face to get instant skincare insights, AM/PM routine direction, and product suggestions that keep your barrier, hydration, and SPF rhythm clear.';
    const alreadySpoken = localStorage.getItem(this.storageKeys.greeting) === 'true';
    if (!alreadySpoken) {
      const messages = this.getStored(this.storageKeys.chat);
      const hasGreeting = messages.some((message) => message.role === 'assistant' && message.text === greeting);
      if (!hasGreeting) this.pushAssistantMessage(greeting);
      localStorage.setItem(this.storageKeys.greeting, 'true');
    }
    if (forceSpeech || this.voiceCoach.speakReplies) this.speak(greeting, { force: forceSpeech });
  },

  async callBeautyCoach(apiKey) {
    const typingEl = document.getElementById('chatTyping');
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatInput');

    if (typingEl) typingEl.classList.remove('hidden');
    if (sendBtn) sendBtn.disabled = true;
    if (input) input.disabled = true;

    // Build Claude messages array from stored history (last 20 turns to keep context tight)
    const stored = this.getStored(this.storageKeys.chat, []);
    const allMessages = stored.slice(-20)
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));
    // Claude API requires messages to start with 'user' role
    const firstUserIdx = allMessages.findIndex(m => m.role === 'user');
    const apiMessages = firstUserIdx >= 0 ? allMessages.slice(firstUserIdx) : allMessages;

    const climate = this.getStored(this.storageKeys.climate, { location: 'coastal climate', humidityMode: 'humid' });
    const latestScan = this.latestScan || this.getStored(this.storageKeys.scans)[0] || null;
    const habits = this.getStored(this.storageKeys.habits, {});
    const systemPrompt = this.getGlowAISystemPrompt(`Current context:
- User location/climate: ${climate.location}, humidity mode ${climate.humidityMode}
- Latest scan summary: ${latestScan ? `${latestScan.title}; metrics ${JSON.stringify(latestScan.metrics || {})}; routine ${JSON.stringify(latestScan.routine || {})}` : 'No scan yet'}
- Soft habit memory: ${JSON.stringify(habits || {})}

Skin support:
- You can still answer skincare, product, routine, scan, brow, nail, finish, and booking questions.
- Keep skincare advice cosmetic and educational. Do not diagnose medical conditions or recommend prescription treatment.
- When the user asks about a routine, turn it into a small next action or reminder option.`);

    try {
      const res = await window.ClaudeAPI.call(apiKey, {
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages: apiMessages,
      });
      const reply = res.content?.[0]?.text || 'Something went wrong — try again.';
      this.pushAssistantMessage(reply);
      this.speak(reply);
      return reply;
    } catch (err) {
      const lastUserText = apiMessages.slice().reverse().find((m) => m.role === 'user')?.content || 'routine';
      const fallback = this.generateLocalCoachReply(lastUserText);
      const msg = err.status === 401
        ? `That live Claude key did not authenticate. Demo coach answer: ${fallback}`
        : `Live coach was unavailable, so I used the local GlowAI coach. ${fallback}`;
      this.pushAssistantMessage(msg);
      this.speak(msg);
      return msg;
    } finally {
      if (typingEl) typingEl.classList.add('hidden');
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.disabled = false;
    }
  },

  bindScan() {
    document.getElementById('homeStartScan')?.addEventListener('click', () => {
      this.speak('Welcome to GlowAI. Scan your face to get instant skincare insights, AM/PM routine direction, and product suggestions that keep your barrier, hydration, and SPF rhythm clear.', { force: true });
      this.beginScanFlow();
    });

    document.getElementById('scanLaunch')?.addEventListener('click', () => {
      this.beginScanFlow();
    });
    document.getElementById('scanFaceNowBtn')?.addEventListener('click', () => {
      this.scanUX.lastAutoLaunchAt = Date.now(); // prevent double-launch from showPage auto-launch
      this.showPage('scan');
      const directScan = window.scanModule?.startFallbackPhotoScan;
      if (typeof directScan === 'function') {
        directScan();
        return;
      }
      this.beginScanFlow();
    });

    document.getElementById('loadBenchmarkDemoBtn')?.addEventListener('click', () => {
      this.showPage('scan');
      this.runGuidedDemoScan('Benchmark demo selected by reviewer.');
    });

    document.getElementById('liveScanStart')?.addEventListener('click', () => this.startLiveSkinScan());
    document.getElementById('liveScanStop')?.addEventListener('click', () => {
      if (document.body.classList.contains('is-guided-scanning')) {
        this.cancelCameraScan();
        return;
      }
      this.finishLiveSkinScan();
    });
    document.getElementById('copyScanReportBtn')?.addEventListener('click', () => this.copyScanReport());
    document.getElementById('exportScanReportBtn')?.addEventListener('click', () => this.exportScanReportHtml());
    document.querySelectorAll('[data-adherence-action]').forEach((button) => {
      button.addEventListener('click', () => this.recordAdherenceAction(button.getAttribute('data-adherence-action')));
    });
  },

  beginScanFlow() {
    this.scanUX.lastAutoLaunchAt = Date.now(); // prevent double-launch from showPage auto-launch
    this.showPage('scan');
    this.setScanStatus('Opening camera', 'Launching the front camera now. Hold the phone steady and keep your face centered.');
    const startScan = window.scanModule?.startScan;
    if (typeof startScan !== 'function') {
      this.handleScanError('The camera module did not finish loading.');
      return;
    }
    startScan();
  },

  cancelCameraScan(message = 'Camera closed. Start again when you are ready.') {
    window.scanModule?.cancelActiveScan?.(message);
    this.liveScan.active = false;
    const startBtn = document.getElementById('liveScanStart');
    const captureBtn = document.getElementById('liveScanCapture');
    const stopBtn = document.getElementById('liveScanStop');
    startBtn?.classList.remove('hidden');
    captureBtn?.classList.add('hidden');
    stopBtn?.classList.add('hidden');
    if (stopBtn) stopBtn.textContent = 'Finish';
    document.body.classList.remove('is-guided-scanning');
    this.setScanStatus('Idle', message);
    this.showPage('scan', { replace: true, skipHistory: true, source: 'camera-cancel' });
  },

  async startLiveSkinScan() {
    const video = document.getElementById('liveScanVideo');
    const canvas = document.getElementById('liveScanCanvas');
    const startBtn = document.getElementById('liveScanStart');
    const captureBtn = document.getElementById('liveScanCapture');
    const stopBtn = document.getElementById('liveScanStop');
    if (!video || !canvas) return;

    this.liveScan = { active: true, samples: [], lastFrame: '', rejectedFrames: 0 };
    startBtn?.classList.add('hidden');
    captureBtn?.classList.add('hidden');
    stopBtn?.classList.remove('hidden');
    this.showPage('scan');
    this.setScanStatus('Live scanning', 'Keep your face in the oval while GlowAI samples texture, tone, oil, and humidity fit.');

    try {
      const startLiveSkinScan = window.scanModule?.startLiveSkinScan;
      if (typeof startLiveSkinScan !== 'function') {
        throw new Error('The live scan module did not finish loading.');
      }
      await startLiveSkinScan({
        video,
        canvas,
        onSample: (sample) => this.handleLiveScanSample(sample),
        onError: (error) => this.handleScanError(error.message || 'Live scan failed.'),
      });
    } catch (error) {
      startBtn?.classList.remove('hidden');
      stopBtn?.classList.add('hidden');
      this.liveScan.active = false;
      this.handleScanError(error.message || 'Live camera could not start.');
    }
  },

  handleLiveScanSample(sample) {
    if (!this.liveScan.active) return;

    if (!sample.faceQuality?.available) {
      if (this.captureGuidedLiveSample(sample, 'Face check loading', 'GlowAI is still loading the face check, so this frame will be kept as a guided fallback if needed.')) return;
      this.setScanStatus('Face check loading', 'GlowAI needs the face check before it can sample. Keep your face close inside the oval.');
      return;
    }

    if (!sample.faceQuality?.detected) {
      if (this.captureGuidedLiveSample(sample, 'Find face', 'GlowAI could not verify a face clearly, so this frame will be kept as a guided fallback if needed.')) return;
      this.setScanStatus('Find face', 'Center your face in the oval before GlowAI starts sampling.');
      return;
    }

    if (!sample.faceQuality?.closeEnough) {
      if (this.captureGuidedLiveSample(sample, 'Move closer', 'GlowAI kept this frame as a guided fallback. Move closer next time for stronger confidence.')) return;
      this.setScanStatus('Move closer', 'Bring your face closer until it fills the oval. GlowAI will start sampling when the picture is clear enough.');
      return;
    }

    if (!sample.faceQuality?.centered) {
      if (this.captureGuidedLiveSample(sample, 'Center face', 'GlowAI kept this frame as a guided fallback. Center your face next time for stronger confidence.')) return;
      this.setScanStatus('Center face', 'Keep your face centered inside the oval. GlowAI will start sampling when it is lined up.');
      return;
    }

    this.liveScan.rejectedFrames = 0;
    this.recordLiveScanSample(sample);
  },

  captureGuidedLiveSample(sample, title, message) {
    if (!sample?.dataUrl || !sample?.skinSignals) return false;
    this.liveScan.rejectedFrames = (this.liveScan.rejectedFrames || 0) + 1;
    if (this.liveScan.rejectedFrames < 3) return false;

    const guidedSample = {
      ...sample,
      faceQuality: {
        ...(sample.faceQuality || {}),
        confidence: sample.faceQuality?.confidence || 'Guided',
        safetyNote: 'Guided',
      },
    };
    this.recordLiveScanSample(guidedSample);
    if (!this.liveScan.active) return true;
    this.setScanStatus(title, message);
    return true;
  },

  recordLiveScanSample(sample) {
    this.liveScan.samples.push(sample);
    this.liveScan.lastFrame = sample.dataUrl;
    if (this.liveScan.samples.length > 12) this.liveScan.samples.shift();

    const signals = sample.skinSignals || {};
    const hydration = document.getElementById('liveHydration');
    const texture = document.getElementById('liveTexture');
    const humidity = document.getElementById('liveHumidity');
    if (hydration) hydration.textContent = `${signals.hydration || '-'}%`;
    if (texture) texture.textContent = `${signals.texture || '-'}%`;
    if (humidity) humidity.textContent = signals.humidityStress > 62 ? 'High' : signals.humidityStress > 44 ? 'Moderate' : 'Low';

    const faceCopy = sample.faceQuality?.available && sample.faceQuality?.confidence
      ? `Face ${sample.faceQuality.confidence}%.`
      : 'Guided signal read.';
    const segmentationCopy = signals.segmentation === 'selfie'
      ? ` Segmented skin mask ${signals.segmentationCoverage || '-'}%.`
      : '';
    this.setScanStatus('Live scanning', `${faceCopy}${segmentationCopy} Hydration ${signals.hydration}%, texture ${signals.texture}%, coastal humidity load ${signals.humidityStress}%.`);

    if (this.liveScan.samples.length >= 6) {
      const badge = document.getElementById('scanResultBadge');
      if (badge) badge.textContent = 'Live ready';
      this.finishLiveSkinScan();
    }
  },

  finishLiveSkinScan() {
    const startBtn = document.getElementById('liveScanStart');
    const captureBtn = document.getElementById('liveScanCapture');
    const stopBtn = document.getElementById('liveScanStop');
    window.scanModule?.stopCameraStream?.();
    document.body.classList.remove('is-guided-scanning');
    startBtn?.classList.remove('hidden');
    captureBtn?.classList.add('hidden');
    stopBtn?.classList.add('hidden');

    if (!this.liveScan.samples.length) {
      this.liveScan.active = false;
      this.setScanStatus('Idle', 'Live scan stopped before enough frames were sampled.');
      return;
    }

    const averaged = this.averageSkinSignals(this.liveScan.samples.map((sample) => sample.skinSignals));
    const faceSamples = this.liveScan.samples.map((sample) => sample.faceQuality).filter(Boolean);
    const faceQuality = faceSamples.find((sample) => sample.available && sample.detected) || faceSamples[0] || {};
    const frame = this.liveScan.lastFrame;
    this.liveScan.active = false;
    this.handleScanCapture(frame, faceQuality, averaged);
  },

  averageSkinSignals(samples) {
    const clean = samples.filter(Boolean);
    const keys = ['hydration', 'clarity', 'texture', 'tone', 'oil', 'redness', 'humidityStress'];
    return keys.reduce((acc, key) => {
      const values = clean.map((sample) => Number(sample[key])).filter(Number.isFinite);
      acc[key] = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
      return acc;
    }, {});
  },

  setMenuOpen(open) {
    const menu = document.getElementById('pageMenu');
    const trigger = document.getElementById('menuTrigger');
    const backdrop = document.getElementById('menuBackdrop');

    menu?.classList.toggle('hidden', !open);
    backdrop?.classList.toggle('hidden', !open);
    trigger?.setAttribute('aria-expanded', String(open));
  },

  showPage(pageId, options = {}) {
    if (!pageId) return;
    if (!this.pageLabels[pageId]) pageId = this.getInitialPage();
    const previousPage = this.currentPage;
    const changedPage = previousPage !== pageId;

    if (changedPage && !options.skipHistory && !options.replace && previousPage) {
      this.pageHistory.push(previousPage);
      this.pageHistory = this.pageHistory.slice(-20);
    }

    this.currentPage = pageId;
    if (this.topLevelPages.includes(pageId)) this.lastTopLevelPage = pageId;

    document.querySelectorAll('[data-page-panel]').forEach((panel) => {
      panel.classList.toggle('is-active', panel.getAttribute('data-page-panel') === pageId);
    });

    document.querySelectorAll('[data-page]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-page') === pageId);
    });

    document.querySelectorAll('.bottom-nav-item').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-page') === pageId);
    });

    const triggerLabel = document.getElementById('menuTriggerLabel');
    const activeButton = document.querySelector(`[data-page="${pageId}"]`);
    const pills = document.querySelectorAll('.page-pill');

    if (triggerLabel) {
      triggerLabel.textContent = activeButton?.textContent.trim() || this.pageLabels[pageId] || 'Home';
    }

    pills.forEach((pill) => {
      pill.classList.toggle('is-active', pill.getAttribute('data-nav-target') === pageId);
    });

    if (pageId === 'booking') this.syncBookingService();
    if (pageId === 'notes') this.renderFavorites();
    if (pageId === 'concierge') {
      this.renderChat();
      this.greetUserOnce();
    }
    if (pageId === 'agents') this.renderAgentOps();
    if (pageId === 'scan') {
      this.renderScanSummary();
      this.renderForecast();
      const now = Date.now();
      const recentlyAutoLaunched = now - (this.scanUX.lastAutoLaunchAt || 0) < 2200;
      const blockedSource = options.source === 'camera-cancel' || options.source === 'back-button' || options.source === 'init';
      if (changedPage && !blockedSource && !recentlyAutoLaunched && !document.body.classList.contains('is-guided-scanning')) {
        const directScan = window.scanModule?.startFallbackPhotoScan;
        if (typeof directScan === 'function') {
          this.scanUX.lastAutoLaunchAt = now;
          window.setTimeout(() => directScan(), 120);
        }
      }
    }

    this.updateBackButton();
    this.syncRouteState(pageId, options);

    if (changedPage || options.source === 'init') {
      window.scrollTo({ top: 0, behavior: options.source === 'browser' ? 'auto' : 'smooth' });
    }
  },

  syncRouteState(pageId, options = {}) {
    if (!window.history?.pushState) return;
    const url = new URL(window.location.href);
    url.hash = pageId;
    const state = { page: pageId };

    if (options.replace || options.source === 'browser') {
      window.history.replaceState(state, '', url);
      return;
    }

    window.history.pushState(state, '', url);
  },

  updateBackButton() {
    const button = document.getElementById('appBackButton');
    if (!button) return;
    const fallbackPage = this.getBackFallbackPage();
    const cameraActive = document.body.classList.contains('is-guided-scanning');
    const hasHistory = cameraActive || this.pageHistory.length > 0 || this.currentPage !== fallbackPage;
    button.classList.toggle('is-disabled', !hasHistory);
    button.disabled = !hasHistory;
    button.setAttribute('aria-label', cameraActive ? 'Exit camera' : hasHistory ? `Go back from ${this.pageLabels[this.currentPage] || 'current page'}` : 'Already at the start');
  },

  getBackFallbackPage() {
    if (this.isOwnerMode()) return 'agents';
    return this.shouldUseSelfieEntry() ? 'scan' : 'home';
  },

  goBack() {
    if (document.body.classList.contains('is-guided-scanning')) {
      this.cancelCameraScan('Camera closed from Back. Start again when you are ready.');
      return;
    }
    const fallbackPage = this.getBackFallbackPage();
    const destination = this.pageHistory.pop() || (this.currentPage === fallbackPage ? '' : fallbackPage);
    if (!destination) return;
    this.showPage(destination, { replace: true, skipHistory: true, source: 'back-button' });
  },

  renderFocus(key) {
    const content = this.focusContent[key];
    if (!content) return;
    this.currentService = key;

    document.querySelectorAll('[data-focus]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-focus') === key);
    });

    const label = document.getElementById('focus-label');
    const title = document.getElementById('focus-title');
    const description = document.getElementById('focus-description');
    const points = document.getElementById('focus-points');
    const heroTitle = document.getElementById('heroFocusTitle');
    const heroCopy = document.getElementById('heroFocusCopy');
    const previewLabel = document.getElementById('servicePreviewLabel');
    const previewTitle = document.getElementById('servicePreviewTitle');
    const previewBody = document.getElementById('servicePreviewBody');
    const previewTone = document.getElementById('servicePreviewTone');
    const previewCTA = document.getElementById('servicePreviewCTA');
    const tryOnCTA = document.getElementById('serviceTryOnCTA');
    const detailTitle = document.getElementById('detailTitle');
    const detailSubtitle = document.getElementById('detailSubtitle');
    const detailMoodLabel = document.getElementById('detailMoodLabel');
    const detailMoodTitle = document.getElementById('detailMoodTitle');
    const detailMoodBody = document.getElementById('detailMoodBody');
    const detailTags = document.getElementById('detailTags');
    const detailList = document.getElementById('detailList');
    const detailCTA = document.getElementById('detailCTA');

    if (label) label.textContent = content.label;
    if (title) title.textContent = content.title;
    if (description) description.textContent = content.description;
    if (heroTitle) heroTitle.textContent = content.heroTitle;
    if (heroCopy) heroCopy.textContent = content.heroCopy;
    if (previewLabel) previewLabel.textContent = content.previewLabel;
    if (previewTitle) previewTitle.textContent = content.previewTitle;
    if (previewBody) previewBody.textContent = content.previewBody;
    if (previewTone) previewTone.textContent = content.previewTone;
    if (previewCTA) {
      previewCTA.textContent = content.previewCTA;
      previewCTA.setAttribute('data-open-detail', key);
    }
    if (tryOnCTA) {
      const supportsSelfieTryOn = key === 'brows' || key === 'skin' || key === 'makeup';
      tryOnCTA.classList.toggle('hidden', !supportsSelfieTryOn);
      tryOnCTA.setAttribute('data-open-tryon', key);
      tryOnCTA.textContent = key === 'brows' ? 'Try on from selfie' : 'Product AR';
    }
    if (detailTitle) detailTitle.textContent = content.detailTitle;
    if (detailSubtitle) detailSubtitle.textContent = content.detailSubtitle;
    if (detailMoodLabel) detailMoodLabel.textContent = content.detailMoodLabel;
    if (detailMoodTitle) detailMoodTitle.textContent = content.detailMoodTitle;
    if (detailMoodBody) detailMoodBody.textContent = content.detailMoodBody;
    if (detailCTA) detailCTA.textContent = content.detailCTA;

    document.querySelectorAll('[data-service]').forEach((card) => {
      card.classList.toggle('is-selected', card.getAttribute('data-service') === key);
    });

    if (points) {
      points.innerHTML = '';
      content.points.forEach((point) => {
        const pill = document.createElement('span');
        pill.className = 'focus-pill';
        pill.textContent = point;
        points.appendChild(pill);
      });
    }

    if (detailTags) {
      detailTags.innerHTML = '';
      content.detailTags.forEach((tag) => {
        const item = document.createElement('span');
        item.className = 'detail-tag';
        item.textContent = tag;
        detailTags.appendChild(item);
      });
    }

    if (detailList) {
      detailList.innerHTML = '';
      content.detailList.forEach((itemText) => {
        const item = document.createElement('li');
        item.textContent = itemText;
        detailList.appendChild(item);
      });
    }

    this.syncBookingService();
    this.syncTryOnStudio(key);
  },

  syncTryOnStudio(key) {
    const studio = document.getElementById('tryonStudio');
    const label = document.getElementById('tryonLabel');
    const title = document.getElementById('tryonTitle');
    const placeholderTitle = document.getElementById('tryonPlaceholderTitle');
    const placeholderCopy = document.getElementById('tryonPlaceholderCopy');
    const captureBtn = document.getElementById('tryonCaptureBtn');
    const browControls = document.getElementById('browControls');
    const nailControls = document.getElementById('nailControls');
    const productControls = document.getElementById('productControls');
    const enabled = key === 'brows' || key === 'nails' || key === 'skin' || key === 'makeup';

    studio?.classList.toggle('hidden', !enabled);
    if (!enabled) return;

    const mode = (key === 'skin' || key === 'makeup') ? 'product' : key;
    this.tryonState.mode = mode;
    if (label) label.textContent = mode === 'brows' ? 'Eyebrow try-on' : mode === 'nails' ? 'Nail try-on' : 'Product AR try-on';
    if (title) title.textContent = mode === 'brows'
      ? 'Compare brow shapes on your face.'
      : mode === 'nails'
        ? 'Preview color and length on your hand.'
        : 'Visualize finish zones before adding a product.';
    if (placeholderTitle) placeholderTitle.textContent = mode === 'brows'
      ? 'Take a selfie for brow mapping.'
      : mode === 'nails'
        ? 'Take a hand photo for nail preview.'
        : 'Take a selfie for product visualization.';
    if (placeholderCopy) placeholderCopy.textContent = mode === 'brows'
      ? 'Center your face in even light. GlowAI places brows where they are easiest to compare.'
      : mode === 'nails'
        ? 'Place your hand flat in good light. GlowAI overlays the selected manicure set for quick comparison.'
        : 'GlowAI overlays SPF tint, brightening, or barrier support zones so the routine feels concrete.';
    if (captureBtn) {
      const photo = this.getTryOnPhoto(mode);
      captureBtn.textContent = photo ? 'Retake photo' : 'Use camera';
    }
    browControls?.classList.toggle('hidden', mode !== 'brows');
    nailControls?.classList.toggle('hidden', mode !== 'nails');
    productControls?.classList.toggle('hidden', mode !== 'product');
    this.renderTryOn();
  },

  async startTryOnCapture() {
    const mode = this.tryonState.mode;
    const facing = mode === 'nails' ? 'rear' : 'front';
    const button = document.getElementById('tryonCaptureBtn');
    const stage = document.getElementById('tryonStage');
    if (button) button.textContent = 'Opening...';
    stage?.classList.add('is-capturing');

    try {
      const capture = await window.scanModule?.captureStudioPhoto?.({ facing });
      if (!capture?.dataUrl) {
        this.tryonState.photos[mode] = this.createDemoTryOnImage(mode);
        this.renderTryOn();
        this.pushAssistantMessage('No camera photo came back, so I loaded a guided try-on image. The overlay controls still work for the customer demo.');
        return;
      }

      this.tryonState.photos[mode] = capture.dataUrl;
      this.renderTryOn();
      this.pushAssistantMessage(mode === 'nails'
        ? 'Hand photo captured. Pick a color or length to preview the nail overlay.'
        : 'Selfie captured. Pick a brow shape, then drag or widen the overlay until it lines up.');
    } catch (error) {
      this.tryonState.photos[mode] = this.createDemoTryOnImage(mode);
      this.renderTryOn();
      this.pushAssistantMessage('Camera was not available, so I loaded a guided try-on image. You can still show brow, nail, and product overlays in the customer demo.');
    } finally {
      stage?.classList.remove('is-capturing');
      if (button) button.textContent = mode === 'nails' ? 'Retake hand photo' : 'Retake photo';
    }
  },

  renderTryOn() {
    const mode = this.tryonState.mode;
    const stage = document.getElementById('tryonStage');
    const photo = document.getElementById('tryonPhoto');
    const placeholder = document.getElementById('tryonPlaceholder');
    const browOverlay = document.getElementById('browOverlay');
    const nailOverlay = document.getElementById('nailOverlay');
    const productOverlay = document.getElementById('productOverlay');

    stage?.setAttribute('data-tryon-mode', mode);
    stage?.setAttribute('data-brow-style', this.tryonState.browStyle);
    stage?.setAttribute('data-nail-length', this.tryonState.nailLength);
    stage?.setAttribute('data-product-tryon', this.tryonState.product);
    if (stage) {
      stage.style.setProperty('--nail-color', this.tryonState.nailColor);
      stage.style.setProperty('--brow-drag-x', `${this.tryonState.browOffset.x}px`);
      stage.style.setProperty('--brow-drag-y', `${this.tryonState.browOffset.y}px`);
      stage.style.setProperty('--brow-spread', `${this.tryonState.browSpread}px`);
    }

    const activePhoto = this.getTryOnPhoto(mode);
    const hasPhoto = Boolean(activePhoto);
    stage?.classList.toggle('has-photo', hasPhoto);
    if (photo) {
      photo.classList.toggle('hidden', !hasPhoto);
      if (hasPhoto && photo.src !== activePhoto) {
        photo.onload = () => stage?.classList.add('photo-ready');
        photo.onerror = () => {
          stage?.classList.remove('has-photo', 'photo-ready');
          this.pushAssistantMessage('The captured image could not be displayed. Retake the photo and try again.');
        };
        photo.src = activePhoto;
      }
    }
    placeholder?.classList.toggle('hidden', hasPhoto);
    browOverlay?.classList.toggle('hidden', !hasPhoto || mode !== 'brows');
    nailOverlay?.classList.toggle('hidden', !hasPhoto || mode !== 'nails');
    productOverlay?.classList.toggle('hidden', !hasPhoto || mode !== 'product');

    document.querySelectorAll('[data-brow-style]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-brow-style') === this.tryonState.browStyle);
    });
    document.querySelectorAll('[data-nail-color]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-nail-color') === this.tryonState.nailColor);
    });
    document.querySelectorAll('[data-nail-length]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-nail-length') === this.tryonState.nailLength);
    });
    document.querySelectorAll('[data-product-tryon]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-product-tryon') === this.tryonState.product);
    });
  },

  bindShare() {
    const button = document.getElementById('shareAppBtn');
    const status = document.getElementById('shareAppStatus');
    button?.addEventListener('click', async () => {
      const payload = {
        title: this.shareConfig.title,
        text: this.shareConfig.text,
        url: this.shareConfig.url,
      };
      const message = `${payload.text} ${payload.url}\nSingle-file HTML download: ${this.shareConfig.downloadUrl}`;

      try {
        if (navigator.share) {
          await navigator.share(payload);
          if (status) status.textContent = 'Ready to send.';
          return;
        }
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }

      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      window.location.href = smsUrl;
      if (status) status.textContent = 'Opening your text app.';

      window.setTimeout(async () => {
        try {
          await navigator.clipboard?.writeText(message);
          if (status) status.textContent = 'Invite copied. Paste it into any message.';
        } catch {
          if (status) status.textContent = message;
        }
      }, 900);
    });
  },

  showScanPreview(dataUrl) {
    const preview = document.getElementById('scanPreview');
    const previewImage = document.getElementById('scanPreviewImage');
    const overlayMap = document.getElementById('scanOverlayMap');
    const overlayLegend = document.getElementById('scanOverlayLegend');
    const badge = document.getElementById('scanResultBadge');
    if (!preview || !previewImage || !dataUrl) return;

    // Clear stale overlays from the previous scan while the new one is processing
    if (overlayMap) overlayMap.innerHTML = '';
    if (overlayLegend) overlayLegend.innerHTML = '';

    preview.classList.remove('hidden', 'is-error');
    preview.classList.add('is-loading');
    if (badge) badge.textContent = 'Captured';

    previewImage.onload = () => {
      preview.classList.remove('is-loading', 'is-error');
      preview.classList.add('has-image');
    };
    previewImage.onerror = () => {
      preview.classList.remove('is-loading');
      preview.classList.add('is-error');
      this.setScanStatus('Preview unavailable', 'The selfie was captured, but Android WebView could not display the preview. GlowAI will still return the scan result.');
    };
    previewImage.src = '';
    previewImage.src = dataUrl;
  },

  handleScanCapture(dataUrl, faceQuality = {}, skinSignals = null) {
    this.showScanPreview(dataUrl);
    const analysis = this.generateFaceAnalysis(faceQuality, skinSignals);
    const scans = this.getStored(this.storageKeys.scans);
    const progress = this.compareScanProgress(analysis, scans[0]);
    const scanRecord = {
      id: Date.now().toString(36),
      createdAt: new Date().toISOString(),
      photo: dataUrl,
      progress,
      ...analysis,
    };
    const historyEntry = {
      id: scanRecord.id,
      createdAt: scanRecord.createdAt,
      photo: scanRecord.photo,
      title: scanRecord.title,
      summary: scanRecord.summary,
      studioLane: scanRecord.studioLane,
      serviceKey: scanRecord.serviceKey,
      tags: scanRecord.tags,
      steps: scanRecord.steps,
      metrics: scanRecord.metrics,
      routine: scanRecord.routine,
      confidence: scanRecord.confidence,
      safetyNote: scanRecord.safetyNote,
      handoffs: scanRecord.handoffs,
      forecast: scanRecord.forecast,
      concerns: scanRecord.concerns,
      priorityAction: scanRecord.priorityAction,
      progress: scanRecord.progress,
      overlays: scanRecord.overlays,
    };
    scans.unshift(historyEntry);
    this.latestScan = scanRecord;
    this.trySetStored(this.storageKeys.scans, scans.slice(0, 6));
    this.renderFocus(analysis.serviceKey);
    this.showPage('scan');
    const confidenceCopy = faceQuality?.available && faceQuality?.confidence
      ? ` Face check ${faceQuality.confidence}%.`
      : '';
    this.setScanStatus('Skin read ready', `GlowAI found a ${analysis.title.toLowerCase()} pattern and mapped your AM/PM skincare steps.${confidenceCopy}`);
    this.renderScanSummary();
    this.renderScanHistory();
    this.renderForecast();
    this.pushAssistantMessage(`Skin scan complete. I’d focus on ${analysis.studioLane.toLowerCase()} based on hydration, texture, oil, tone, and clarity signals.`);
  },

  handleScanError(message) {
    const summary = document.getElementById('scanResultSummary');
    const title = document.getElementById('scanResultTitle');
    const badge = document.getElementById('scanResultBadge');
    const copy = `${message} I loaded a guided skincare scan so the routine, ingredient guidance, and progress forecast still work.`;
    if (title) title.textContent = 'Guided skincare scan loaded';
    if (summary) summary.textContent = copy;
    if (badge) badge.textContent = 'Demo';
    this.setScanStatus('Guided scan', copy);
    this.showPage('scan');
    window.setTimeout(() => this.runGuidedDemoScan(message), 400);
  },

  runGuidedDemoScan(reason = 'Camera was unavailable.') {
    const scan = this.createDemoScanRecord();
    scan.summary = `${scan.summary} Guided fallback reason: ${reason}`;
    const scans = this.getStored(this.storageKeys.scans);
    scans.unshift(scan);
    this.latestScan = scan;
    this.trySetStored(this.storageKeys.scans, scans.slice(0, 6));
    this.renderFocus(scan.serviceKey);
    this.renderScanSummary();
    this.renderScanHistory();
    this.renderForecast();
    this.setScanStatus('Benchmark demo loaded', 'Deterministic demo scan is ready with routine, forecast, overlays, and agent handoffs.');
    this.pushAssistantMessage('I loaded a guided skincare scan. You can still review skin signals, AM/PM routine steps, ingredient direction, and the 30-day skin forecast.');
  },

  generateFaceAnalysis(faceQuality = {}, skinSignals = null) {
    const profiles = [
      {
        title: 'Balanced skin with slight dehydration',
        summary: 'Your skin reads generally balanced, with mild dehydration around the cheeks and a clear need for steady barrier support.',
        tags: ['Hydration', 'Barrier', 'Balanced'],
        steps: ['Start with a humectant serum under moisturizer', 'Use SPF every morning and reapply during direct sun', 'Keep exfoliation low until hydration feels stable'],
        studioLane: 'hydration and barrier support',
        serviceKey: 'skin',
        metrics: { balance: '82%', hydration: '68%', clarity: '79%', texture: '76%', tone: '81%', oil: '72%' },
        routine: { morning: 'Gentle cleanse, hyaluronic serum, moisturizer, SPF 30+', night: 'Cleanse, ceramide cream, no exfoliation tonight' },
        confidence: '84%',
        safetyNote: 'Routine',
        priorityAction: {
          title: 'Rebuild hydration before adding actives',
          copy: 'Use humectant serum, moisturizer, and SPF for the next 48 hours before testing exfoliation or brightening steps.',
        },
        handoffs: ['Skin coach builds a barrier-support routine', 'Progress tracker saves this as the baseline', 'Forecast watches hydration and texture changes'],
      },
      {
        title: 'Brightness loss with texture focus',
        summary: 'GlowAI picked up mild texture and uneven brightness, so the routine should focus on calm brightening and low-irritation smoothing.',
        tags: ['Texture', 'Brightness', 'Calm care'],
        steps: ['Use niacinamide or azelaic acid on non-exfoliation nights', 'Add gentle chemical exfoliation only 1-2 nights weekly', 'Pair brightening with moisturizer so the barrier does not get stripped'],
        studioLane: 'texture and brightness care',
        serviceKey: 'skin',
        metrics: { balance: '74%', hydration: '63%', clarity: '66%', texture: '61%', tone: '65%', oil: '70%' },
        routine: { morning: 'Cleanse, niacinamide, moisturizer, SPF 50', night: 'Cleanse, barrier cream, pause harsh scrubs' },
        confidence: '76%',
        safetyNote: 'Calm care',
        priorityAction: {
          title: 'Calm texture without over-exfoliating',
          copy: 'Keep brightening low-irritation and limit resurfacing to 1-2 nights weekly while hydration catches up.',
        },
        handoffs: ['Skin coach avoids aggressive exfoliation', 'Progress tracker watches tone and texture', 'Forecast checks whether brightness improves without irritation'],
      },
      {
        title: 'Oil-shine pattern with stable clarity',
        summary: 'Your scan reads clear overall, with oil-shine showing up as the main skincare focus. The goal is lighter layers, not stripping.',
        tags: ['Oil balance', 'Clarity', 'Light layers'],
        steps: ['Use a gentle gel cleanser instead of harsh stripping cleansers', 'Choose gel moisturizer or light lotion in the morning', 'Use blotting or SPF reapplication rather than heavy powder layers'],
        studioLane: 'oil balance and light hydration',
        serviceKey: 'skin',
        metrics: { balance: '78%', hydration: '72%', clarity: '84%', texture: '80%', tone: '83%', oil: '86%' },
        routine: { morning: 'Gel cleanse, lightweight moisturizer, SPF 30+', night: 'Cleanse, niacinamide serum, light moisturizer' },
        confidence: '82%',
        safetyNote: 'Oil balance',
        priorityAction: {
          title: 'Control shine without stripping',
          copy: 'Switch to lighter AM layers and blot or reapply SPF at midday instead of drying the skin out.',
        },
        handoffs: ['Skin coach adjusts cleanser and moisturizer weight', 'Progress tracker monitors shine and hydration together', 'Forecast checks whether oil balance improves without dryness'],
      },
    ];

    const selected = { ...profiles[Math.floor(Math.random() * profiles.length)] };
    const qualityTags = [];

    if (skinSignals) {
      const climate = this.getStored(this.storageKeys.climate, { location: 'coastal climate', humidityMode: 'humid' });
      const hydration = skinSignals.hydration || 70;
      const clarity = skinSignals.clarity || 72;
      const texture = skinSignals.texture || 72;
      const tone = skinSignals.tone || 72;
      const oil = skinSignals.oil || 62;
      const balance = Math.round((hydration + clarity + texture + tone + (100 - Math.abs(oil - 58))) / 5);
      const humidityStress = skinSignals.humidityStress || Math.round((oil + (100 - hydration)) / 2);
      const humidAdjustment = humidityStress > 58
        ? 'Use lighter layers for coastal humidity: gel moisturizer, water-resistant SPF, and blotting instead of extra powder.'
        : 'Keep a flexible coastal routine: hydration first, SPF daily, and avoid heavy occlusive layers in midday heat.';

      selected.title = hydration < 64
        ? 'Live scan shows dehydration under humidity stress'
        : humidityStress > 62
          ? 'Live scan shows oil-shine risk in humid weather'
          : 'Live scan shows balanced skin with stable humidity fit';
      selected.summary = `Live camera signals read hydration ${hydration}%, texture ${texture}%, clarity ${clarity}%, and humidity load ${humidityStress}% for ${climate.location}.`;
      selected.tags = ['Live video scan', `Hydration ${hydration}%`, `Humidity ${humidityStress}%`];
      selected.metrics = {
        balance: `${balance}%`,
        hydration: `${hydration}%`,
        clarity: `${clarity}%`,
        texture: `${texture}%`,
        tone: `${tone}%`,
        oil: `${oil}%`,
      };
      selected.routine = this.generateRoutineFromSignals(skinSignals);
      selected.concerns = this.generateConcernReadout(skinSignals);
      selected.priorityAction = this.generatePriorityAction(selected.concerns, skinSignals);
      selected.steps = [
        humidAdjustment,
        hydration < 66 ? 'Add a humectant serum under moisturizer morning and night.' : 'Keep hydration steady and do not overload layers.',
        texture < 68 ? 'Use gentle chemical exfoliation only 1-2 nights weekly, never on irritated days.' : 'Maintain texture with a low-friction cleanse and consistent SPF.',
      ];
      selected.studioLane = hydration < 64
        ? 'hydration and barrier support'
        : humidityStress > 62
          ? 'oil balance and lighter AM layers'
          : 'maintenance skincare routine';
      selected.serviceKey = 'skin';
      selected.safetyNote = humidityStress > 65 ? 'Humidity adjust' : 'Routine';
      selected.forecast = this.generateGlowForecast(selected.metrics, skinSignals);
      selected.handoffs = [
        `coastal humidity load: ${humidityStress}%`,
        skinSignals.segmentation === 'selfie' ? `selfie segmentation coverage: ${skinSignals.segmentationCoverage || '-'}%` : 'full-frame scan fallback used',
        'Skin coach can adjust AM routine for sweat, SPF reapplication, and lighter layers',
        'Progress tracker projects 7, 14, and 30 day changes',
      ];
    }

    if (faceQuality.available && faceQuality.detected !== false) {
      qualityTags.push('Face detected');
      if (faceQuality.centered === false) qualityTags.push('Recenter next scan');
      if (faceQuality.closeEnough === false) qualityTags.push('Move closer');
      selected.confidence = Number.isFinite(Number(faceQuality.confidence)) ? `${faceQuality.confidence}%` : selected.confidence;
      selected.handoffs = [
        `Face detector confidence: ${selected.confidence}`,
        ...(selected.handoffs || []),
      ];
    } else if (faceQuality.available && faceQuality.detected === false) {
      qualityTags.push('Retake recommended');
      selected.confidence = 'Low';
      selected.handoffs = [
        'Face detector did not get a clean face lock; retake in brighter, even light',
        ...(selected.handoffs || []),
      ];
    } else {
      qualityTags.push('Guided scan');
      selected.handoffs = [
        'Face model was unavailable, so GlowAI used the local guided scan flow',
        ...(selected.handoffs || []),
      ];
    }

    selected.tags = [...qualityTags, ...selected.tags].slice(0, 5);
    selected.concerns = selected.concerns || this.generateConcernReadout(null, selected.metrics);
    selected.priorityAction = selected.priorityAction || this.generatePriorityAction(selected.concerns);
    selected.overlays = this.generateScanOverlays(selected.metrics, selected.concerns);
    selected.forecast = selected.forecast || this.generateGlowForecast(selected.metrics);
    return selected;
  },

  metricNumber(value, fallback = 70) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  },

  concernLevel(score) {
    if (score >= 72) return 'High';
    if (score >= 48) return 'Watch';
    return 'Low';
  },

  generateConcernReadout(signals = null, metrics = {}) {
    const hydration = this.metricNumber(signals?.hydration ?? metrics.hydration, 70);
    const clarity = this.metricNumber(signals?.clarity ?? metrics.clarity, 74);
    const texture = this.metricNumber(signals?.texture ?? metrics.texture, 74);
    const tone = this.metricNumber(signals?.tone ?? metrics.tone, 76);
    const oil = this.metricNumber(signals?.oil ?? metrics.oil, 62);
    const redness = this.metricNumber(signals?.redness ?? metrics.redness, 20);
    const humidityStress = this.metricNumber(signals?.humidityStress, Math.round((oil + (100 - hydration)) / 2));
    const lowHydration = 100 - hydration;
    const lowClarity = 100 - clarity;
    const unevenTexture = 100 - texture;
    const unevenTone = 100 - tone;
    const oilLoad = Math.max(0, oil - 48);
    const rednessLoad = redness;
    const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));
    const concern = (key, label, score, action) => ({
      key,
      label,
      score: clamp(score),
      level: this.concernLevel(clamp(score)),
      action,
    });

    return [
      concern('acne', 'Acne', (oilLoad * 0.65) + (lowClarity * 0.45) + (rednessLoad * 0.22), 'Keep the routine non-comedogenic and avoid picking or harsh scrubs.'),
      concern('redness', 'Redness', rednessLoad * 1.25, 'Use calming care and pause strong actives when the skin looks flushed.'),
      concern('dryness', 'Dryness', lowHydration * 1.1, 'Layer humectant serum under moisturizer and avoid stripping cleansers.'),
      concern('oiliness', 'Oiliness', oilLoad * 1.45 + humidityStress * 0.25, 'Use gel moisturizer, lightweight SPF, and midday blotting.'),
      concern('dark_spots', 'Dark spots', unevenTone * 0.92 + lowClarity * 0.3, 'Keep SPF consistent before adding brightening ingredients.'),
      concern('uneven_tone', 'Uneven tone', unevenTone * 1.05 + rednessLoad * 0.2, 'Pair daily SPF with low-irritation tone support.'),
      concern('texture', 'Texture', unevenTexture * 1.08 + lowHydration * 0.22, 'Use gentle resurfacing only when the barrier feels calm.'),
      concern('pores', 'Pores', oilLoad * 0.95 + unevenTexture * 0.42, 'Balance oil with niacinamide-style support and light hydration.'),
      concern('sensitivity', 'Sensitivity', rednessLoad * 0.95 + lowHydration * 0.35, 'Simplify to cleanser, moisturizer, and SPF until calm.'),
      concern('dullness', 'Dullness', lowClarity * 0.82 + lowHydration * 0.35, 'Prioritize hydration and sunscreen before stronger brightening.'),
      concern('fine_lines', 'Fine lines', lowHydration * 0.72 + unevenTexture * 0.28, 'Improve cushion with hydration, peptides, and steady SPF.'),
      concern('sun_damage', 'Sun damage', unevenTone * 0.68 + humidityStress * 0.18, 'Reapply SPF and use sun avoidance as the first step.'),
      concern('dehydration', 'Dehydration', lowHydration * 1.18 + humidityStress * 0.2, 'Add water-binding serum and seal it with a comfortable moisturizer.'),
      concern('barrier', 'Barrier support', lowHydration * 0.72 + rednessLoad * 0.55 + unevenTexture * 0.18, 'Reduce actives and rebuild with ceramide-style support.'),
      concern('ingrown_hairs', 'Ingrown hairs', unevenTexture * 0.62 + rednessLoad * 0.24, 'Use low-friction cleansing and gentle exfoliation only if skin is calm.'),
    ].sort((a, b) => b.score - a.score);
  },

  generatePriorityAction(concerns = [], signals = {}) {
    const top = concerns[0];
    if (!top) {
      return {
        title: 'Complete a fresh baseline',
        copy: 'Take a scan in even light so GlowAI can rank the most useful skincare move for today.',
      };
    }

    const humidityStress = this.metricNumber(signals?.humidityStress, 50);
    const humidCopy = humidityStress > 62 ? ' Keep AM layers light for humidity and reapply SPF instead of adding heavy products.' : '';
    return {
      title: `${top.label}: ${top.level.toLowerCase()} priority`,
      copy: `${top.action}${humidCopy}`,
    };
  },

  generateScanOverlays(metrics = {}, concerns = []) {
    const concernScore = (key) => concerns.find((item) => item.key === key)?.score || 0;
    const hydration = this.metricNumber(metrics.hydration, 70);
    const tone = this.metricNumber(metrics.tone, 74);
    const texture = this.metricNumber(metrics.texture, 74);
    const oil = this.metricNumber(metrics.oil, 58);
    const redness = Math.max(concernScore('redness'), concernScore('sensitivity'));
    const overlays = [
      {
        key: 'redness',
        label: 'Redness',
        score: redness,
        zones: [
          { x: 27, y: 48, w: 18, h: 12 },
          { x: 55, y: 48, w: 18, h: 12 },
        ],
      },
      {
        key: 'shine',
        label: 'Oil/shine',
        score: Math.max(0, oil - 40) * 1.6,
        zones: [
          { x: 42, y: 31, w: 16, h: 13 },
          { x: 43, y: 48, w: 14, h: 18 },
        ],
      },
      {
        key: 'texture',
        label: 'Texture',
        score: Math.max(concernScore('texture'), 100 - texture),
        zones: [
          { x: 30, y: 60, w: 16, h: 11 },
          { x: 54, y: 60, w: 16, h: 11 },
        ],
      },
      {
        key: 'dehydration',
        label: 'Dehydration risk',
        score: Math.max(concernScore('dehydration'), 100 - hydration),
        zones: [
          { x: 24, y: 40, w: 18, h: 12 },
          { x: 58, y: 40, w: 18, h: 12 },
        ],
      },
      {
        key: 'tone',
        label: 'Tone unevenness',
        score: Math.max(concernScore('uneven_tone'), 100 - tone),
        zones: [
          { x: 35, y: 35, w: 30, h: 38 },
        ],
      },
    ];

    return overlays
      .map((overlay) => ({
        ...overlay,
        score: Math.max(0, Math.min(100, Math.round(overlay.score))),
        intensity: Math.max(0.22, Math.min(0.72, overlay.score / 120)),
      }))
      .filter((overlay) => overlay.score >= 18)
      .sort((a, b) => b.score - a.score);
  },

  compareScanProgress(current = {}, previous = null) {
    if (!previous?.metrics || !current?.metrics) {
      return {
        status: 'baseline',
        title: 'Baseline mode',
        copy: 'Your next scan will compare hydration, clarity, texture, tone, and oil balance against this result.',
        deltas: [],
      };
    }

    const fields = [
      { key: 'hydration', label: 'Hydration' },
      { key: 'clarity', label: 'Clarity' },
      { key: 'texture', label: 'Texture' },
      { key: 'tone', label: 'Tone' },
      { key: 'oil', label: 'Oil balance', target: 58 },
    ];

    const deltas = fields.map((field) => {
      const now = this.metricNumber(current.metrics[field.key], 0);
      const before = this.metricNumber(previous.metrics[field.key], now);
      const rawDelta = field.key === 'oil'
        ? Math.abs(before - field.target) - Math.abs(now - field.target)
        : now - before;
      const delta = Math.round(rawDelta);
      return {
        key: field.key,
        label: field.label,
        delta,
        now,
        before,
        state: delta > 2 ? 'improved' : delta < -2 ? 'watch' : 'steady',
      };
    });

    const improved = deltas.filter((item) => item.state === 'improved').length;
    const watch = deltas.filter((item) => item.state === 'watch').length;
    const strongest = [...deltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
    const title = improved > watch
      ? `${improved} signals improved`
      : watch > improved
        ? `${watch} signals need attention`
        : 'Skin signals are steady';
    const copy = strongest
      ? `${strongest.label} changed ${strongest.delta > 0 ? '+' : ''}${strongest.delta} points since the last scan. Use the routine plan for seven days, then compare again.`
      : 'Use this result as today’s comparison point.';

    return { status: 'comparison', title, copy, deltas };
  },

  buildScanReport(scan = this.getLatestScan()) {
    if (!scan) return 'GlowAI report: no scan has been completed yet.';
    const topConcerns = (scan.concerns || []).slice(0, 5).map((item) => `${item.label} ${item.score}/${item.level}`).join('; ');
    const progress = scan.progress?.deltas?.length
      ? scan.progress.deltas.map((item) => `${item.label} ${item.delta > 0 ? '+' : ''}${item.delta}`).join('; ')
      : 'Baseline scan, no prior comparison yet.';
    return [
      `GlowAI consultation report`,
      `Scan: ${scan.title}`,
      `Summary: ${scan.summary}`,
      `Metrics: balance ${scan.metrics?.balance || '-'}, hydration ${scan.metrics?.hydration || '-'}, clarity ${scan.metrics?.clarity || '-'}, texture ${scan.metrics?.texture || '-'}, tone ${scan.metrics?.tone || '-'}, oil ${scan.metrics?.oil || '-'}`,
      `Top concerns: ${topConcerns || 'Not ranked yet'}`,
      `Next action: ${scan.priorityAction?.title || 'Keep the routine consistent'} - ${scan.priorityAction?.copy || ''}`,
      `AM routine: ${scan.routine?.morning || 'Cleanse, hydrate, SPF'}`,
      `PM routine: ${scan.routine?.night || 'Barrier support'}`,
      `Progress: ${scan.progress?.title || 'Baseline mode'} - ${progress}`,
      `Boundary: Cosmetic wellness guidance only; refer unusual, painful, changing, or persistent concerns to a licensed professional.`,
    ].join('\n');
  },

  escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  },

  async copyScanReport() {
    const status = document.getElementById('copyScanReportStatus');
    const report = this.buildScanReport();
    try {
      await navigator.clipboard?.writeText(report);
      if (status) status.textContent = 'Consultation report copied.';
    } catch {
      if (status) status.textContent = report;
    }
    this.logAgentAction('report', 'Consultation report prepared', {
      status: 'local-copy',
      report,
      scanId: this.getLatestScan()?.id || 'none',
    });
    this.renderAgentOps();
  },

  exportScanReportHtml() {
    const scan = this.getLatestScan();
    const status = document.getElementById('copyScanReportStatus');
    if (!scan) {
      if (status) status.textContent = 'Complete a scan before exporting a report.';
      return;
    }

    const whiteLabel = this.getStored(this.storageKeys.whiteLabel, {});
    const reportHtml = this.buildBrandedReportHtml(scan, whiteLabel);
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `glowai-report-${scan.id || Date.now().toString(36)}.html`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 2500);

    const exports = this.getStored(this.storageKeys.reportExports);
    exports.unshift({ id: `report-${Date.now().toString(36)}`, scanId: scan.id, createdAt: new Date().toISOString() });
    this.setStored(this.storageKeys.reportExports, exports.slice(0, 50));
    this.logAgentAction('report', 'Branded HTML report exported', { status: 'downloaded', scanId: scan.id });
    if (status) status.textContent = 'Branded report exported.';
    this.renderOwnerDashboard();
  },

  buildBrandedReportHtml(scan, whiteLabel = {}) {
    const studio = this.escapeHtml(whiteLabel.studio || 'GlowAI Studio');
    const topConcerns = (scan.concerns || []).slice(0, 5);
    const overlays = scan.overlays || this.generateScanOverlays(scan.metrics || {}, scan.concerns || []);
    const report = this.escapeHtml(this.buildScanReport(scan)).replaceAll('\n', '<br />');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${studio} GlowAI Report</title>
  <style>
    body{margin:0;font-family:Arial,sans-serif;background:#fff8f2;color:#241226}
    main{max-width:920px;margin:0 auto;padding:28px}
    .hero{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start}
    img{width:100%;border-radius:18px;display:block}
    .card{background:#fff;border:1px solid rgba(36,18,38,.12);border-radius:18px;padding:18px;margin-top:16px}
    h1,h2,h3{margin:.1rem 0 .5rem}
    .metrics,.concerns,.overlays{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .pill{border-radius:14px;background:#ecfbf6;padding:10px}
    small{color:#5f4a55;font-weight:700;text-transform:uppercase}
    pre{white-space:pre-wrap;font-family:inherit;line-height:1.45}
    @media(max-width:760px){.hero,.metrics,.concerns,.overlays{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <p><strong>${studio}</strong></p>
    <section class="hero">
      <div>
        <h1>${this.escapeHtml(scan.title)}</h1>
        <p>${this.escapeHtml(scan.summary)}</p>
        <div class="metrics">
          ${['balance', 'hydration', 'clarity', 'texture', 'tone', 'oil'].map((key) => `<div class="pill"><small>${key}</small><h3>${this.escapeHtml(scan.metrics?.[key] || '-')}</h3></div>`).join('')}
        </div>
      </div>
      <img src="${scan.photo}" alt="Client scan" />
    </section>
    <section class="card">
      <h2>Top concern priorities</h2>
      <div class="concerns">${topConcerns.map((item) => `<div class="pill"><small>${this.escapeHtml(item.level)}</small><h3>${this.escapeHtml(item.label)}</h3><p>${item.score}/100</p></div>`).join('')}</div>
    </section>
    <section class="card">
      <h2>Face-region overlay map</h2>
      <div class="overlays">${overlays.map((item) => `<div class="pill"><small>${this.escapeHtml(item.label)}</small><h3>${item.score}/100</h3><p>${item.zones.length} highlighted region${item.zones.length === 1 ? '' : 's'}</p></div>`).join('')}</div>
    </section>
    <section class="card">
      <h2>Routine and handoff</h2>
      <pre>${report}</pre>
    </section>
  </main>
</body>
</html>`;
  },

  recordAdherenceAction(action) {
    const today = new Date().toISOString().slice(0, 10);
    const state = this.getStored(this.storageKeys.adherence, { startedAt: today, days: {} });
    const day = state.days[today] || { am: false, spf: false, pm: false, rescan: false };
    if (action && day[action] !== undefined) day[action] = true;
    state.days[today] = day;
    state.updatedAt = new Date().toISOString();
    this.setStored(this.storageKeys.adherence, state);
    this.renderAdherenceLoop();
    this.renderOwnerDashboard();
    const label = action === 'rescan' ? 'next scan reminder' : `${String(action || '').toUpperCase()} routine`;
    this.pushAssistantMessage(`Logged ${label}. Keep the seven-day loop simple and scan again when the streak is complete.`);
  },

  renderAdherenceLoop() {
    const grid = document.getElementById('adherenceGrid');
    const title = document.getElementById('adherenceTitle');
    const badge = document.getElementById('adherenceBadge');
    if (!grid) return;
    const state = this.getStored(this.storageKeys.adherence, { startedAt: new Date().toISOString().slice(0, 10), days: {} });
    const start = new Date(state.startedAt || new Date().toISOString());
    const today = new Date().toISOString().slice(0, 10);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      const day = state.days?.[key] || {};
      const done = ['am', 'spf', 'pm'].filter((item) => day[item]).length;
      return { key, index, done, rescan: day.rescan };
    });
    const completed = days.reduce((sum, day) => sum + day.done, 0);
    if (title) title.textContent = completed ? `${completed}/21 routine moments logged.` : 'Stay with the plan after the scan.';
    if (badge) badge.textContent = `Day ${Math.min(7, Math.max(1, days.findIndex((day) => day.key === today) + 1 || 1))}`;
    grid.innerHTML = days.map((day) => `
      <article class="adherence-day ${day.done >= 3 ? 'is-complete' : day.done ? 'is-started' : ''}">
        <span>Day ${day.index + 1}</span>
        <strong>${day.done}/3</strong>
        <small>${day.rescan ? 'scan planned' : day.key.slice(5)}</small>
      </article>
    `).join('');
  },

  createSkinEvalTemplate() {
    const concerns = ['acne', 'redness', 'dryness', 'oiliness', 'dark_spots', 'uneven_tone', 'texture', 'pores', 'sensitivity', 'dullness', 'fine_lines', 'sun_damage', 'dehydration', 'barrier', 'ingrown_hairs'];
    return Array.from({ length: 50 }, (_, index) => ({
      id: `selfie-${String(index + 1).padStart(3, '0')}`,
      reviewer_concerns: concerns.slice(index % concerns.length, (index % concerns.length) + 2).filter(Boolean),
      predicted_concerns: [],
      routine_score: null,
      safety_pass: null,
      overlay_stable: null,
      notes: 'Reviewer fills labels after consented, anonymized selfie review. Do not store PHI in this file.',
    }));
  },

  seedSkinEvalTemplate() {
    const cases = this.createSkinEvalTemplate();
    this.setStored(this.storageKeys.evalCases, cases);
    this.renderSkinEvalStats(this.scoreSkinEvalCases());
    this.logAgentAction('eval', '50-case skin eval template loaded', { cases: cases.length });
    this.renderOwnerDashboard();
  },

  exportSkinEvalTemplate() {
    const cases = this.getStored(this.storageKeys.evalCases, this.createSkinEvalTemplate());
    const blob = new Blob([JSON.stringify(cases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'skin-eval.json';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 2500);
    this.logAgentAction('eval', 'Skin eval template exported', { cases: cases.length });
  },

  importSkinEvalFile(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const cases = JSON.parse(String(reader.result || '[]'));
        if (!Array.isArray(cases)) throw new Error('Expected a JSON array.');
        this.setStored(this.storageKeys.evalCases, cases);
        this.renderSkinEvalStats(this.scoreSkinEvalCases());
        this.logAgentAction('eval', 'Skin eval cases imported', { file: file.name, cases: cases.length });
        this.renderOwnerDashboard();
      } catch (error) {
        this.pushAssistantMessage(`Eval import failed: ${error.message}`);
      }
    };
    reader.readAsText(file);
  },

  scoreSkinEvalCases() {
    const cases = this.getStored(this.storageKeys.evalCases, []);
    const labeled = cases.filter((item) => Array.isArray(item.reviewer_concerns) && item.safety_pass !== null && item.routine_score !== null);
    const concernScores = labeled.map((item) => {
      const reviewer = new Set(item.reviewer_concerns || []);
      const predicted = new Set(item.predicted_concerns || []);
      if (!reviewer.size) return 1;
      return [...reviewer].filter((label) => predicted.has(label)).length / reviewer.size;
    });
    const avg = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    return {
      total: cases.length,
      labeled: labeled.length,
      concernMatch: Math.round(avg(concernScores) * 100),
      routineRelevance: labeled.length ? Math.round((labeled.filter((item) => Number(item.routine_score) >= 4).length / labeled.length) * 100) : 0,
      safetyPass: labeled.length ? Math.round((labeled.filter((item) => item.safety_pass === true).length / labeled.length) * 100) : 0,
      overlayStability: labeled.length ? Math.round((labeled.filter((item) => item.overlay_stable === true).length / labeled.length) * 100) : 0,
    };
  },

  renderSkinEvalStats(stats = this.scoreSkinEvalCases()) {
    const grid = document.getElementById('skinEvalStats');
    if (!grid) return;
    grid.innerHTML = [
      ['Cases', `${stats.labeled}/${stats.total}`],
      ['Concern match', `${stats.concernMatch}%`],
      ['Routine relevance', `${stats.routineRelevance}%`],
      ['Safety pass', `${stats.safetyPass}%`],
      ['Overlay stability', `${stats.overlayStability}%`],
    ].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`).join('');
  },

  renderOwnerDashboard() {
    const scans = this.getStored(this.storageKeys.scans, []);
    const bookings = this.getStored(this.storageKeys.bookings, []);
    const favorites = this.getStored(this.storageKeys.favorites, []);
    const exports = this.getStored(this.storageKeys.reportExports, []);
    const evalStats = this.scoreSkinEvalCases();
    const adherence = this.getStored(this.storageKeys.adherence, { days: {} });
    const adherenceMoments = Object.values(adherence.days || {}).reduce((sum, day) => sum + ['am', 'spf', 'pm'].filter((item) => day[item]).length, 0);
    const latest = this.getLatestScan();
    const topConcern = latest?.concerns?.[0]?.label || 'No concern yet';
    const progress = latest?.progress?.title || 'Baseline';
    const cartCount = favorites.filter((item) => /cart|routine/i.test(`${item.title} ${item.summary}`)).length;

    const setText = (id, value) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    };
    setText('ownerLeadCount', String(scans.length));
    setText('ownerBookingCount', String(bookings.length));
    setText('ownerCartValue', `$${cartCount * 89}`);
    setText('ownerReportCount', String(exports.length));
    setText('ownerAdherenceRate', `${Math.min(100, Math.round((adherenceMoments / 21) * 100))}%`);
    setText('ownerProgressSignal', progress);
    setText('ownerEvalReadiness', `${evalStats.labeled}/50`);
    setText('ownerTopConcern', topConcern);
    setText('ownerBenchmarkScore', `${this.benchmarkProof.weightedScore}%`);
    setText('ownerBenchmarkCases', String(this.benchmarkProof.cases));
    setText('ownerBenchmarkConcern', `${this.benchmarkProof.concernMatch}%`);
    setText('ownerBenchmarkSafety', `${this.benchmarkProof.safetyPass}%`);
  },

  generateRoutineFromSignals(signals) {
    const humidityStress = signals.humidityStress || 50;
    const hydration = signals.hydration || 70;
    const texture = signals.texture || 75;
    const redness = signals.redness || 20;
    const morning = [
      'Gentle cleanse',
      hydration < 66 ? 'hyaluronic or glycerin serum' : 'light antioxidant serum',
      humidityStress > 58 ? 'gel moisturizer' : 'barrier moisturizer',
      'water-resistant SPF 30+',
    ];
    const night = [
      'Cleanse',
      redness > 36 ? 'calming niacinamide' : texture < 68 ? 'PHA or lactic acid 1-2x weekly' : 'peptide or ceramide serum',
      hydration < 66 ? 'ceramide cream' : 'light moisturizer',
    ];
    return {
      morning: morning.join(', '),
      night: night.join(', '),
    };
  },

  generateGlowForecast(metrics = {}, signals = {}) {
    const toNumber = (value, fallback) => Number.parseInt(String(value || fallback), 10);
    const hydration = toNumber(metrics.hydration, signals.hydration || 70);
    const clarity = toNumber(metrics.clarity, signals.clarity || 70);
    const texture = toNumber(metrics.texture, signals.texture || 70);
    const humidityStress = signals.humidityStress || 52;
    const lift = humidityStress > 62 ? 9 : 13;
    return [
      { day: 7, label: 'Barrier steadier', score: Math.min(96, Math.round((hydration + 5 + clarity) / 2)), action: 'Keep SPF, gel moisturizer, and evening barrier support consistent.' },
      { day: 14, label: 'Texture smoother', score: Math.min(96, texture + Math.round(lift * 0.72)), action: 'Add gentle exfoliation only if redness stays calm.' },
      { day: 30, label: 'Skin forecast', score: Math.min(98, Math.round((hydration + clarity + texture) / 3) + lift), action: humidityStress > 62 ? 'Expect best results with lighter AM layers and midday SPF/blot routine.' : 'Expect best results by staying consistent with hydration and SPF.' },
    ];
  },

  renderScanSummary() {
    const latest = this.latestScan || this.getStored(this.storageKeys.scans)[0];
    const title = document.getElementById('scanResultTitle');
    const summary = document.getElementById('scanResultSummary');
    const tags = document.getElementById('scanResultTags');
    const list = document.getElementById('scanResultList');
    const preview = document.getElementById('scanPreview');
    const previewImage = document.getElementById('scanPreviewImage');
    const overlayMap = document.getElementById('scanOverlayMap');
    const badge = document.getElementById('scanResultBadge');
    const studioCTA = document.getElementById('scanStudioCTA');
    const heroTitle = document.getElementById('heroFocusTitle');
    const heroCopy = document.getElementById('heroFocusCopy');
    const metricBalance = document.getElementById('scanMetricBalance');
    const metricHydration = document.getElementById('scanMetricHydration');
    const metricClarity = document.getElementById('scanMetricClarity');
    const routineMorning = document.getElementById('scanRoutineMorning');
    const routineNight = document.getElementById('scanRoutineNight');
    const priorityTitle = document.getElementById('scanPriorityTitle');
    const priorityCopy = document.getElementById('scanPriorityCopy');
    const progressTitle = document.getElementById('scanProgressTitle');
    const progressCopy = document.getElementById('scanProgressCopy');
    const progressDeltas = document.getElementById('scanProgressDeltas');
    const concernGrid = document.getElementById('scanConcernGrid');
    const qualityConfidence = document.getElementById('scanQualityConfidence');
    const qualitySafety = document.getElementById('scanQualitySafety');
    const handoffs = document.getElementById('scanAgentHandoffs');

    if (!latest) {
      if (title) title.textContent = 'No scan yet';
      if (summary) summary.textContent = 'Start a face scan to see hydration, texture, oil, tone, clarity, and barrier-support steps.';
      if (badge) badge.textContent = 'Waiting';
      if (preview) preview.classList.add('hidden');
      if (previewImage) previewImage.removeAttribute('src');
      if (overlayMap) overlayMap.innerHTML = '';
      if (overlayLegend) overlayLegend.innerHTML = '';
      if (metricBalance) metricBalance.textContent = '-';
      if (metricHydration) metricHydration.textContent = '-';
      if (metricClarity) metricClarity.textContent = '-';
      if (routineMorning) routineMorning.textContent = 'Cleanse, hydrate, SPF';
      if (routineNight) routineNight.textContent = 'Barrier support';
      if (priorityTitle) priorityTitle.textContent = 'Build a baseline first';
      if (priorityCopy) priorityCopy.textContent = 'Complete one scan and GlowAI will rank the most useful skincare move for today.';
      if (progressTitle) progressTitle.textContent = 'Baseline mode';
      if (progressCopy) progressCopy.textContent = 'Your next scan will compare hydration, clarity, texture, tone, and oil balance against this result.';
      if (progressDeltas) progressDeltas.innerHTML = '';
      if (concernGrid) concernGrid.innerHTML = '';
      if (qualityConfidence) qualityConfidence.textContent = '-';
      if (qualitySafety) qualitySafety.textContent = 'Guide';
      if (handoffs) handoffs.innerHTML = '';
      this.setScanStatus('Idle', 'Take a scan and GlowAI will surface skin signals, routine priorities, and AM/PM care steps.');
      this.renderScanHistory();
      this.renderForecast();
      return;
    }

    if (title) title.textContent = latest.title;
    if (summary) summary.textContent = latest.summary;
    if (badge) badge.textContent = 'Ready';
    if (heroTitle) heroTitle.textContent = latest.title;
    if (heroCopy) heroCopy.textContent = latest.summary;
    if (studioCTA) {
      studioCTA.textContent = 'Open skin coach';
      studioCTA.setAttribute('data-nav-target', 'concierge');
    }
    if (metricBalance) metricBalance.textContent = latest.metrics?.balance || '-';
    if (metricHydration) metricHydration.textContent = latest.metrics?.hydration || '-';
    if (metricClarity) metricClarity.textContent = latest.metrics?.clarity || '-';
    if (routineMorning) routineMorning.textContent = latest.routine?.morning || 'Cleanse, hydrate, SPF';
    if (routineNight) routineNight.textContent = latest.routine?.night || 'Barrier support';
    if (priorityTitle) priorityTitle.textContent = latest.priorityAction?.title || 'Keep the routine consistent';
    if (priorityCopy) priorityCopy.textContent = latest.priorityAction?.copy || 'Stay consistent for 7 days, then scan again to compare hydration, clarity, texture, and tone.';
    const storedScans = this.getStored(this.storageKeys.scans);
    const progress = latest.progress || this.compareScanProgress(latest, storedScans.find((scan) => scan.id !== latest.id));
    if (progressTitle) progressTitle.textContent = progress.title;
    if (progressCopy) progressCopy.textContent = progress.copy;
    if (progressDeltas) {
      progressDeltas.innerHTML = progress.deltas?.length
        ? progress.deltas.map((item) => `
          <article class="progress-delta progress-${this.escapeHtml(item.state || 'steady')}">
            <span>${this.escapeHtml(item.label || 'Signal')}</span>
            <strong>${this.escapeHtml(`${item.delta > 0 ? '+' : ''}${item.delta}`)}</strong>
          </article>
        `).join('')
        : '<article class="progress-delta progress-steady"><span>Baseline</span><strong>New</strong></article>';
    }
    if (concernGrid) {
      const concerns = latest.concerns || this.generateConcernReadout(null, latest.metrics || {});
      concernGrid.innerHTML = concerns.map((concern) => `
        <article class="concern-card concern-${this.escapeHtml(String(concern.level || 'low').toLowerCase())}">
          <span>${this.escapeHtml(concern.label || 'Concern')}</span>
          <strong>${this.escapeHtml(concern.score ?? '-')}</strong>
          <small>${this.escapeHtml(concern.level || 'Low')}</small>
        </article>
      `).join('');
    }
    if (qualityConfidence) qualityConfidence.textContent = latest.confidence || 'Guided';
    if (qualitySafety) qualitySafety.textContent = latest.safetyNote || 'Guide';
    if (handoffs) {
      const items = latest.handoffs || ['Skin coach builds the routine', 'Progress tracker saves the baseline', 'Forecast watches hydration and texture'];
      handoffs.innerHTML = items.map((item) => `<div class="agent-handoff">${this.escapeHtml(item)}</div>`).join('');
    }

    if (preview && previewImage) {
      preview.classList.remove('hidden');
      previewImage.src = latest.photo;
    }
    if (overlayMap) {
      const overlays = latest.overlays || this.generateScanOverlays(latest.metrics || {}, latest.concerns || []);
      overlayMap.innerHTML = overlays.map((overlay) => overlay.zones.map((zone) => `
        <span
          class="scan-overlay-zone overlay-${this.escapeHtml(overlay.key)}"
          style="left:${zone.x}%;top:${zone.y}%;width:${zone.w}%;height:${zone.h}%;--overlay-alpha:${overlay.intensity}"
          title="${this.escapeHtml(overlay.label)} ${this.escapeHtml(String(overlay.score))}/100"
        ></span>
      `).join('')).join('');
      if (overlayLegend) {
        overlayLegend.innerHTML = overlays.length
          ? overlays.slice(0, 5).map((overlay) => `
            <span class="overlay-legend-item overlay-${this.escapeHtml(overlay.key)}">
              <i aria-hidden="true"></i>${this.escapeHtml(overlay.label)} ${this.escapeHtml(overlay.score)}
            </span>
          `).join('')
          : '<span class="overlay-legend-item">No priority overlay zones</span>';
      }
    }

    if (tags) {
      tags.innerHTML = '';
      latest.tags.forEach((tag) => {
        const item = document.createElement('span');
        item.className = 'detail-tag';
        item.textContent = tag;
        tags.appendChild(item);
      });
    }

    if (list) {
      list.innerHTML = '';
      latest.steps.forEach((step) => {
        const item = document.createElement('li');
        item.textContent = step;
        list.appendChild(item);
      });
    }

    this.renderScanHistory();
    this.renderForecast();
    this.renderAdherenceLoop();
    this.renderOwnerDashboard();
  },

  renderScanHistory() {
    const container = document.getElementById('scanHistoryList');
    if (!container) return;
    const scans = this.getStored(this.storageKeys.scans);
    if (!scans.length) {
      container.innerHTML = '<article class="note-card empty-card"><p class="card-label">No history yet</p><h3>Your completed scans will appear here.</h3><p>Take one face scan to start building a visible result trail.</p></article>';
      return;
    }

    container.innerHTML = scans.slice(0, 3).map((scan) => `
      <article class="note-card saved-card scan-history-card">
        <p class="card-label">${this.escapeHtml(scan.studioLane || 'Skin read')}</p>
        <h3>${this.escapeHtml(scan.title || 'Saved scan')}</h3>
        <p>${this.escapeHtml(scan.summary || 'No summary saved.')}</p>
        <div class="detail-tags">
          <span class="detail-tag">Balance ${this.escapeHtml(scan.metrics?.balance || '-')}</span>
          <span class="detail-tag">Hydration ${this.escapeHtml(scan.metrics?.hydration || '-')}</span>
          <span class="detail-tag">Clarity ${this.escapeHtml(scan.metrics?.clarity || '-')}</span>
          <span class="detail-tag">Texture ${this.escapeHtml(scan.metrics?.texture || '-')}</span>
          <span class="detail-tag">Tone ${this.escapeHtml(scan.metrics?.tone || '-')}</span>
          <span class="detail-tag">Oil ${this.escapeHtml(scan.metrics?.oil || '-')}</span>
        </div>
      </article>
    `).join('');
  },

  renderForecast() {
    const latest = this.latestScan || this.getStored(this.storageKeys.scans)[0];
    const title = document.getElementById('forecastTitle');
    const badge = document.getElementById('forecastBadge');
    const grid = document.getElementById('forecastGrid');
    if (!grid) return;

    if (!latest) {
      if (title) title.textContent = 'Forecast starts after your first scan.';
      if (badge) badge.textContent = 'Predictive';
      grid.innerHTML = '<article class="forecast-card"><p class="card-label">Day 7</p><strong>-</strong><span>Complete a scan to build your routine forecast.</span></article>';
      return;
    }

    const forecast = latest.forecast || this.generateGlowForecast(latest.metrics || {});
    if (title) title.textContent = '30-day skincare projection from your latest skin scan.';
    if (badge) badge.textContent = latest.safetyNote || 'Routine';
    grid.innerHTML = forecast.map((item) => `
      <article class="forecast-card">
        <p class="card-label">Day ${this.escapeHtml(item.day || '-')}</p>
        <strong>${this.escapeHtml(item.score ?? '-')}%</strong>
        <h3>${this.escapeHtml(item.label || 'Forecast')}</h3>
        <span>${this.escapeHtml(item.action || 'Stay consistent with the routine.')}</span>
      </article>
    `).join('');
  },

  setScanStatus(titleText, copyText) {
    const title = document.getElementById('scanStatusTitle');
    const copy = document.getElementById('scanStatusCopy');
    const pill = document.getElementById('scanStatusPill');
    if (title) title.textContent = titleText;
    if (copy) copy.textContent = copyText;
    if (pill) pill.textContent = titleText;
  },

  bindAvatarIntro() {
    const intro = document.getElementById('glowIntro');
    const scan = document.getElementById('glowIntroScan');
    const open = document.getElementById('glowIntroOpen');
    intro?.addEventListener('click', () => {
      if (this.shouldUseSelfieEntry()) {
        this.startAvatarSelfieFlow({ fromGesture: true });
        return;
      }
      this.startAvatarListening({ fromGesture: true, interruptIntro: true });
    });
    intro?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (this.shouldUseSelfieEntry()) {
          this.startAvatarSelfieFlow({ fromGesture: true });
          return;
        }
        this.startAvatarListening({ fromGesture: true, interruptIntro: true });
      }
    });
    scan?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.startAvatarSelfieFlow({ fromGesture: true });
    });
    open?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.finishAvatarIntro();
      this.showPage(this.shouldUseSelfieEntry() ? 'scan' : 'home');
    });
  },

  startAvatarIntro() {
    const intro = document.getElementById('glowIntro');
    const line = document.getElementById('glowGuideLine');
    const heard = document.getElementById('glowHeardLine');
    if (!intro || !line) return false;

    this.avatarIntro.active = true;
    intro.classList.remove('hidden');
    intro.classList.remove('is-closing');
    intro.classList.add('is-revealing');
    intro.classList.remove('is-listening');
    if (heard) {
      heard.textContent = '';
      heard.classList.add('hidden');
    }

    line.textContent = 'GlowAI reads your skin signals and builds your AM/PM routine.';
    const listeningState = document.getElementById('glowListeningState');
    if (listeningState) listeningState.textContent = 'Tap anywhere to start your face scan.';

    const autoTimer = window.setTimeout(() => {
      this.finishAvatarIntro();
      this.beginScanFlow();
    }, 3000);
    this.avatarIntro.timers.push(autoTimer);
    intro.focus({ preventScroll: true });
    return true;
  },

  getAvatarIntroLines() {
    const hour = new Date().getHours();
    const dayPart = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const latestScan = this.latestScan || this.getStored(this.storageKeys.scans)[0] || null;
    const scanContext = latestScan
      ? `Your last read was ${latestScan.title}. We will compare against it.`
      : 'No baseline yet. This first scan sets your reference.';
    const openings = [
      `Good ${dayPart}. You are in good hands.`,
      'Welcome back. We will keep this simple and precise.',
      'I am ready. We begin when you are ready.',
    ];
    const opening = openings[Math.floor(Math.random() * openings.length)];
    return [
      opening,
      `${scanContext} I will take you directly into scan, then we review results together.`,
      'Hold a calm, centered frame in soft light. For medical concerns, I will direct you to a professional.',
    ];
  },

  startAvatarSelfieFlow({ fromGesture = false } = {}) {
    if (!this.avatarIntro.active) this.avatarIntro.active = true;
    this.clearAvatarIntroTimers();
    try { this.avatarIntro.recognition?.stop?.(); } catch {}
    this.avatarIntro.recognition = null;
    this.avatarIntro.listening = false;
    document.getElementById('glowIntro')?.classList.remove('is-listening');
    this.finishAvatarIntro();
    this.beginScanFlow();
  },

  startAvatarListening({ fromGesture = false, interruptIntro = false } = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const state = document.getElementById('glowListeningState');
    const intro = document.getElementById('glowIntro');
    if (!this.avatarIntro.active || this.avatarIntro.listening) return;

    if (interruptIntro) {
      this.clearAvatarIntroTimers();
      window.speechSynthesis?.cancel?.();
      this.writeAvatarLine('I am listening. Tell me what you need.');
    }

    if (!SpeechRecognition) {
      if (state) state.textContent = 'Voice is unavailable here. Opening Coach for text.';
      window.setTimeout(() => {
        this.finishAvatarIntro();
        this.showPage('concierge');
        document.getElementById('chatInput')?.focus();
      }, 1400);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    this.avatarIntro.recognition = recognition;
    this.avatarIntro.listening = true;
    intro?.classList.add('is-listening');
    if (state) state.textContent = fromGesture ? 'Listening now.' : 'Listening for your voice.';

    recognition.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      this.showAvatarTranscript(transcript);
      const finalResult = Array.from(event.results).some((result) => result.isFinal);
      if (transcript && finalResult) {
        this.avatarIntro.listening = false;
        recognition.stop();
        await this.handleAvatarVoiceIntent(transcript);
      }
    };

    recognition.onerror = (event) => {
      this.avatarIntro.listening = false;
      intro?.classList.remove('is-listening');
      if (state) {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          state.textContent = fromGesture
            ? 'Microphone is blocked. Opening Coach for text.'
            : 'Tap once on the avatar screen, then speak.';
          if (fromGesture) {
            window.setTimeout(() => {
              this.finishAvatarIntro();
              this.showPage('concierge');
              document.getElementById('chatInput')?.focus();
            }, 1400);
          }
        } else {
          state.textContent = fromGesture
            ? 'I did not catch that. Tap the avatar and try again.'
            : 'Tap once on the avatar screen, then speak.';
        }
      }
    };

    recognition.onend = () => {
      this.avatarIntro.listening = false;
      intro?.classList.remove('is-listening');
      if (this.avatarIntro.active && state && !state.textContent.includes('Tap')) {
        state.textContent = 'Say "scan my face" or tell me your goal.';
      }
    };

    try {
      recognition.start();
    } catch {
      this.avatarIntro.listening = false;
      intro?.classList.remove('is-listening');
      if (state) state.textContent = 'Tap once on the avatar screen, then speak.';
    }
  },

  showAvatarTranscript(text) {
    const heard = document.getElementById('glowHeardLine');
    if (!heard || !text) return;
    heard.textContent = `Heard: ${text}`;
    heard.classList.remove('hidden');
  },

  clearAvatarIntroTimers() {
    this.avatarIntro.timers.forEach((timer) => window.clearTimeout(timer));
    this.avatarIntro.timers = [];
  },

  async handleAvatarVoiceIntent(text) {
    const normalized = text.toLowerCase();
    const state = document.getElementById('glowListeningState');
    const wantsScan = normalized.includes('scan') || normalized.includes('camera') || normalized.includes('face');
    const wantsExit = /(open|enter|show).*(app|home)|skip|cancel|stop/.test(normalized);

    if (wantsExit) {
      this.clearAvatarIntroTimers();
      this.writeAvatarLine('Opening GlowAI now. Call me from Coach any time.');
      this.speak('Opening GlowAI now. Call me from Coach any time.', { force: true });
      window.setTimeout(() => this.finishAvatarIntro(), 900);
      return;
    }

    if (wantsScan) {
      this.writeAvatarLine('Opening face scan now. Keep centered in even light.');
      this.speak('Opening face scan now. Keep centered in even light.', { force: true });
      this.clearAvatarIntroTimers();
      window.setTimeout(() => this.startAvatarSelfieFlow(), 1000);
      return;
    }

    this.clearAvatarIntroTimers();
    this.writeAvatarLine('Understood. I am opening Coach so we can continue.');
    this.speak('Understood. I am opening Coach so we can continue.', { force: true });
    this.pushUserMessage(text);
    this.pushAssistantMessage('I heard you. Share one detail, or ask me to start your face scan.');
    if (state) state.textContent = 'Opening Coach...';
    window.setTimeout(() => {
      this.finishAvatarIntro();
      this.showPage('concierge');
      document.getElementById('chatInput')?.focus();
    }, 1000);
  },

  writeAvatarLine(text) {
    const line = document.getElementById('glowGuideLine');
    const avatar = document.getElementById('glowAvatarWrap');
    if (!line || !text) return;
    line.textContent = text;
    avatar?.classList.add('is-speaking');
    window.clearTimeout(this.avatarIntro.speakingTimer);
    const speakingMs = Math.min(2400, Math.max(1100, text.length * 28));
    this.avatarIntro.speakingTimer = window.setTimeout(() => avatar?.classList.remove('is-speaking'), speakingMs);
  },

  finishAvatarIntro() {
    const intro = document.getElementById('glowIntro');
    this.avatarIntro.active = false;
    this.clearAvatarIntroTimers();
    window.clearTimeout(this.avatarIntro.speakingTimer);
    try { this.avatarIntro.recognition?.stop?.(); } catch {}
    this.avatarIntro.recognition = null;
    this.avatarIntro.listening = false;
    intro?.classList.remove('is-listening');
    intro?.classList.remove('is-revealing');
    intro?.classList.add('is-closing');
    if (intro) {
      intro.style.opacity = '';
      intro.style.visibility = '';
    }
    window.setTimeout(() => {
      intro?.classList.add('hidden');
      if (intro) intro.style.display = '';
    }, 260);
  },

  bindAvatarSkills() {
    document.addEventListener('sw-avatar:skill', (event) => {
      const skill = (event.detail?.skill || '').toLowerCase();
      if (skill.includes('scan') || skill.includes('skin')) {
        this.showPage('scan');
      } else if (skill.includes('book') || skill.includes('schedule')) {
        this.syncBookingService();
        this.showPage('booking');
      } else if (skill.includes('style') || skill.includes('service')) {
        this.showPage('services');
      } else if (skill.includes('coach') || skill.includes('chat')) {
        this.showPage('concierge');
        document.getElementById('chatInput')?.focus();
      }
    });
  },

  syncBookingService() {
    const content = this.focusContent[this.currentService];
    const title = document.getElementById('bookingServiceTitle');
    const subtitle = document.getElementById('bookingServiceSubtitle');
    if (title) title.textContent = content.detailTitle;
    if (subtitle) subtitle.textContent = content.detailSubtitle;
  },

  renderFavorites() {
    const container = document.getElementById('favoritesList');
    if (!container) return;
    const favorites = this.getStored(this.storageKeys.favorites);
    if (!favorites.length) {
      container.innerHTML = '<article class="note-card empty-card"><p class="card-label">No favorites yet</p><h3>Save a service detail to build your beauty library.</h3><p>Tap “Save to favorites” on any service detail page and it will appear here.</p></article>';
      return;
    }

    container.innerHTML = favorites.map((item) => `
      <article class="note-card saved-card">
        <p class="card-label">${this.escapeHtml(this.focusContent[item.service]?.label || 'Saved look')}</p>
        <h3>${this.escapeHtml(item.title || 'Saved item')}</h3>
        <p>${this.escapeHtml(item.summary || 'No summary saved.')}</p>
      </article>
    `).join('');
  },

  renderBookings() {
    const container = document.getElementById('bookingList');
    if (!container) return;
    const bookings = this.getStored(this.storageKeys.bookings);
    if (!bookings.length) {
      container.innerHTML = '<article class="note-card empty-card"><p class="card-label">Nothing booked yet</p><h3>Your confirmed looks will appear here.</h3><p>Use the booking form to hold a service without leaving GlowAI.</p></article>';
      return;
    }

    container.innerHTML = bookings.slice(0, 4).map((item) => `
      <article class="note-card saved-card">
        <p class="card-label">${this.escapeHtml(item.serviceTitle || 'Booking')}</p>
        <h3>${this.escapeHtml(item.name || 'Guest')}</h3>
        <p>${this.escapeHtml(item.date || 'Date TBD')} at ${this.escapeHtml(item.time || 'TBD')}</p>
        ${item.notes ? `<p>${this.escapeHtml(item.notes)}</p>` : ''}
      </article>
    `).join('');
  },

  renderChat() {
    const thread = document.getElementById('chatThread');
    if (!thread) return;
    const messages = this.getStored(this.storageKeys.chat);
    thread.innerHTML = messages.map((message) => `
      <div class="chat-row ${message.role === 'assistant' ? 'assistant' : 'user'}">
        <div class="chat-bubble">${this.escapeHtml(message.text || '')}</div>
      </div>
    `).join('');
    thread.scrollTop = thread.scrollHeight;
  },

  pushUserMessage(text) {
    const messages = this.getStored(this.storageKeys.chat);
    messages.push({ role: 'user', text });
    this.setStored(this.storageKeys.chat, messages);
    this.renderChat();
  },

  pushAssistantMessage(text) {
    const messages = this.getStored(this.storageKeys.chat);
    messages.push({ role: 'assistant', text });
    this.setStored(this.storageKeys.chat, messages);
    this.renderChat();
  },

};
// GlowAI beauty coach — powered by Claude Sonnet 4.6

document.addEventListener('DOMContentLoaded', () => window.glowaiApp.init());
