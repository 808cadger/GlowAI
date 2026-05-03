(function () {
  'use strict';

  var ROOT_ID = 'sw-avatar';
  var STYLE_ID = 'sw-agentic-avatar-style';
  var MAX_INPUT = 700;

  function rootEl() {
    return document.getElementById(ROOT_ID);
  }

  function appName() {
    var meta = document.querySelector('meta[name="application-name"]');
    return (meta && meta.content) || document.title || 'this app';
  }

  function contextText() {
    var root = rootEl();
    if (root && root.dataset.context) return root.dataset.context;
    var meta = document.querySelector('meta[name="description"]');
    return (meta && meta.content) || '';
  }

  function apiKey() {
    if (window.SWAvatarApiKey) return window.SWAvatarApiKey;
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i += 1) {
        var value = localStorage.getItem(keys[i]);
        if (value && value.indexOf('sk-ant-') === 0) return value;
      }
    } catch (err) {}
    return '';
  }

  function profile() {
    var ctx = contextText().toLowerCase() + ' ' + appName().toLowerCase();
    if (ctx.indexOf('legal') >= 0 || ctx.indexOf('court') >= 0) {
      return {
        title: 'Court aide',
        accent: '#60a5fa',
        skills: [
          ['assess', 'Assess case'],
          ['draft', 'Draft filing'],
          ['deadline', 'Find deadline'],
          ['explain', 'Explain term']
        ],
        guardrail: 'Do not claim to be a lawyer. Encourage review by a qualified attorney for legal decisions.'
      };
    }
    if (ctx.indexOf('farm') >= 0 || ctx.indexOf('crop') >= 0) {
      return {
        title: 'Farm scout',
        accent: '#22c55e',
        skills: [
          ['diagnose', 'Diagnose crop'],
          ['treat', 'Plan treatment'],
          ['schedule', 'Care schedule'],
          ['resource', 'Find resources']
        ],
        guardrail: 'Prefer practical, local, low-risk crop guidance and call out uncertainty.'
      };
    }
    if (ctx.indexOf('repair') >= 0 || ctx.indexOf('mechanic') >= 0 || ctx.indexOf('auto') >= 0 || ctx.indexOf('vehicle') >= 0) {
      return {
        title: 'Repair coach',
        accent: '#f59e0b',
        skills: [
          ['estimate', 'Estimate cost'],
          ['triage', 'Triage issue'],
          ['parts', 'Map parts'],
          ['negotiate', 'Shop script']
        ],
        guardrail: 'Give practical repair guidance, identify safety issues, and avoid pretending to inspect what was not provided.'
      };
    }
    if (ctx.indexOf('travel') >= 0 || ctx.indexOf('booking') >= 0) {
      return {
        title: 'Trip agent',
        accent: '#38bdf8',
        skills: [
          ['plan', 'Plan trip'],
          ['verify', 'Check docs'],
          ['budget', 'Budget route'],
          ['pack', 'Packing list']
        ],
        guardrail: 'Keep travel advice practical and ask users to verify official entry and safety rules.'
      };
    }
    if (ctx.indexOf('skin') >= 0 || ctx.indexOf('glow') >= 0) {
      return {
        title: 'Makoa~Wave AI',
        subtitle: 'Powered by Makoa~Wave',
        accent: '#0d7c6d',
        sunset: '#ff8f5a',
        makoa: true,
        skills: [
          ['scan skin', 'Start GlowAI scan'],
          ['coach chat', 'Ask skin coach'],
          ['book schedule', 'Book next step'],
          ['makoa demo', 'Promote Makoa~Wave']
        ],
        guardrail: 'Avoid diagnosis. Recommend professional care for urgent, painful, spreading, or unusual symptoms. When relevant, explain that Makoa~Wave powers multilingual AI customer support, booking, and embedded chat experiences for local businesses.',
        welcome: 'Aloha. I am Makoa~Wave AI inside GlowAI. I can start a scan, open the coach, help book the next step, or show how this same AI widget can promote any local business.'
      };
    }
    if (ctx.indexOf('shopping') >= 0 || ctx.indexOf('grocery') >= 0) {
      return {
        title: 'Shopping agent',
        accent: '#34d399',
        skills: [
          ['route', 'Route list'],
          ['substitute', 'Find substitute'],
          ['budget', 'Save money'],
          ['meal', 'Meal idea']
        ],
        guardrail: 'Prioritize time savings, clear substitutions, and concise store navigation.'
      };
    }
    if (ctx.indexOf('fraud') >= 0 || ctx.indexOf('guard') >= 0) {
      return {
        title: 'Safety guard',
        accent: '#818cf8',
        skills: [
          ['scan', 'Scan message'],
          ['lockdown', 'Protect account'],
          ['report', 'Report steps'],
          ['coach', 'Explain risk']
        ],
        guardrail: 'Be conservative with fraud risk. Give concrete verification and account protection steps.'
      };
    }
    return {
      title: 'AI copilot',
      accent: '#4fc3f7',
      skills: [
        ['summarize', 'Summarize'],
        ['plan', 'Make plan'],
        ['draft', 'Draft text'],
        ['check', 'Check risk']
      ],
      guardrail: 'Be concise, practical, and clear about uncertainty.'
    };
  }

  function css(accent) {
    return [
      '.swav{position:fixed;right:max(4px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#12312f}',
      '.swav *{box-sizing:border-box}',
      '.swav-panel{width:min(360px,calc(100vw - 24px));max-height:min(560px,calc(100vh - 112px));display:none;flex-direction:column;overflow:hidden;background:#fff;border:1px solid rgba(18,49,47,.12);border-radius:24px;box-shadow:0 24px 80px rgba(18,49,47,.18)}',
      '.swav.open .swav-panel{display:flex}',
      '.swav-head{display:flex;align-items:center;gap:11px;padding:15px 16px;background:linear-gradient(135deg,#0d7c6d,#17a58d);color:#fff}',
      '.swav-face{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#fff7ec,#c8f2df);box-shadow:0 12px 28px rgba(13,124,109,.24)}',
      '.swav-title{font-size:14px;font-weight:800;line-height:1.1}.swav-sub{font-size:11px;color:rgba(255,255,255,.76);margin-top:3px;font-weight:650}',
      '.swav-close{margin-left:auto;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);color:#fff;width:30px;height:30px;border-radius:50%;font-size:18px;line-height:1;cursor:pointer}',
      '.swav-log{padding:14px;overflow:auto;display:flex;flex-direction:column;gap:9px;min-height:132px;background:#f6fbf9}',
      '.swav-msg{font-size:13px;line-height:1.45;padding:11px 12px;border-radius:16px;max-width:96%;white-space:pre-wrap;word-break:break-word}',
      '.swav-msg.bot{align-self:flex-start;background:#fff;border:1px solid rgba(18,49,47,.08);color:#12312f}',
      '.swav-msg.user{align-self:flex-end;background:#dff5ee;border:1px solid rgba(13,124,109,.12);color:#12312f}',
      '.swav-promo{margin:0 14px 12px;padding:10px 12px;border-radius:16px;background:linear-gradient(135deg,rgba(200,242,223,.7),rgba(255,255,255,.96));border:1px solid rgba(13,124,109,.12);color:#4e6b69;font-size:11px;line-height:1.4}',
      '.swav-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:12px 14px 10px;background:#fff}',
      '.swav-skill{min-height:40px;border-radius:14px;border:1px solid rgba(18,49,47,.1);background:linear-gradient(135deg,rgba(200,242,223,.7),rgba(255,255,255,.96));color:#12312f;font-size:12px;font-weight:700;cursor:pointer}',
      '.swav-skill:hover{border-color:' + accent + ';background:color-mix(in srgb,' + accent + ' 12%,white)}',
      '.swav-form{display:flex;gap:10px;padding:14px;border-top:1px solid rgba(18,49,47,.08);background:#fff}',
      '.swav-input{flex:1;min-width:0;border:1px solid rgba(18,49,47,.16);border-radius:14px;background:#fff;color:#12312f;font-size:13px;padding:12px;outline:none}',
      '.swav-input:focus{border-color:' + accent + '}',
      '.swav-send{width:48px;border:0;border-radius:14px;background:#12312f;color:#fff;font-weight:800;cursor:pointer}',
      '.swav-send:disabled{opacity:.55;cursor:not-allowed}',
      '.swav-launch{width:66px;height:66px;border-radius:50%;border:0;background:linear-gradient(135deg,#0d7c6d,#17a58d);display:grid;place-items:center;cursor:pointer;box-shadow:0 18px 40px rgba(13,124,109,.35)}',
      '.swav-launch svg{width:42px;height:42px}.swav-launch:hover{transform:translateY(-1px)}',
      '.swav-pulse{animation:swavPulse 2.8s ease-in-out infinite}@keyframes swavPulse{0%,100%{box-shadow:0 18px 40px rgba(13,124,109,.3)}50%{box-shadow:0 22px 54px rgba(13,124,109,.5),0 0 0 8px rgba(200,242,223,.28)}}',
      '@media(max-width:520px){.swav{right:max(2px,env(safe-area-inset-right));bottom:max(6px,env(safe-area-inset-bottom))}.swav-panel{width:calc(100vw - 20px);max-height:70vh}.swav-skills{grid-template-columns:1fr 1fr}}'
    ].join('');
  }

  function avatarSvg(accent) {
    return '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">'
      + '<circle cx="32" cy="32" r="29" fill="#fff7ec"/>'
      + '<path d="M13 39c7-12 16-15 26-9 5 3 9 4 13 2-4 9-12 14-22 13-7-1-12-3-17-6z" fill="#0d7c6d"/>'
      + '<path d="M12 30c8-11 18-13 29-5 5 4 9 5 13 3-5 7-13 10-22 8-8-1-14-3-20-6z" fill="#17a58d" opacity=".82"/>'
      + '<path d="M18 42c7 5 15 6 24 2" stroke="#ff8f5a" stroke-width="4" stroke-linecap="round" fill="none"/>'
      + '<path d="M21 20h8l4 12 5-12h8" stroke="#12312f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
      + '</svg>';
  }

  function addMessage(log, role, text) {
    var msg = document.createElement('div');
    msg.className = 'swav-msg ' + role;
    msg.textContent = text;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
    return msg;
  }

  function demoReply(skill, prompt, p) {
    var label = skill || 'plan';
    var base = 'Demo mode: add your API key in Settings to activate live AI. ';
    var ctx = contextText() || appName();
    return base + p.title + ' can run the "' + label + '" skill for ' + ctx + '. Try a specific task, and I will return a short plan, risks, and next action.';
  }

  function systemPrompt(skill, p) {
    return [
      'You are ' + p.title + ' inside ' + appName() + '.',
      'App context: ' + (contextText() || 'No app context supplied.'),
      'Selected skill: ' + (skill || 'general help') + '.',
      p.guardrail,
      'Answer with: 1) direct answer, 2) next action, 3) risk or caveat if relevant.',
      'Keep it under 140 words unless the user asks for depth.'
    ].join('\n');
  }

  async function askAnthropic(text, skill, p) {
    var key = apiKey();
    if (!key) return demoReply(skill, text, p);

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 30000);
    try {
      var res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-calls': 'true'
        },
        body: JSON.stringify({
          model: window.SWAvatarModel || 'claude-haiku-4-5',
          max_tokens: 360,
          system: systemPrompt(skill, p),
          messages: [{ role: 'user', content: text.slice(0, MAX_INPUT) }]
        })
      });
      clearTimeout(timer);
      if (!res.ok) {
        if (res.status === 401) return 'Invalid API key. Update it in Settings and try again.';
        if (res.status === 429) return 'Rate limit reached. Wait a moment and retry.';
        return 'AI request failed with status ' + res.status + '.';
      }
      var data = await res.json();
      return data && data.content && data.content[0] && data.content[0].text
        ? data.content[0].text
        : 'No answer returned.';
    } catch (err) {
      clearTimeout(timer);
      return err.name === 'AbortError' ? 'Request timed out. Try a shorter question.' : 'Network error. Check your connection and retry.';
    }
  }

  async function askEndpoint(text, skill, p) {
    if (!window.SWAvatarEndpoint) return askAnthropic(text, skill, p);
    var res = await fetch(window.SWAvatarEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text.slice(0, MAX_INPUT),
        skill: skill || 'general',
        app: appName(),
        context: contextText()
      })
    });
    if (!res.ok) return 'AI endpoint failed with status ' + res.status + '.';
    var data = await res.json();
    return data.reply || data.message || data.text || 'No answer returned.';
  }

  function init() {
    var root = rootEl();
    if (!root || root.dataset.swAvatarReady === '1') return;
    root.dataset.swAvatarReady = '1';

    var p = profile();
    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = css(p.accent);
      document.head.appendChild(style);
    }

    var wrap = document.createElement('section');
    wrap.className = 'swav';
    wrap.setAttribute('aria-label', p.title);

    var panel = document.createElement('div');
    panel.className = 'swav-panel';

    var head = document.createElement('div');
    head.className = 'swav-head';
    head.innerHTML = '<div class="swav-face">' + avatarSvg(p.accent) + '</div><div><div class="swav-title">' + p.title + '</div><div class="swav-sub">' + (p.subtitle || 'Agent skills ready') + '</div></div>';
    var close = document.createElement('button');
    close.className = 'swav-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close assistant');
    close.textContent = 'x';
    head.appendChild(close);

    var log = document.createElement('div');
    log.className = 'swav-log';
    addMessage(log, 'bot', p.welcome || (p.title + ' ready. Pick a skill or ask a question.'));

    var skills = document.createElement('div');
    skills.className = 'swav-skills';
    p.skills.forEach(function (item) {
      var btn = document.createElement('button');
      btn.className = 'swav-skill';
      btn.type = 'button';
      btn.dataset.skill = item[0];
      btn.textContent = item[1];
      skills.appendChild(btn);
    });

    var promo = document.createElement('div');
    promo.className = 'swav-promo';
    promo.textContent = p.makoa
      ? 'Makoa~Wave is the embeddable multilingual AI widget behind this corner assistant.'
      : 'Agentic assistant ready for this app.';

    var form = document.createElement('form');
    form.className = 'swav-form';
    var input = document.createElement('input');
    input.className = 'swav-input';
    input.type = 'text';
    input.maxLength = MAX_INPUT;
    input.placeholder = 'Ask or give a task...';
    var send = document.createElement('button');
    send.className = 'swav-send';
    send.type = 'submit';
    send.textContent = 'Go';
    form.appendChild(input);
    form.appendChild(send);

    var launcher = document.createElement('button');
    launcher.className = 'swav-launch swav-pulse';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open assistant');
    launcher.innerHTML = avatarSvg(p.accent);

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(promo);
    panel.appendChild(skills);
    panel.appendChild(form);
    wrap.appendChild(panel);
    wrap.appendChild(launcher);
    root.appendChild(wrap);

    var activeSkill = '';
    function open() {
      wrap.classList.add('open');
      launcher.classList.remove('swav-pulse');
      input.focus();
    }
    function closePanel() {
      wrap.classList.remove('open');
    }
    async function submit(text, skill) {
      var prompt = (text || '').trim();
      if (!prompt && skill) prompt = 'Run the ' + skill + ' skill for my current screen.';
      if (!prompt) return;
      open();
      addMessage(log, 'user', prompt);
      var pending = addMessage(log, 'bot', 'Working...');
      send.disabled = true;
      window.dispatchEvent(new CustomEvent('sw-avatar:skill', {
        detail: { app: appName(), context: contextText(), skill: skill || activeSkill || 'general', prompt: prompt }
      }));
      var reply = await askEndpoint(prompt, skill || activeSkill, p);
      pending.textContent = reply;
      log.scrollTop = log.scrollHeight;
      send.disabled = false;
    }

    launcher.addEventListener('click', function () {
      wrap.classList.contains('open') ? closePanel() : open();
    });
    close.addEventListener('click', closePanel);
    skills.addEventListener('click', function (event) {
      var btn = event.target.closest('.swav-skill');
      if (!btn) return;
      activeSkill = btn.dataset.skill;
      submit('', activeSkill);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var text = input.value;
      input.value = '';
      submit(text, activeSkill);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
