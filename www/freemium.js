/* GlowAI — freemium.js
   Scan gate, upgrade modal, scan-reactive avatar, salon analytics dashboard. */
;(function () {
  'use strict';

  var FREE_LIMIT = 3;
  var MONTH_PREFIX = 'glowai_scans_';
  var UNLOCK_KEY   = 'glowai_freemium_unlocked';
  var SCANS_KEY    = 'glowai_scans';

  // ── localStorage helpers ──────────────────────────────────────────────────

  function monthKey() {
    var d = new Date();
    return MONTH_PREFIX + d.getFullYear() + '_' + (d.getMonth() + 1);
  }

  function getScanCount() {
    try { return parseInt(localStorage.getItem(monthKey()) || '0', 10); } catch (e) { return 0; }
  }

  function incrementScanCount() {
    try { localStorage.setItem(monthKey(), getScanCount() + 1); } catch (e) {}
  }

  function isUnlocked() {
    try { return localStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; }
  }

  function canScan() {
    return isUnlocked() || getScanCount() < FREE_LIMIT;
  }

  function getScanHistory() {
    try { return JSON.parse(localStorage.getItem(SCANS_KEY) || '[]'); } catch (e) { return []; }
  }

  // ── Freemium badge ────────────────────────────────────────────────────────

  function updateBadge() {
    var badge = document.getElementById('freemiumBadge');
    var dots  = document.getElementById('freemiumDots');
    if (!badge) return;

    var used     = getScanCount();
    var unlocked = isUnlocked();

    var upgradeBtn = document.getElementById('freemiumUpgradeBtn');
    if (unlocked) {
      badge.textContent = 'Unlimited';
      badge.className = 'freemium-badge is-unlocked';
      if (dots) dots.innerHTML = '';
      if (upgradeBtn) upgradeBtn.classList.add('hidden');
      return;
    }
    if (upgradeBtn) upgradeBtn.classList.remove('hidden');

    var remaining = Math.max(0, FREE_LIMIT - used);
    if (remaining === 0) {
      badge.textContent = 'Free limit reached';
      badge.className = 'freemium-badge is-empty';
    } else if (remaining === 1) {
      badge.textContent = '1 free scan left';
      badge.className = 'freemium-badge is-low';
    } else {
      badge.textContent = remaining + ' free scans left';
      badge.className = 'freemium-badge';
    }

    if (dots) {
      dots.innerHTML = Array.from({ length: FREE_LIMIT }, function (_, i) {
        var cls = i < used ? 'freemium-dot is-used' : 'freemium-dot is-remaining';
        return '<span class="' + cls + '"></span>';
      }).join('');
    }
  }

  // ── Upgrade modal ─────────────────────────────────────────────────────────

  function showUpgradeModal() {
    var el = document.getElementById('upgradeModalBackdrop');
    if (el) {
      el.classList.remove('hidden');
      var count = document.getElementById('upgradeModalCount');
      if (count) count.textContent = getScanCount() + ' of ' + FREE_LIMIT + ' free scans used this month';
    }
  }

  function hideUpgradeModal() {
    var el = document.getElementById('upgradeModalBackdrop');
    if (el) el.classList.add('hidden');
  }

  // ── Avatar skin-state helper ──────────────────────────────────────────────

  function applyAvatarScanState(skinSignals) {
    var intro = document.querySelector('.glow-intro');
    if (!intro || !skinSignals) return;
    intro.classList.remove('scan-oily', 'scan-dry', 'scan-sensitive', 'scan-balanced', 'is-scanning');
    var oil       = skinSignals.oil       || 50;
    var hydration = skinSignals.hydration || 70;
    var redness   = skinSignals.redness   || 0;
    if (oil > 68)          intro.classList.add('scan-oily');
    else if (hydration < 52) intro.classList.add('scan-dry');
    else if (redness > 42)   intro.classList.add('scan-sensitive');
    else                     intro.classList.add('scan-balanced');
  }

  // ── Patch glowaiApp.handleScanCapture ────────────────────────────────────

  function patchScanCapture() {
    var app = window.glowaiApp;
    if (!app || typeof app.handleScanCapture !== 'function') return;

    var orig = app.handleScanCapture.bind(app);

    app.handleScanCapture = function (dataUrl, faceQuality, skinSignals) {
      if (!canScan()) {
        showUpgradeModal();
        return;
      }

      orig(dataUrl, faceQuality, skinSignals);
      incrementScanCount();
      updateBadge();

      // Show radar after scan result renders
      if (skinSignals && window.SkinRadar) {
        setTimeout(function () {
          window.SkinRadar.renderRadar(skinSignals, 'skinRadarContainer');
          var radarWrap = document.getElementById('skinRadarWrap');
          if (radarWrap) radarWrap.classList.remove('hidden');
        }, 350);
      }

      // Avatar reactive glow
      applyAvatarScanState(skinSignals);

      // Refresh salon analytics if panel is visible
      renderSalonAnalytics();
    };
  }

  // ── Intercept scan buttons before camera opens ────────────────────────────

  function patchScanButtons() {
    ['scanFaceNowBtn', 'homeStartScan', 'glowIntroScan'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        if (!canScan()) {
          e.stopImmediatePropagation();
          showUpgradeModal();
        }
      }, true); // capture phase — runs before app.js handlers
    });
  }

  // ── Thinking state while camera runs ─────────────────────────────────────

  function patchScanModule() {
    var mod = window.scanModule;
    if (!mod || typeof mod.startScan !== 'function') return;

    var origStart = mod.startScan;
    mod.startScan = function () {
      var intro = document.querySelector('.glow-intro');
      if (intro) intro.classList.add('is-scanning');
      var result = origStart.apply(this, arguments);
      if (result && typeof result.then === 'function') {
        return result.finally(function () {
          if (intro) intro.classList.remove('is-scanning');
        });
      }
      if (intro) intro.classList.remove('is-scanning');
      return result;
    };
  }

  // ── Upgrade modal button wiring ───────────────────────────────────────────

  function wireUpgradeModal() {
    var btn      = document.getElementById('upgradeModalBtn');
    var skipBtn  = document.getElementById('upgradeModalSkip');
    var backdrop = document.getElementById('upgradeModalBackdrop');
    var errEl    = document.getElementById('upgradeModalError');

    if (btn) {
      btn.addEventListener('click', function () {
        btn.disabled = true;
        btn.textContent = 'Opening checkout…';
        if (errEl) errEl.textContent = '';
        try {
          var userId = localStorage.getItem('glowai_user_id') || 'default';
          var p = window.GlowAIPayments
            ? window.GlowAIPayments.subscribe({ plan: 'freemium_unlock', userId: userId })
            : Promise.reject(new Error('Payment module not loaded'));
          p.catch(function (e) {
            btn.disabled = false;
            btn.textContent = 'Unlock unlimited scans — $4.99';
            if (errEl) errEl.textContent = (e && e.message) || 'Checkout could not start. Try again.';
          });
        } catch (e) {
          btn.disabled = false;
          btn.textContent = 'Unlock unlimited scans — $4.99';
          if (errEl) errEl.textContent = (e && e.message) || 'Checkout could not start. Try again.';
        }
      });
    }

    if (skipBtn) skipBtn.addEventListener('click', hideUpgradeModal);

    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) hideUpgradeModal();
      });
    }
  }

  // ── Handle Stripe redirect back with ?checkout=success ────────────────────

  function checkStripeRedirect() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('checkout') === 'success') {
        localStorage.setItem(UNLOCK_KEY, '1');
        updateBadge();
        var app = window.glowaiApp;
        if (app && typeof app.pushAssistantMessage === 'function') {
          app.pushAssistantMessage('Welcome to GlowAI Unlimited! Your scans are now unrestricted. Let’s do a fresh read whenever you’re ready.');
        }
      }
    } catch (e) {}
  }

  // ── Wire scan-section "Unlock" quick button ───────────────────────────────

  function wireScanBarUpgradeBtn() {
    var btn = document.getElementById('freemiumUpgradeBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (isUnlocked()) return;
      showUpgradeModal();
    });
  }

  // ── Wire existing "Unlock forecasts + reels" button in agents panel ───────

  function wireAgentUnlockBtn() {
    var btn = document.getElementById('unlockForecastsBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (isUnlocked()) {
        var app = window.glowaiApp;
        if (app && typeof app.pushAssistantMessage === 'function') {
          app.pushAssistantMessage('You’re already on GlowAI Unlimited. All scan features are active.');
        }
        return;
      }
      showUpgradeModal();
    });
  }

  // ── Salon analytics ───────────────────────────────────────────────────────

  function renderSalonAnalytics() {
    var scansEl   = document.getElementById('salonScansThisMonth');
    var booksEl   = document.getElementById('salonBookingsTotal');
    var clarityEl = document.getElementById('salonAvgClarity');
    if (!scansEl && !booksEl && !clarityEl) return; // panel not in DOM

    var history = getScanHistory();
    var now     = new Date();
    var ym      = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    // Scans this month (from stored history items)
    var monthScans = history.filter(function (s) {
      return s.createdAt && s.createdAt.startsWith(ym);
    });

    if (scansEl) scansEl.textContent = monthScans.length || getScanCount();

    // Bookings from localStorage
    var bookings = [];
    try { bookings = JSON.parse(localStorage.getItem('glowai_bookings') || '[]'); } catch (e) {}
    if (booksEl) booksEl.textContent = bookings.length;

    // Average clarity from history metrics
    if (clarityEl) {
      var clarityVals = history
        .filter(function (s) { return s.metrics && typeof s.metrics.clarity === 'number'; })
        .map(function (s) { return s.metrics.clarity; });
      if (clarityVals.length) {
        var avg = Math.round(clarityVals.reduce(function (a, b) { return a + b; }, 0) / clarityVals.length);
        clarityEl.textContent = avg + '%';
      } else {
        clarityEl.textContent = '—';
      }
    }

    // 7-day trend bars
    renderTrendBars(history);
  }

  function renderTrendBars(history) {
    var barsEl   = document.getElementById('salonTrendBars');
    var labelsEl = document.getElementById('salonTrendDayLabels');
    if (!barsEl || !labelsEl) return;

    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var now  = new Date();
    var todayDow = now.getDay();

    // Build last-7-days date strings (YYYY-MM-DD)
    var last7 = Array.from({ length: 7 }, function (_, i) {
      var d = new Date(now);
      d.setDate(now.getDate() - 6 + i);
      return {
        date:  d.toISOString().slice(0, 10),
        label: days[d.getDay()],
        isToday: i === 6,
      };
    });

    // Count scans per day
    var counts = last7.map(function (day) {
      return history.filter(function (s) { return s.createdAt && s.createdAt.startsWith(day.date); }).length;
    });

    var maxCount = Math.max.apply(null, counts) || 1;

    barsEl.innerHTML = counts.map(function (c, i) {
      var pct = Math.round((c / maxCount) * 100);
      var todayCls = last7[i].isToday ? ' is-today' : '';
      return '<div class="salon-trend-bar' + todayCls + '" style="height:' + pct + '%"></div>';
    }).join('');

    labelsEl.innerHTML = last7.map(function (day) {
      var todayCls = day.isToday ? ' is-today' : '';
      return '<span class="salon-trend-day' + todayCls + '">' + day.label + '</span>';
    }).join('');
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    checkStripeRedirect();
    updateBadge();
    wireUpgradeModal();
    wireScanBarUpgradeBtn();
    wireAgentUnlockBtn();
    patchScanCapture();
    patchScanButtons();
    patchScanModule();
    renderSalonAnalytics();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.GlowAIFreemium = {
    canScan: canScan,
    getScanCount: getScanCount,
    isUnlocked: isUnlocked,
    showUpgradeModal: showUpgradeModal,
    hideUpgradeModal: hideUpgradeModal,
    updateBadge: updateBadge,
    renderSalonAnalytics: renderSalonAnalytics,
  };
})();
