'use strict';

window.glowaiApp = {
  currentPage: 'home',
  currentService: 'brows',
  latestScan: null,
  liveScan: {
    active: false,
    samples: [],
    lastFrame: '',
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
    habits: 'glowai_habit_preferences',
    greeting: 'glowai_greeting_spoken',
    intro: 'glowai_intro_seen',
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
    text: 'Try GlowAI. Scan your face for instant skin insights, appointment options, and product suggestions that keep your routine in rhythm.',
  },

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

  init() {
    this.ensureSeedData();
    this.seedLocalApiKey();
    this.bindMenu();
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
    this.bindAvatarIntro();
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
    this.renderAgentOps();
    this.showPage('home');
    if (!this.startAvatarIntro()) {
      window.setTimeout(() => this.greetUserOnce({ forceSpeech: true }), 450);
    }
  },

  ensureSeedData() {
    if (!localStorage.getItem(this.storageKeys.chat)) {
      const seeded = [
        { role: 'assistant', text: "Welcome to GlowAI. Scan your face to get instant skin insights, appointment options, and product suggestions that keep your routine in rhythm." },
      ];
      localStorage.setItem(this.storageKeys.chat, JSON.stringify(seeded));
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

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
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

    if (dateInput && !dateInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().slice(0, 10);
    }

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
    document.getElementById('unlockForecastsBtn')?.addEventListener('click', () => this.startSubscription('freemium_unlock'));
    document.getElementById('subscribeSalonBtn')?.addEventListener('click', () => this.startSubscription('salon_monthly'));
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
        captions: ['AI skin scan', 'coastal humidity routine', '30-day glow forecast', 'Book + shop from scan'],
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

  launchWhiteLabelWorkspace() {
    const studio = document.getElementById('whiteLabelStudio')?.value.trim() || 'Pearl City Glow Studio';
    const plan = document.getElementById('whiteLabelPlan')?.value || 'starter';
    const workspace = {
      studio,
      plan,
      monthlyPrice: plan === 'starter' ? 299 : plan === 'growth' ? 799 : 'custom',
      features: plan === 'starter'
        ? ['Branded scan app', 'Agent booking leads', 'Basic Shopify cart']
        : plan === 'growth'
          ? ['White-label app', 'Calendar + Shopify agents', 'Reel generator', 'Lead analytics']
          : ['Custom domain', 'Multi-location routing', 'POS/CRM integration', 'Dedicated model tuning'],
      launchedAt: new Date().toISOString(),
    };
    this.setStored(this.storageKeys.whiteLabel, workspace);
    this.logAgentAction('white-label', `Studio workspace launched for ${studio}`, workspace);
    this.pushAssistantMessage(`${studio} white-label workspace launched on the ${plan} plan. The agent cockpit is ready for studio lead capture and scan-to-revenue workflows.`);
    this.renderAgentOps();
  },

  async startSubscription(plan) {
    const label = plan === 'salon_monthly' ? 'Salon subscription' : 'Forecast and reel unlock';
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
      this.pushAssistantMessage(`${label} checkout is not configured yet. Add Stripe keys on the backend, then try again.`);
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
    const plan = document.getElementById('whiteLabelPlan');
    if (calendar && config.calendarEndpoint) calendar.value = config.calendarEndpoint;
    if (shopify && config.shopifyEndpoint) shopify.value = config.shopifyEndpoint;
    if (reel && config.reelEndpoint) reel.value = config.reelEndpoint;
    if (studio && whiteLabel.studio) studio.value = whiteLabel.studio;
    if (plan && whiteLabel.plan) plan.value = whiteLabel.plan;

    const container = document.getElementById('agentLogList');
    if (!container) return;
    const log = this.getStored(this.storageKeys.agentLog);
    if (!log.length) {
      container.innerHTML = '<article class="agent-log-item"><p class="card-label">No actions yet</p><h3>Run an agent to create booking, commerce, reel, or white-label output.</h3><p>Every action writes a payload that can be sent to your production APIs.</p></article>';
      return;
    }
    container.innerHTML = log.slice(0, 8).map((item) => `
      <article class="agent-log-item">
        <p class="card-label">${item.type}</p>
        <h3>${item.title}</h3>
        <p>${new Date(item.createdAt).toLocaleString()}</p>
        <pre>${JSON.stringify(item.detail, null, 2)}</pre>
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

    if (!this.getApiKey() && keyBar) keyBar.classList.remove('hidden');

    keySaveBtn?.addEventListener('click', () => {
      const k = keyInput?.value.trim();
      if (!k.startsWith('sk-ant-')) { alert('Paste a valid Anthropic key (starts with sk-ant-).'); return; }
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
        if (keyBar) keyBar.classList.remove('hidden');
        this.pushAssistantMessage('Add your Claude API key above to activate the live beauty coach.');
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
      if (status) status.textContent = 'Voice recognition is not supported in this browser.';
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
      this.pushAssistantMessage('Add your Claude API key to activate live voice coaching. I saved the coastal humidity preference locally.');
      this.speak('Add your Claude API key to activate live voice coaching.');
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
    const greeting = 'Welcome to GlowAI. Scan your face to get instant skin insights, appointment options, and product suggestions that keep your routine in rhythm.';
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
    const apiMessages = stored.slice(-20)
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

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
      const msg = err.status === 401
        ? 'Invalid API key — check your key in the bar above.'
        : err.circuitOpen
          ? 'Too many errors — wait a minute and try again.'
          : `Coach error: ${err.message}`;
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
      this.speak('Welcome to GlowAI. Scan your face to get instant skin insights, appointment options, and product suggestions that keep your routine in rhythm.', { force: true });
      this.showPage('scan');
      this.setScanStatus('Opening camera', 'Launching the front camera now. Hold the phone steady and keep your face centered.');
      window.scanModule?.startScan?.();
    });

    document.getElementById('scanLaunch')?.addEventListener('click', () => {
      this.setScanStatus('Opening camera', 'Launching the front camera now. Hold the phone steady and keep your face centered.');
      window.scanModule?.startScan?.();
    });

    document.getElementById('liveScanStart')?.addEventListener('click', () => this.startLiveSkinScan());
    document.getElementById('liveScanStop')?.addEventListener('click', () => this.finishLiveSkinScan());
  },

  async startLiveSkinScan() {
    const video = document.getElementById('liveScanVideo');
    const canvas = document.getElementById('liveScanCanvas');
    const startBtn = document.getElementById('liveScanStart');
    const stopBtn = document.getElementById('liveScanStop');
    if (!video || !canvas) return;

    this.liveScan = { active: true, samples: [], lastFrame: '' };
    startBtn?.classList.add('hidden');
    stopBtn?.classList.remove('hidden');
    this.showPage('scan');
    this.setScanStatus('Live scanning', 'Keep your face in the oval while GlowAI samples texture, tone, oil, and humidity fit.');

    try {
      await window.scanModule?.startLiveSkinScan?.({
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
    }
  },

  finishLiveSkinScan() {
    const startBtn = document.getElementById('liveScanStart');
    const stopBtn = document.getElementById('liveScanStop');
    window.scanModule?.stopCameraStream?.();
    startBtn?.classList.remove('hidden');
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

  showPage(pageId) {
    if (!pageId) return;
    this.currentPage = pageId;

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

    if (triggerLabel && activeButton) {
      triggerLabel.textContent = activeButton.textContent.trim();
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
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const photo = this.tryonState.photos[mode] || this.latestScan?.photo || '';
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
        if (button) button.textContent = 'Use camera';
        this.pushAssistantMessage('No photo came back from the camera. Try again and confirm the capture instead of backing out.');
        return;
      }

      this.tryonState.photos[mode] = capture.dataUrl;
      this.renderTryOn();
      this.pushAssistantMessage(mode === 'nails'
        ? 'Hand photo captured. Pick a color or length to preview the nail overlay.'
        : 'Selfie captured. Pick a brow shape, then drag or widen the overlay until it lines up.');
    } catch (error) {
      this.pushAssistantMessage(`Camera did not return a usable photo: ${error?.message || 'check permission and try again.'}`);
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

    const activePhoto = this.tryonState.photos[mode] || (mode === 'product' ? this.latestScan?.photo : '') || '';
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
      const message = `${payload.text} ${payload.url}`;

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

  handleScanCapture(dataUrl, faceQuality = {}, skinSignals = null) {
    const analysis = this.generateFaceAnalysis(faceQuality, skinSignals);
    const scanRecord = {
      id: Date.now().toString(36),
      createdAt: new Date().toISOString(),
      photo: dataUrl,
      ...analysis,
    };
    const historyEntry = {
      id: scanRecord.id,
      createdAt: scanRecord.createdAt,
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
    };
    const scans = this.getStored(this.storageKeys.scans);
    scans.unshift(historyEntry);
    this.latestScan = scanRecord;
    this.trySetStored(this.storageKeys.scans, scans.slice(0, 6));
    this.renderFocus(analysis.serviceKey);
    this.showPage('scan');
    const confidenceCopy = faceQuality?.available && faceQuality?.confidence
      ? ` Face check ${faceQuality.confidence}%.`
      : '';
    this.setScanStatus('Result ready', `GlowAI found a ${analysis.title.toLowerCase()} pattern and mapped your next step.${confidenceCopy}`);
    this.renderScanSummary();
    this.renderScanHistory();
    this.renderForecast();
    this.pushAssistantMessage(`Face scan complete. I’d start with ${analysis.studioLane.toLowerCase()} based on what GlowAI picked up.`);
  },

  handleScanError(message) {
    const summary = document.getElementById('scanResultSummary');
    const title = document.getElementById('scanResultTitle');
    const badge = document.getElementById('scanResultBadge');
    if (title) title.textContent = 'Camera unavailable';
    if (summary) summary.textContent = message;
    if (badge) badge.textContent = 'Error';
    this.setScanStatus('Camera issue', message);
    this.showPage('scan');
  },

  generateFaceAnalysis(faceQuality = {}, skinSignals = null) {
    const profiles = [
      {
        title: 'Balanced skin with slight dehydration',
        summary: 'Your skin looks generally balanced, with mild dehydration around the cheeks and a good base for soft polish or prep-first services.',
        tags: ['Hydration', 'Soft texture', 'Prep ready'],
        steps: ['Start with hydration and barrier support before finish-heavy services', 'Use a gentle humectant serum before moisturizer and SPF', 'Keep exfoliation minimal if the event is close'],
        studioLane: 'Skin Prep',
        serviceKey: 'skin',
        metrics: { balance: '82%', hydration: '68%', clarity: '79%', texture: '76%', tone: '81%', oil: '72%' },
        routine: { morning: 'Gentle cleanse, hyaluronic serum, moisturizer, SPF 30+', night: 'Cleanse, ceramide cream, no exfoliation tonight' },
        confidence: '84%',
        safetyNote: 'Routine',
        handoffs: ['Coach builds a barrier-support routine', 'Progress tracker saves this as the baseline', 'Scheduler suggests prep before finish'],
      },
      {
        title: 'Brightness loss with texture focus',
        summary: 'GlowAI picked up mild texture and uneven brightness, which makes skin prep the clearest first move before the full studio flow.',
        tags: ['Texture', 'Brightness', 'Calm prep'],
        steps: ['Prioritize barrier-friendly brightening before finish-heavy services', 'Use niacinamide or azelaic acid on non-exfoliation nights', 'Save finish and hair after the prep window'],
        studioLane: 'Skin Prep',
        serviceKey: 'skin',
        metrics: { balance: '74%', hydration: '63%', clarity: '66%', texture: '61%', tone: '65%', oil: '70%' },
        routine: { morning: 'Cleanse, niacinamide, moisturizer, SPF 50', night: 'Cleanse, barrier cream, pause harsh scrubs' },
        confidence: '76%',
        safetyNote: 'Prep first',
        handoffs: ['Coach avoids aggressive exfoliation', 'Progress tracker watches tone and texture', 'Scheduler puts skin prep before event services'],
      },
      {
        title: 'Strong frame for brows and polished finish',
        summary: 'Your features would respond well to clean brow framing and a polished finish, with skin prep as support rather than the headline.',
        tags: ['Brows', 'Framing', 'Finish ready'],
        steps: ['Start with brow shaping or cleanup first', 'Use light prep and avoid overloading the skin right before finish', 'Keep SPF and moisturizer steady so finish sits evenly'],
        studioLane: 'Eyebrow Studio',
        serviceKey: 'brows',
        metrics: { balance: '88%', hydration: '72%', clarity: '84%', texture: '80%', tone: '83%', oil: '77%' },
        routine: { morning: 'Cleanse, lightweight moisturizer, SPF 30+', night: 'Cleanse, calming serum, moisturizer' },
        confidence: '89%',
        safetyNote: 'Routine',
        handoffs: ['Coach keeps care simple before finish', 'Progress tracker monitors hydration', 'Scheduler pairs brows before makeup'],
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
      selected.steps = [
        humidAdjustment,
        hydration < 66 ? 'Add a humectant serum under moisturizer morning and night.' : 'Keep hydration steady and do not overload layers.',
        texture < 68 ? 'Use gentle chemical exfoliation only 1-2 nights weekly, never on irritated days.' : 'Maintain texture with a low-friction cleanse and consistent SPF.',
      ];
      selected.studioLane = 'Skin Prep';
      selected.serviceKey = 'skin';
      selected.safetyNote = humidityStress > 65 ? 'Humidity adjust' : 'Routine';
      selected.forecast = this.generateGlowForecast(selected.metrics, skinSignals);
      selected.handoffs = [
        `coastal humidity load: ${humidityStress}%`,
        skinSignals.segmentation === 'selfie' ? `selfie segmentation coverage: ${skinSignals.segmentationCoverage || '-'}%` : 'full-frame scan fallback used',
        'Coach can adjust AM routine for sweat, SPF reapplication, and lighter layers',
        'Progress tracker projects 7, 14, and 30 day changes',
      ];
    }

    if (faceQuality.available && faceQuality.detected !== false) {
      qualityTags.push('Face detected');
      if (faceQuality.centered === false) qualityTags.push('Recenter next scan');
      if (faceQuality.closeEnough === false) qualityTags.push('Move closer');
      selected.confidence = faceQuality.confidence ? `${faceQuality.confidence}%` : selected.confidence;
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
    selected.forecast = selected.forecast || this.generateGlowForecast(selected.metrics);
    return selected;
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
      { day: 30, label: 'Glow forecast', score: Math.min(98, Math.round((hydration + clarity + texture) / 3) + lift), action: humidityStress > 62 ? 'Expect best results with lighter AM layers and midday SPF/blot routine.' : 'Expect best results by staying consistent with hydration and SPF.' },
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
    const badge = document.getElementById('scanResultBadge');
    const studioCTA = document.getElementById('scanStudioCTA');
    const heroTitle = document.getElementById('heroFocusTitle');
    const heroCopy = document.getElementById('heroFocusCopy');
    const metricBalance = document.getElementById('scanMetricBalance');
    const metricHydration = document.getElementById('scanMetricHydration');
    const metricClarity = document.getElementById('scanMetricClarity');
    const routineMorning = document.getElementById('scanRoutineMorning');
    const routineNight = document.getElementById('scanRoutineNight');
    const qualityConfidence = document.getElementById('scanQualityConfidence');
    const qualitySafety = document.getElementById('scanQualitySafety');
    const handoffs = document.getElementById('scanAgentHandoffs');

    if (!latest) {
      if (title) title.textContent = 'No scan yet';
      if (summary) summary.textContent = 'Start a face scan to see your current skin snapshot, focus areas, and a suggested care lane.';
      if (badge) badge.textContent = 'Waiting';
      if (preview) preview.classList.add('hidden');
      if (previewImage) previewImage.removeAttribute('src');
      if (metricBalance) metricBalance.textContent = '-';
      if (metricHydration) metricHydration.textContent = '-';
      if (metricClarity) metricClarity.textContent = '-';
      if (routineMorning) routineMorning.textContent = 'Cleanse, hydrate, SPF';
      if (routineNight) routineNight.textContent = 'Barrier support';
      if (qualityConfidence) qualityConfidence.textContent = '-';
      if (qualitySafety) qualitySafety.textContent = 'Guide';
      if (handoffs) handoffs.innerHTML = '';
      this.setScanStatus('Idle', 'Take a scan and GlowAI will surface a skin snapshot, recommended focus, and the care step that should come next.');
      this.renderScanHistory();
      this.renderForecast();
      return;
    }

    if (title) title.textContent = latest.title;
    if (summary) summary.textContent = latest.summary;
    if (badge) badge.textContent = 'Ready';
    if (heroTitle) heroTitle.textContent = latest.title;
    if (heroCopy) heroCopy.textContent = latest.summary;
    if (studioCTA) studioCTA.textContent = `Open ${latest.studioLane}`;
    if (metricBalance) metricBalance.textContent = latest.metrics?.balance || '-';
    if (metricHydration) metricHydration.textContent = latest.metrics?.hydration || '-';
    if (metricClarity) metricClarity.textContent = latest.metrics?.clarity || '-';
    if (routineMorning) routineMorning.textContent = latest.routine?.morning || 'Cleanse, hydrate, SPF';
    if (routineNight) routineNight.textContent = latest.routine?.night || 'Barrier support';
    if (qualityConfidence) qualityConfidence.textContent = latest.confidence || 'Guided';
    if (qualitySafety) qualitySafety.textContent = latest.safetyNote || 'Guide';
    if (handoffs) {
      const items = latest.handoffs || ['Coach builds the routine', 'Stylist aligns the service lane', 'Scheduler keeps timing clear'];
      handoffs.innerHTML = items.map((item) => `<div class="agent-handoff">${item}</div>`).join('');
    }

    if (preview && previewImage) {
      preview.classList.remove('hidden');
      previewImage.src = latest.photo;
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
        <p class="card-label">${scan.studioLane}</p>
        <h3>${scan.title}</h3>
        <p>${scan.summary}</p>
        <div class="detail-tags">
          <span class="detail-tag">Balance ${scan.metrics?.balance || '-'}</span>
          <span class="detail-tag">Hydration ${scan.metrics?.hydration || '-'}</span>
          <span class="detail-tag">Clarity ${scan.metrics?.clarity || '-'}</span>
          <span class="detail-tag">Texture ${scan.metrics?.texture || '-'}</span>
          <span class="detail-tag">Tone ${scan.metrics?.tone || '-'}</span>
          <span class="detail-tag">Oil ${scan.metrics?.oil || '-'}</span>
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
    if (title) title.textContent = '30-day routine projection from your latest scan.';
    if (badge) badge.textContent = latest.safetyNote || 'Routine';
    grid.innerHTML = forecast.map((item) => `
      <article class="forecast-card">
        <p class="card-label">Day ${item.day}</p>
        <strong>${item.score}%</strong>
        <h3>${item.label}</h3>
        <span>${item.action}</span>
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
    intro?.addEventListener('click', () => this.startAvatarListening({ fromGesture: true, interruptIntro: true }));
    intro?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.startAvatarListening({ fromGesture: true, interruptIntro: true });
      }
    });
  },

  startAvatarIntro() {
    const intro = document.getElementById('glowIntro');
    const line = document.getElementById('glowGuideLine');
    if (!intro || !line) return false;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.avatarIntro.active = true;
    intro.classList.remove('hidden');
    intro.classList.remove('is-closing');
    intro.classList.add('is-revealing');

    const lines = this.getAvatarIntroLines();
    this.avatarIntro.lines = lines;
    this.avatarIntro.lineIndex = 0;
    this.writeAvatarLine(lines[0]);

    this.speak(lines[0], { force: true });

    if (!reducedMotion) {
      lines.slice(1).forEach((text, index) => {
        const timer = window.setTimeout(() => {
          this.writeAvatarLine(text);
          this.speak(text, { force: true });
        }, 2600 + (index * 3300));
        this.avatarIntro.timers.push(timer);
      });
    }

    const listenTimer = window.setTimeout(() => this.startAvatarListening(), reducedMotion ? 350 : 8400);
    this.avatarIntro.timers.push(listenTimer);
    intro.focus({ preventScroll: true });
    return true;
  },

  getAvatarIntroLines() {
    const hour = new Date().getHours();
    const dayPart = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const latestScan = this.latestScan || this.getStored(this.storageKeys.scans)[0] || null;
    const scanContext = latestScan
      ? `I remember your last read: ${latestScan.title}. We can compare today against that.`
      : 'No baseline yet, so the first scan will give us your starting point.';
    const openings = [
      `Good ${dayPart}. Let me settle the light before we begin.`,
      `Hi. I am here with you. I will move slowly, then we can decide what you need.`,
      `Welcome back to GlowAI. I am checking the room and getting the scan path ready.`,
    ];
    const opening = openings[Math.floor(Math.random() * openings.length)];
    return [
      opening,
      `${scanContext} Say scan my face when you are ready, or tell me what brought you here.`,
      'I will not open the camera until you ask for a scan. If something sounds medical, I will keep you pointed toward a professional.',
    ];
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
      if (state) state.textContent = 'Voice input is not supported here. Opening Coach so you can type.';
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
    if (state) state.textContent = fromGesture ? 'I am listening now.' : 'Listening for your voice...';

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
            ? 'Microphone permission was blocked. Opening Coach so you can type.'
            : 'Tap anywhere on the avatar screen once, then speak.';
          if (fromGesture) {
            window.setTimeout(() => {
              this.finishAvatarIntro();
              this.showPage('concierge');
              document.getElementById('chatInput')?.focus();
            }, 1400);
          }
        } else {
          state.textContent = fromGesture
            ? 'I could not hear you clearly. Tap the avatar and speak again.'
            : 'Tap anywhere on the avatar screen once, then speak.';
        }
      }
    };

    recognition.onend = () => {
      this.avatarIntro.listening = false;
      intro?.classList.remove('is-listening');
      if (this.avatarIntro.active && state && !state.textContent.includes('Tap')) {
        state.textContent = 'Say "scan my face" or tell me what you need.';
      }
    };

    try {
      recognition.start();
    } catch {
      this.avatarIntro.listening = false;
      intro?.classList.remove('is-listening');
      if (state) state.textContent = 'Tap anywhere on the avatar screen once, then speak.';
    }
  },

  showAvatarTranscript(text) {
    const heard = document.getElementById('glowHeardLine');
    if (!heard || !text) return;
    heard.textContent = `I heard: ${text}`;
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
      this.writeAvatarLine('Opening GlowAI. You can call me from Coach when you want help.');
      this.speak('Opening GlowAI. You can call me from Coach when you want help.', { force: true });
      window.setTimeout(() => this.finishAvatarIntro(), 900);
      return;
    }

    if (wantsScan) {
      this.clearAvatarIntroTimers();
      this.writeAvatarLine('Yes. I will open the face scan now. Keep your face centered in even light.');
      this.speak('Yes. I will open the face scan now. Keep your face centered in even light.', { force: true });
      window.setTimeout(() => {
        this.finishAvatarIntro();
        this.showPage('scan');
        this.setScanStatus('Opening camera', 'Launching the front camera now. Hold the phone steady and keep your face centered.');
        window.scanModule?.startScan?.();
      }, 1200);
      return;
    }

    this.clearAvatarIntroTimers();
    this.writeAvatarLine('I can help with that. I am opening Coach so we can keep talking.');
    this.speak('I can help with that. I am opening Coach so we can keep talking.', { force: true });
    this.pushUserMessage(text);
    this.pushAssistantMessage('I heard you. Tell me a little more, or ask me to scan your face when you are ready.');
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
    this.avatarIntro.speakingTimer = window.setTimeout(() => avatar?.classList.remove('is-speaking'), 1500);
  },

  finishAvatarIntro() {
    const intro = document.getElementById('glowIntro');
    this.avatarIntro.active = false;
    this.clearAvatarIntroTimers();
    window.clearTimeout(this.avatarIntro.speakingTimer);
    try { this.avatarIntro.recognition?.stop?.(); } catch {}
    this.avatarIntro.recognition = null;
    this.avatarIntro.listening = false;
    intro?.classList.add('is-closing');
    window.setTimeout(() => intro?.classList.add('hidden'), 260);
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
        <p class="card-label">${this.focusContent[item.service]?.label || 'Saved look'}</p>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
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
        <p class="card-label">${item.serviceTitle}</p>
        <h3>${item.name}</h3>
        <p>${item.date} at ${item.time || 'TBD'}</p>
        ${item.notes ? `<p>${item.notes}</p>` : ''}
      </article>
    `).join('');
  },

  renderChat() {
    const thread = document.getElementById('chatThread');
    if (!thread) return;
    const messages = this.getStored(this.storageKeys.chat);
    thread.innerHTML = messages.map((message) => `
      <div class="chat-row ${message.role === 'assistant' ? 'assistant' : 'user'}">
        <div class="chat-bubble">${message.text}</div>
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
