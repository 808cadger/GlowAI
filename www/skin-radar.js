/* GlowAI — skin-radar.js
   Animated SVG 6-signal radar chart using local camera metrics. */
;(function () {
  'use strict';

  // Six signals matched to scan.js's `skinSignals` object keys
  var SIGNALS = [
    { key: 'hydration', label: 'Hydration', flip: false },
    { key: 'clarity',   label: 'Clarity',   flip: false },
    { key: 'texture',   label: 'Texture',   flip: false },
    { key: 'evenness',  label: 'Tone',      flip: false, fallback: 'tone' },
    { key: 'oil',       label: 'Oil Bal',   flip: true },  // 50 = ideal; deviate = worse
    { key: 'barrier',   label: 'Barrier',   flip: false, fallback: 'moisture' },
  ];

  var SIZE = 200;
  var CX = SIZE / 2;
  var CY = SIZE / 2;
  var R  = SIZE * 0.35;
  var N  = SIGNALS.length;
  var STEP = 360 / N;
  var NS = 'http://www.w3.org/2000/svg';

  function polar(r, angleDeg) {
    var rad = (angleDeg - 90) * Math.PI / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function animPoly(el, from, to, dur) {
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var t = easeOut(Math.min((ts - start) / dur, 1));
      el.setAttribute('points', from.map(function (p, i) {
        return lerp(p.x, to[i].x, t).toFixed(2) + ',' + lerp(p.y, to[i].y, t).toFixed(2);
      }).join(' '));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function animCircles(circles, from, to, dur) {
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var t = easeOut(Math.min((ts - start) / dur, 1));
      circles.forEach(function (c, i) {
        c.setAttribute('cx', lerp(from[i].x, to[i].x, t).toFixed(2));
        c.setAttribute('cy', lerp(from[i].y, to[i].y, t).toFixed(2));
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function scoreFor(sig, signals) {
    var raw = signals[sig.key];
    if (raw == null && sig.fallback) raw = signals[sig.fallback];
    if (raw == null) raw = 65;
    if (sig.flip) {
      // Oil: ideal is 50; spread from 50 lowers the score
      raw = Math.max(0, Math.min(100, 100 - Math.abs(raw - 50) * 2));
    }
    return Math.max(10, Math.min(100, raw));
  }

  function buildSVG(scores) {
    var svg = svgEl('svg', {
      viewBox: '0 0 ' + SIZE + ' ' + SIZE,
      width: SIZE,
      height: SIZE,
      role: 'img',
      'aria-label': 'Skin signal radar',
    });
    svg.classList.add('skin-radar-svg');

    // Grid rings (4 concentric polygons)
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var pts = SIGNALS.map(function (_, i) {
        var p = polar(R * f, i * STEP);
        return p.x.toFixed(2) + ',' + p.y.toFixed(2);
      }).join(' ');
      svg.appendChild(svgEl('polygon', {
        points: pts, fill: 'none',
        stroke: 'rgba(61,32,52,0.09)', 'stroke-width': '1',
      }));
    });

    // Axis spokes
    SIGNALS.forEach(function (_, i) {
      var tip = polar(R, i * STEP);
      svg.appendChild(svgEl('line', {
        x1: CX, y1: CY,
        x2: tip.x.toFixed(2), y2: tip.y.toFixed(2),
        stroke: 'rgba(61,32,52,0.09)', 'stroke-width': '1',
      }));
    });

    // Build center + target point arrays
    var center = SIGNALS.map(function () { return { x: CX, y: CY }; });
    var targets = scores.map(function (s, i) { return polar(R * s / 100, i * STEP); });

    // Data fill polygon — starts from center, animates to targets
    var fill = svgEl('polygon', {
      points: center.map(function (p) { return p.x + ',' + p.y; }).join(' '),
      fill: 'rgba(37,185,154,0.16)',
      stroke: '#25b99a',
      'stroke-width': '2',
      'stroke-linejoin': 'round',
    });
    svg.appendChild(fill);

    // Endpoint dots
    var dots = SIGNALS.map(function (_, i) {
      var dot = svgEl('circle', { cx: CX, cy: CY, r: '3.5', fill: '#25b99a' });
      svg.appendChild(dot);
      return dot;
    });

    // Signal labels (outside the grid)
    SIGNALS.forEach(function (sig, i) {
      var lp = polar(R * 1.3, i * STEP);
      var txt = svgEl('text', {
        x: lp.x.toFixed(2), y: lp.y.toFixed(2),
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-size': '9',
        'font-weight': '800',
        fill: '#4f3946',
        'font-family': 'Avenir Next, Segoe UI, sans-serif',
      });
      txt.textContent = sig.label;
      svg.appendChild(txt);
    });

    // Start animation after a short delay so the element is in the DOM
    setTimeout(function () {
      animPoly(fill, center, targets, 920);
      animCircles(dots, center, targets, 920);
    }, 80);

    return svg;
  }

  function buildSummaryBars(scores, parent) {
    var wrap = document.createElement('div');
    wrap.className = 'radar-summary';

    SIGNALS.forEach(function (sig, i) {
      var score = Math.round(scores[i]);
      var level = score >= 70 ? 'good' : score >= 45 ? 'moderate' : 'low';
      var row = document.createElement('div');
      row.className = 'radar-summary-item';
      row.innerHTML =
        '<span class="radar-label">' + sig.label + '</span>' +
        '<span class="radar-bar-wrap"><span class="radar-bar radar-bar--' + level +
        '" style="width:0%" data-w="' + score + '%"></span></span>' +
        '<span class="radar-score-val">' + score + '</span>';
      wrap.appendChild(row);
    });

    parent.appendChild(wrap);

    // Stagger bar fill after DOM insertion
    setTimeout(function () {
      wrap.querySelectorAll('.radar-bar').forEach(function (bar) {
        bar.style.width = bar.dataset.w;
      });
    }, 140);
  }

  function renderRadar(skinSignals, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var scores = SIGNALS.map(function (sig) { return scoreFor(sig, skinSignals); });
    var svg = buildSVG(scores);

    container.innerHTML = '';
    container.appendChild(svg);
    buildSummaryBars(scores, container);
  }

  window.SkinRadar = { renderRadar: renderRadar };
})();
