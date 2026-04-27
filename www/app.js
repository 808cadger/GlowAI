'use strict';

window.glowaiApp = {
  currentPage: 'home',
  currentService: 'brows',
  latestScan: null,
  tryonState: {
    mode: 'brows',
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
  },

  focusContent: {
    brows: {
      label: 'Eyebrow Studio',
      title: 'Shape, tint, and map brows before booking.',
      description: 'Preview soft arch, bold sculpt, and cleanup options with camera guidance and a service recommendation path.',
      points: ['Shape analysis', 'Tint planning', 'Artist match'],
      heroTitle: 'Brows after the skin baseline.',
      heroCopy: 'Use the current scan to decide how much prep the complexion needs before shape framing and glam timing lock in.',
      previewLabel: 'Selected service',
      previewTitle: 'Eyebrow design studio',
      previewBody: 'Shape mapping, tint guidance, and cleanup timing built around face framing.',
      previewTone: 'Warm sculpt',
      previewCTA: 'Open details',
      detailTitle: 'Eyebrow design studio',
      detailSubtitle: 'Shape mapping, tint guidance, and cleanup timing built around face framing.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Soft sculpt with polished framing.',
      detailMoodBody: 'Use brows as the anchor for the whole look. Start here when you want stronger definition, cleaner symmetry, and a service that immediately changes the way the rest of the beauty plan feels.',
      detailTags: ['Shape mapping', 'Tint edit', 'Artist fit'],
      detailList: ['Ideal for weddings, dinners, and polished day looks', 'Helps frame makeup and hair choices more clearly', 'Works best when booked before glam and final styling'],
      detailCTA: 'Book brow studio',
      favoriteTitle: 'Brows first with soft glam follow-up',
      favoriteSummary: 'Clean brow framing before makeup, with prep timed to keep the look polished and lifted.',
    },
    nails: {
      label: 'Nail Bar',
      title: 'Try nail length, finish, and color direction first.',
      description: 'Move from quick neutrals to full statement sets with saved inspiration and direct booking into manicure services.',
      points: ['Color preview', 'Set inspiration', 'Rebook favorites'],
      heroTitle: 'Nails support the final look.',
      heroCopy: 'Use the scan to keep skin prep realistic, then choose finish, color, and set direction around the event plan.',
      previewLabel: 'Selected service',
      previewTitle: 'Manicure mood board',
      previewBody: 'Move from neutrals to statement sets with clearer finish direction and rebooking logic.',
      previewTone: 'Gloss focus',
      previewCTA: 'Open details',
      detailTitle: 'Manicure mood board',
      detailSubtitle: 'Move from neutrals to statement sets with clearer finish and rebooking direction.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Set the mood from the fingertips out.',
      detailMoodBody: 'Use nails to establish texture, finish, and color energy early. A strong nail choice makes outfit direction and makeup tone feel easier to settle.',
      detailTags: ['Color preview', 'Finish compare', 'Rebook favorites'],
      detailList: ['Best when you want one beauty detail to lead the whole look', 'Great for event planning and repeat salon visits', 'Easy to pair with soft glam or stronger fashion direction'],
      detailCTA: 'Reserve nail set',
      favoriteTitle: 'Gloss nails with soft evening glam',
      favoriteSummary: 'A polished manicure path that keeps the rest of the beauty look clean, tonal, and event-ready.',
    },
    tryon: {
      label: 'Style Try-On',
      title: 'Coordinate outfits with the rest of the beauty look.',
      description: 'Use virtual try-on as part of a complete glam plan so clothing, makeup, brows, and nails feel aligned.',
      points: ['Outfit pairing', 'Event styling', 'Look saves'],
      heroTitle: 'Style direction comes after skin context.',
      heroCopy: 'Set silhouette and palette once the skin plan is clear so glam, hair, and nails support the same final impression.',
      previewLabel: 'Selected service',
      previewTitle: 'Clothes and look try-on',
      previewBody: 'Pair outfit direction with makeup and nails so the whole look feels intentional before booking.',
      previewTone: 'Style sync',
      previewCTA: 'Open details',
      detailTitle: 'Clothes and look try-on',
      detailSubtitle: 'Pair outfit direction with makeup and nails so the whole look feels intentional.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Choose the silhouette, then style everything else around it.',
      detailMoodBody: 'Try-on becomes more useful when it does not live alone. Use it to decide whether the beauty look should go softer, sharper, cleaner, or more dramatic.',
      detailTags: ['Outfit pairing', 'Palette lock', 'Look saves'],
      detailList: ['Best for weddings, parties, shoots, and big nights out', 'Useful when you are between two styling directions', 'Helps hair and makeup feel matched instead of random'],
      detailCTA: 'Save styled look',
      favoriteTitle: 'Outfit-led beauty direction',
      favoriteSummary: 'Use the dress or outfit first, then let GlowAI align makeup, hair, nails, and prep around it.',
    },
    makeup: {
      label: 'Makeup Lounge',
      title: 'Compare glam directions before you sit in the chair.',
      description: 'Help users explore soft glam, bridal, editorial, and day-to-night looks with artist and timing guidance.',
      points: ['Finish selection', 'Artist guidance', 'Look comparison'],
      heroTitle: 'Makeup works better with scan-led prep.',
      heroCopy: 'Use the latest skin read to decide whether the finish should stay dewy, satin, brightening, or coverage-focused.',
      previewLabel: 'Selected service',
      previewTitle: 'Soft glam planner',
      previewBody: 'Compare finish directions and move users toward the right artist, timing, and event makeup energy.',
      previewTone: 'Finish edit',
      previewCTA: 'Open details',
      detailTitle: 'Soft glam planner',
      detailSubtitle: 'Compare finish directions and move toward the right artist, timing, and event makeup energy.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Decide the finish before the rest of the beauty plan hardens.',
      detailMoodBody: 'Soft glam, bridal polish, editorial shine, or clean skin-forward makeup all pull the rest of the beauty stack in different directions. Use this page to settle that decision early.',
      detailTags: ['Finish selection', 'Artist guidance', 'Look comparison'],
      detailList: ['Best when the makeup look is the centerpiece', 'Pairs well with saved outfit and brow decisions', 'Useful for timing estimates and artist matching'],
      detailCTA: 'Plan glam session',
      favoriteTitle: 'Soft glam with skin-led prep',
      favoriteSummary: 'A smooth, polished glam plan that keeps brows, prep, and final finish aligned.',
    },
    skin: {
      label: 'Skin Prep',
      title: 'Keep scan and care planning as the beauty base layer.',
      description: 'The current scan foundation should support prep and treatment recommendations as part of a full salon journey.',
      points: ['Skin scan', 'Prep routine', 'Treatment fit'],
      heroTitle: 'Prep starts with measurable skin signals.',
      heroCopy: 'Lead with camera-guided prep so routines, products, and service timing respond to hydration, tone, clarity, and texture.',
      previewLabel: 'Selected service',
      previewTitle: 'Skin scan and prep',
      previewBody: 'Keep scan-led prep as one strong module inside the broader beauty flow rather than the whole identity.',
      previewTone: 'Prep layer',
      previewCTA: 'Open details',
      detailTitle: 'Skin scan and prep',
      detailSubtitle: 'Keep scan-led prep as one strong module inside the broader beauty flow.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Prep the skin so the entire look lands better.',
      detailMoodBody: 'Skin prep should make the rest of the services easier. Use scan-led planning to decide timing, hydration, recovery, and what to avoid right before the event.',
      detailTags: ['Skin scan', 'Prep routine', 'Treatment fit'],
      detailList: ['Best started before any makeup-heavy event week', 'Helps avoid overdoing treatments too close to the date', 'Supports brow, glam, and hair planning with better timing'],
      detailCTA: 'Start skin prep',
      favoriteTitle: 'Prep-first beauty week',
      favoriteSummary: 'Use skin as the base layer so makeup, brows, and hair all sit better on the final event day.',
    },
    hair: {
      label: 'Hair Lounge',
      title: 'Pair styling services with the rest of the event look.',
      description: 'Organize blowouts, silk press, curl sets, and finish work inside the same planning flow as glam and outfit choices.',
      points: ['Style preview', 'Care notes', 'Return booking'],
      heroTitle: 'Hair is the final polish.',
      heroCopy: 'Use hair as the finishing layer after scan-led prep, makeup timing, and event styling are settled.',
      previewLabel: 'Selected service',
      previewTitle: 'Style and finish lounge',
      previewBody: 'Bring blowouts, curls, and finish work into the same planning stack as glam so the look lands cohesively.',
      previewTone: 'Finish motion',
      previewCTA: 'Open details',
      detailTitle: 'Style and finish lounge',
      detailSubtitle: 'Bring blowouts, curls, and finish work into the same planning stack as glam.',
      detailMoodLabel: 'GlowAI edit',
      detailMoodTitle: 'Finish with shape, movement, and timing.',
      detailMoodBody: 'Hair often lands last, but it changes everything. Use this page to decide whether the look needs soft movement, polished structure, or a cleaner return-to-salon plan.',
      detailTags: ['Style preview', 'Care notes', 'Return booking'],
      detailList: ['Best when hair needs to harmonize with outfit neckline and glam', 'Useful for timing around makeup and prep services', 'Supports repeat styling and maintenance planning'],
      detailCTA: 'Book hair finish',
      favoriteTitle: 'Finish-first hair timing',
      favoriteSummary: 'A polished hair finish plan that works with outfit shape, makeup timing, and repeat salon visits.',
    },
  },

  init() {
    this.ensureSeedData();
    this.bindMenu();
    this.bindPageButtons();
    this.bindFocusTabs();
    this.bindServiceCards();
    this.bindBookingFlow();
    this.bindFavorites();
    this.bindChat();
    this.bindScan();
    this.bindTryOn();
    this.bindAvatarSkills();
    this.renderFocus('brows');
    this.renderFavorites();
    this.renderBookings();
    this.renderChat();
    this.renderScanSummary();
    this.showPage('home');
  },

  ensureSeedData() {
    if (!localStorage.getItem(this.storageKeys.chat)) {
      const seeded = [
        { role: 'assistant', text: "Hi! I'm your GlowAI beauty coach — part esthetician, part product expert, part salon director. Tell me what's going on with your skin or what look you're going for, and I'll ask a few quick questions before giving you a real plan." },
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

    const systemPrompt = `You are GlowAI, a world-class beauty coach and product advisor. You have the combined expertise of a licensed esthetician, cosmetic chemist, and luxury salon director.

Your coaching style:
- Ask ONE targeted question at a time to understand the person before recommending
- Cover: skin type (dry/oily/combo/sensitive/normal), top concerns (acne, aging, hyperpigmentation, texture, redness, dryness), current routine, lifestyle (how much time, budget range), climate/environment, any allergies or sensitivities
- After 2-3 questions, deliver a SPECIFIC plan: exact product types + ingredient recommendations (like "a vitamin C serum with 15% L-ascorbic acid"), morning vs night routines, order of application, frequency
- When asked about beauty services (brows, nails, glam, hair): give pro-level advice on prep, timing, what to avoid beforehand, how to maintain results
- Recommend product TYPES and key ingredients — not just brand names, so the advice stays useful and budget-flexible. When you do name brands, give options across price points (drugstore + mid + luxury)
- Be direct, warm, and specific. No generic "everyone's skin is different" hedging — ask the follow-up questions to get specific, then commit to a recommendation
- Keep responses concise: 2-4 sentences of coaching + a clear next question or action`;

    try {
      const res = await window.ClaudeAPI.call(apiKey, {
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages: apiMessages,
      });
      const reply = res.content?.[0]?.text || 'Something went wrong — try again.';
      this.pushAssistantMessage(reply);
    } catch (err) {
      const msg = err.status === 401
        ? 'Invalid API key — check your key in the bar above.'
        : err.circuitOpen
          ? 'Too many errors — wait a minute and try again.'
          : `Coach error: ${err.message}`;
      this.pushAssistantMessage(msg);
    } finally {
      if (typingEl) typingEl.classList.add('hidden');
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.disabled = false;
    }
  },

  bindScan() {
    document.getElementById('homeStartScan')?.addEventListener('click', () => {
      this.showPage('scan');
      this.setScanStatus('Opening camera', 'Launching the front camera now. Hold the phone steady and keep your face centered.');
      window.scanModule?.startScan?.();
    });

    document.getElementById('scanLaunch')?.addEventListener('click', () => {
      this.setScanStatus('Opening camera', 'Launching the front camera now. Hold the phone steady and keep your face centered.');
      window.scanModule?.startScan?.();
    });
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
    if (pageId === 'concierge') this.renderChat();
    if (pageId === 'scan') this.renderScanSummary();

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
      const supportsSelfieTryOn = key === 'brows';
      tryOnCTA.classList.toggle('hidden', !supportsSelfieTryOn);
      tryOnCTA.setAttribute('data-open-tryon', key);
      tryOnCTA.textContent = 'Try on from selfie';
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
    const enabled = key === 'brows' || key === 'nails';

    studio?.classList.toggle('hidden', !enabled);
    if (!enabled) return;

    this.tryonState.mode = key;
    if (label) label.textContent = key === 'brows' ? 'Eyebrow try-on' : 'Nail try-on';
    if (title) title.textContent = key === 'brows' ? 'Compare brow shapes on your face.' : 'Preview color and length on your hand.';
    if (placeholderTitle) placeholderTitle.textContent = key === 'brows' ? 'Take a selfie for brow mapping.' : 'Take a hand photo for nail preview.';
    if (placeholderCopy) placeholderCopy.textContent = key === 'brows'
      ? 'Center your face in even light. GlowAI places brows where they are easiest to compare.'
      : 'Place your hand flat in good light. GlowAI overlays the selected manicure set for quick comparison.';
    if (captureBtn) captureBtn.textContent = this.tryonState.photos[key] ? (key === 'brows' ? 'Retake selfie' : 'Retake hand photo') : 'Use camera';
    browControls?.classList.toggle('hidden', key !== 'brows');
    nailControls?.classList.toggle('hidden', key !== 'nails');
    this.renderTryOn();
  },

  async startTryOnCapture() {
    const mode = this.tryonState.mode;
    const facing = mode === 'brows' ? 'front' : 'rear';
    const button = document.getElementById('tryonCaptureBtn');
    if (button) button.textContent = 'Opening...';

    try {
      const capture = await window.scanModule?.captureStudioPhoto?.({ facing });
      if (!capture?.dataUrl) {
        if (button) button.textContent = 'Use camera';
        return;
      }

      this.tryonState.photos[mode] = capture.dataUrl;
      this.renderTryOn();
    } catch {
      this.pushAssistantMessage('Camera did not open for try-on. Check camera permission and try again.');
    } finally {
      if (button) button.textContent = mode === 'brows' ? 'Retake selfie' : 'Retake hand photo';
    }
  },

  renderTryOn() {
    const mode = this.tryonState.mode;
    const stage = document.getElementById('tryonStage');
    const photo = document.getElementById('tryonPhoto');
    const placeholder = document.getElementById('tryonPlaceholder');
    const browOverlay = document.getElementById('browOverlay');
    const nailOverlay = document.getElementById('nailOverlay');

    stage?.setAttribute('data-tryon-mode', mode);
    stage?.setAttribute('data-brow-style', this.tryonState.browStyle);
    stage?.setAttribute('data-nail-length', this.tryonState.nailLength);
    if (stage) {
      stage.style.setProperty('--nail-color', this.tryonState.nailColor);
      stage.style.setProperty('--brow-drag-x', `${this.tryonState.browOffset.x}px`);
      stage.style.setProperty('--brow-drag-y', `${this.tryonState.browOffset.y}px`);
      stage.style.setProperty('--brow-spread', `${this.tryonState.browSpread}px`);
    }

    const activePhoto = this.tryonState.photos[mode] || '';
    const hasPhoto = Boolean(activePhoto);
    if (photo) {
      photo.classList.toggle('hidden', !hasPhoto);
      if (hasPhoto) photo.src = activePhoto;
    }
    placeholder?.classList.toggle('hidden', hasPhoto);
    browOverlay?.classList.toggle('hidden', !hasPhoto || mode !== 'brows');
    nailOverlay?.classList.toggle('hidden', !hasPhoto || mode !== 'nails');

    document.querySelectorAll('[data-brow-style]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-brow-style') === this.tryonState.browStyle);
    });
    document.querySelectorAll('[data-nail-color]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-nail-color') === this.tryonState.nailColor);
    });
    document.querySelectorAll('[data-nail-length]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-nail-length') === this.tryonState.nailLength);
    });
  },

  handleScanCapture(dataUrl) {
    const analysis = this.generateFaceAnalysis();
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
      salonLane: scanRecord.salonLane,
      serviceKey: scanRecord.serviceKey,
      tags: scanRecord.tags,
      steps: scanRecord.steps,
      metrics: scanRecord.metrics,
      routine: scanRecord.routine,
      confidence: scanRecord.confidence,
      safetyNote: scanRecord.safetyNote,
      handoffs: scanRecord.handoffs,
    };
    const scans = this.getStored(this.storageKeys.scans);
    scans.unshift(historyEntry);
    this.latestScan = scanRecord;
    this.trySetStored(this.storageKeys.scans, scans.slice(0, 6));
    this.renderFocus(analysis.serviceKey);
    this.showPage('scan');
    this.setScanStatus('Result ready', `GlowAI found a ${analysis.title.toLowerCase()} pattern and mapped your next step.`);
    this.renderScanSummary();
    this.renderScanHistory();
    this.pushAssistantMessage(`Face scan complete. I’d start with ${analysis.salonLane.toLowerCase()} based on what GlowAI picked up.`);
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

  generateFaceAnalysis() {
    const profiles = [
      {
        title: 'Balanced skin with slight dehydration',
        summary: 'Your skin looks generally balanced, with mild dehydration around the cheeks and a good base for soft glam or prep-first services.',
        tags: ['Hydration', 'Soft texture', 'Prep ready'],
        steps: ['Start with hydration and barrier support before makeup-heavy services', 'Use a gentle humectant serum before moisturizer and SPF', 'Keep exfoliation minimal if the event is close'],
        salonLane: 'Skin Prep',
        serviceKey: 'skin',
        metrics: { balance: '82%', hydration: '68%', clarity: '79%', texture: '76%', tone: '81%', oil: '72%' },
        routine: { morning: 'Gentle cleanse, hyaluronic serum, moisturizer, SPF 30+', night: 'Cleanse, ceramide cream, no exfoliation tonight' },
        confidence: '84%',
        safetyNote: 'Routine',
        handoffs: ['Coach builds a barrier-support routine', 'Progress tracker saves this as the baseline', 'Scheduler suggests prep before glam'],
      },
      {
        title: 'Brightness loss with texture focus',
        summary: 'GlowAI picked up mild texture and uneven brightness, which makes skin prep the clearest first move before the full salon flow.',
        tags: ['Texture', 'Brightness', 'Calm prep'],
        steps: ['Prioritize barrier-friendly brightening before finish-heavy services', 'Use niacinamide or azelaic acid on non-exfoliation nights', 'Save glam and hair after the prep window'],
        salonLane: 'Skin Prep',
        serviceKey: 'skin',
        metrics: { balance: '74%', hydration: '63%', clarity: '66%', texture: '61%', tone: '65%', oil: '70%' },
        routine: { morning: 'Cleanse, niacinamide, moisturizer, SPF 50', night: 'Cleanse, barrier cream, pause harsh scrubs' },
        confidence: '76%',
        safetyNote: 'Prep first',
        handoffs: ['Coach avoids aggressive exfoliation', 'Progress tracker watches tone and texture', 'Scheduler puts skin prep before event services'],
      },
      {
        title: 'Strong frame for brows and polished glam',
        summary: 'Your features would respond well to clean brow framing and a polished glam finish, with skin prep as support rather than the headline.',
        tags: ['Brows', 'Framing', 'Glam ready'],
        steps: ['Start with brow shaping or cleanup first', 'Use light prep and avoid overloading the skin right before glam', 'Keep SPF and moisturizer steady so makeup sits evenly'],
        salonLane: 'Eyebrow Studio',
        serviceKey: 'brows',
        metrics: { balance: '88%', hydration: '72%', clarity: '84%', texture: '80%', tone: '83%', oil: '77%' },
        routine: { morning: 'Cleanse, lightweight moisturizer, SPF 30+', night: 'Cleanse, calming serum, moisturizer' },
        confidence: '89%',
        safetyNote: 'Routine',
        handoffs: ['Coach keeps care simple before glam', 'Progress tracker monitors hydration', 'Scheduler pairs brows before makeup'],
      },
    ];

    return profiles[Math.floor(Math.random() * profiles.length)];
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
    const salonCTA = document.getElementById('scanSalonCTA');
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
      return;
    }

    if (title) title.textContent = latest.title;
    if (summary) summary.textContent = latest.summary;
    if (badge) badge.textContent = 'Ready';
    if (heroTitle) heroTitle.textContent = latest.title;
    if (heroCopy) heroCopy.textContent = latest.summary;
    if (salonCTA) salonCTA.textContent = `Open ${latest.salonLane}`;
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
        <p class="card-label">${scan.salonLane}</p>
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

  setScanStatus(titleText, copyText) {
    const title = document.getElementById('scanStatusTitle');
    const copy = document.getElementById('scanStatusCopy');
    const pill = document.getElementById('scanStatusPill');
    if (title) title.textContent = titleText;
    if (copy) copy.textContent = copyText;
    if (pill) pill.textContent = titleText;
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
// Aloha from Pearl City! GlowAI beauty coach — powered by Claude Sonnet 4.6

document.addEventListener('DOMContentLoaded', () => window.glowaiApp.init());
