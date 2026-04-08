// GlowAI — scan.js  // Aloha from Pearl City! 🌺
// Bundled by esbuild → scan.bundle.js
// #ASSUMPTION: @capacitor/camera v6 installed; esbuild bundles this file.
// #ASSUMPTION: Backend URL stored in localStorage key 'glowai_api_url'.
// #ASSUMPTION: If no API URL set, mock results are shown (demo mode).

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const apiBase   = () => (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
const authToken = () => localStorage.getItem('glowai_token') || 'dev-token';

// ── Camera capture (native) ───────────────────────────────────────────────────
async function capturePhoto() {
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
    saveToGallery: false,
    correctOrientation: true,
  });
  return photo.base64String; // pure base64, no data: prefix
}

// Web / gallery fallback (browser dev or if camera fails)
function capturePhotoWeb() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    // Must be in DOM for Samsung WebView
    input.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0';
    document.body.appendChild(input);
    input.onchange = () => {
      document.body.removeChild(input);
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

// ── POST /api/scan ─────────────────────────────────────────────────────────────
async function callScanAPI(base64Image) {
  const base = apiBase();
  if (!base) throw new Error('NO_API_URL');

  const resp = await fetch(`${base}/api/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken()}`,
    },
    body: JSON.stringify({
      image_base64: base64Image,
      user_id: localStorage.getItem('glowai_user_id') || 'default',
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `API ${resp.status}`);
  }
  return resp.json();
}

// ── Mock results (demo mode when no backend configured) ───────────────────────
const MOCK_RESULTS = [
  {
    skin_type: 'combination',
    issues: ['mild_oiliness', 'uneven_tone', 'enlarged_pores'],
    recommendations: [
      'Use a gentle foaming cleanser morning and night',
      'Apply niacinamide serum to minimize pores',
      'Wear SPF 30+ every day — even indoors',
      'Hydrate with a lightweight, non-comedogenic moisturizer',
    ],
    suggested_appointment: { type: 'Dermatologist', urgency: 'routine', reason: 'Routine skin checkup recommended for combination skin concerns' },
  },
  {
    skin_type: 'dry',
    issues: ['dryness', 'flakiness', 'fine_lines'],
    recommendations: [
      'Switch to a cream cleanser — avoid foaming formulas',
      'Layer a hyaluronic acid serum before moisturizer',
      'Use a rich night cream with ceramides',
      'Humidifier in your bedroom helps overnight hydration',
    ],
    suggested_appointment: { type: 'Dermatologist', urgency: 'routine', reason: 'Persistent dryness may benefit from prescription moisturizers' },
  },
  {
    skin_type: 'oily',
    issues: ['excess_sebum', 'acne', 'shine'],
    recommendations: [
      'Double-cleanse in the evening to remove sunscreen and oil',
      'Use salicylic acid 2% for active breakouts',
      'Avoid heavy occlusive moisturizers',
      'Clay mask once a week to absorb excess oil',
    ],
    suggested_appointment: { type: 'Dermatologist', urgency: 'soon', reason: 'Persistent acne may need prescription-strength treatment' },
  },
];

function mockResult() {
  const r = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
  return { ...r, id: 'demo-' + Date.now(), created_at: new Date().toISOString(), _demo: true };
}

// ── Main: startScan() ─────────────────────────────────────────────────────────
async function startScan() {
  const isNative = window.Capacitor?.isNativePlatform?.() ?? false;

  window.glowApp.setScanState('loading');

  // ── Capture photo ──
  let b64 = null;
  try {
    if (isNative) {
      try {
        b64 = await capturePhoto();
      } catch (camErr) {
        const msg = String(camErr);
        if (msg.includes('cancel') || msg.includes('No image')) {
          window.glowApp.setScanState('idle');
          return;
        }
        // Camera plugin failed — fall back to file picker
        b64 = await capturePhotoWeb();
      }
    } else {
      b64 = await capturePhotoWeb();
    }
  } catch (err) {
    window.glowApp.setScanState('error', 'Camera unavailable. Grant permission in Settings → Apps → GlowAI → Permissions.');
    return;
  }

  if (!b64) {
    window.glowApp.setScanState('idle');
    return;
  }

  window.glowApp.setScanState('analyzing', b64);

  // ── Call API or use demo mode ──
  try {
    let result;
    if (!apiBase()) {
      // No backend configured — show demo result after brief delay
      await new Promise(r => setTimeout(r, 1800));
      result = mockResult();
      result._demo = true;
    } else {
      result = await callScanAPI(b64);
    }
    saveScanToHistory(result, b64);
    window.glowApp.showScanResult(result);
  } catch (err) {
    // API configured but unreachable — show demo result with warning
    await new Promise(r => setTimeout(r, 800));
    const demo = mockResult();
    demo._demo = true;
    demo._apiError = err.message;
    saveScanToHistory(demo, b64);
    window.glowApp.showScanResult(demo);
  }
}

function saveScanToHistory(result, b64) {
  try {
    const history = JSON.parse(localStorage.getItem('glowai_scan_history') || '[]');
    history.unshift({ ...result, thumb: b64.slice(0, 200) });
    localStorage.setItem('glowai_scan_history', JSON.stringify(history.slice(0, 20)));
  } catch { /* non-critical */ }
}

window.scanModule = { startScan };
