// AutoIQ Pro — scan.js
// Bundled by esbuild → scan.bundle.js
// #ASSUMPTION: @capacitor/camera v6 installed; esbuild bundles this file.
// #ASSUMPTION: Backend URL stored in localStorage key 'glowai_api_url'.
// #ASSUMPTION: If no API URL set, mock results are shown (demo mode).

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const apiBase   = () => (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
const authToken = () => localStorage.getItem('glowai_token') || 'dev-token';

// ── Permission pre-check ──────────────────────────────────────────────────────
async function ensureCameraPermission() {
  if (!(window.Capacitor?.isNativePlatform?.())) return true;

  let perms;
  try {
    perms = await Camera.checkPermissions();
  } catch {
    return true; // plugin doesn't support checkPermissions — proceed optimistically
  }

  if (perms.camera === 'granted') return true;

  if (perms.camera === 'denied') {
    window.glowApp.setScanState('error',
      'Camera access is blocked. Open Settings → Apps → AutoIQ Pro → Permissions → Camera and enable it, then try again.'
    );
    return false;
  }

  // Show rationale before prompting
  if (perms.camera === 'prompt-with-rationale') {
    const ok = await window.glowApp.showConsentDialog(
      'Camera Access',
      'AutoIQ Pro uses your camera to identify the likely vehicle part and assess visible damage. Photos are sent to our AI and never stored without your consent.',
      'Allow Camera', 'Not Now'
    );
    if (!ok) return false;
  }

  const granted = await Camera.requestPermissions({ permissions: ['camera'] });
  if (granted.camera !== 'granted') {
    window.glowApp.setScanState('error',
      'Camera permission is required to scan. Tap the button to try again.'
    );
    return false;
  }
  return true;
}

// ── Resize image before upload (max ~900KB) ───────────────────────────────────
async function resizeBase64(b64, maxBytes = 900_000) {
  const byteLen = Math.ceil(b64.length * 0.75);
  if (byteLen <= maxBytes) return b64;

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.sqrt(maxBytes / byteLen);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.floor(img.width  * scale);
      canvas.height = Math.floor(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${b64}`;
  });
}

// ── Camera capture (native) ───────────────────────────────────────────────────
async function capturePhoto() {
  const photo = await Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
    saveToGallery: false,
    correctOrientation: true,
    presentationStyle: 'fullscreen',
  });
  return photo.base64String;
}

async function captureStudioPhoto({ facing = 'rear' } = {}) {
  const isNative = window.Capacitor?.isNativePlatform?.() ?? false;
  if (isNative) {
    const permitted = await ensureCameraPermission();
    if (!permitted) return null;

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      saveToGallery: false,
      correctOrientation: true,
      presentationStyle: 'fullscreen',
      direction: facing === 'front' ? 'front' : 'rear',
    });

    if (!photo?.base64String) return null;
    return {
      dataUrl: `data:image/jpeg;base64,${photo.base64String}`,
      name: `${facing === 'front' ? 'selfie' : 'capture'}-${Date.now()}.jpg`,
    };
  }

  const base64 = await capturePhotoWebForFacing(facing);
  if (!base64) return null;
  return {
    dataUrl: `data:image/jpeg;base64,${base64}`,
    name: `${facing === 'front' ? 'selfie' : 'capture'}-${Date.now()}.jpg`,
  };
}

// ── Web / gallery fallback (browser dev or camera failure) ────────────────────
function capturePhotoWebForFacing(facing = 'rear') {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = facing === 'front' ? 'user' : 'environment';
    // Must be in DOM for Samsung WebView
    input.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0';
    document.body.appendChild(input);
    const cleanup = () => { try { document.body.removeChild(input); } catch {} };
    input.onchange = () => {
      cleanup();
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result.split(',')[1]);
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    };
    setTimeout(() => { cleanup(); resolve(null); }, 60_000);
    input.click();
  });
}

function capturePhotoWeb() {
  return capturePhotoWebForFacing('rear');
}

// ── POST /api/scan ─────────────────────────────────────────────────────────────
async function callScanAPI(base64Image) {
  const base = apiBase();
  if (!base) throw new Error('NO_API_URL');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
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
      signal: controller.signal,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `API ${resp.status}`);
    }
    return resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ── Mock results (demo mode when no backend configured) ───────────────────────
const MOCK_RESULTS = [
  {
    part_name: 'front bumper',
    skin_type: 'front bumper',
    issues: ['surface_scrape', 'paint_transfer', 'clip_risk'],
    recommendations: [
      'Confirm whether the scrape is only in the paint or through the plastic cover.',
      'Check panel gaps and mounting clips near the impact area.',
      'Photograph the damage from straight-on and from the corner before requesting quotes.',
      'Use the bumper workspace to save a corrected part reference and next steps.',
    ],
    suggested_appointment: { type: 'Body Shop', urgency: 'routine', reason: 'Damage appears cosmetic to moderate, but the bumper cover and clips should be inspected.' },
  },
  {
    part_name: 'wheel and tire',
    skin_type: 'wheel and tire',
    issues: ['curb_rash', 'sidewall_mark', 'alignment_watch'],
    recommendations: [
      'Inspect the tire sidewall closely for cuts, bulges, or exposed cords.',
      'Capture the full wheel face and tire shoulder in even light.',
      'If steering feel changed after impact, schedule an alignment check.',
      'Use the wheel workspace to document cosmetic versus safety-related damage.',
    ],
    suggested_appointment: { type: 'Tire Shop', urgency: 'soon', reason: 'Wheel damage may be cosmetic, but the tire should be checked soon for safety.' },
  },
  {
    part_name: 'windshield',
    skin_type: 'windshield',
    issues: ['chip', 'crack_spread_risk', 'visibility_concern'],
    recommendations: [
      'Photograph the chip or crack from inside and outside the vehicle.',
      'Track whether the crack is spreading toward the driver view area.',
      'Avoid high-pressure washing or strong temperature swings until inspected.',
      'Use the glass workspace to save the case and compare repair versus replacement paths.',
    ],
    suggested_appointment: { type: 'Glass Repair', urgency: 'soon', reason: 'Visible glass damage can spread quickly and affect visibility.' },
  },
];

function mockResult() {
  const r = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
  return { ...r, id: 'demo-' + Date.now(), created_at: new Date().toISOString(), _demo: true };
}

// ── Main: startScan() ─────────────────────────────────────────────────────────
async function startScan() {
  const isNative = window.Capacitor?.isNativePlatform?.() ?? false;

  // Permission gate — before any loading state
  const permitted = await ensureCameraPermission();
  if (!permitted) return;

  window.glowApp.setScanState('loading');

  let b64 = null;
  try {
    if (isNative) {
      try {
        b64 = await capturePhoto();
      } catch (camErr) {
        const msg = String(camErr);
        if (msg.includes('cancel') || msg.includes('No image') || msg.includes('User cancelled')) {
          window.glowApp.setScanState('idle');
          return;
        }
        if (msg.includes('permission') || msg.includes('denied')) {
          window.glowApp.setScanState('error',
            'Camera access denied. Go to Settings → Apps → AutoIQ Pro → Permissions.'
          );
          return;
        }
        // Hardware failure — fall back to file picker
        console.warn('dev note: native camera failed, falling back to file picker', msg);
        b64 = await capturePhotoWeb();
      }
    } else {
      b64 = await capturePhotoWeb();
    }
  } catch (err) {
    window.glowApp.setScanState('error',
      'Could not access camera. Please check app permissions and try again.'
    );
    return;
  }

  if (!b64) { window.glowApp.setScanState('idle'); return; }

  b64 = await resizeBase64(b64);
  window.glowApp?.setLastStudioPhoto?.({
    name: `vehicle-scan-${Date.now()}.jpg`,
    dataUrl: `data:image/jpeg;base64,${b64}`,
    source: 'vehicle-scan',
    updatedAt: new Date().toISOString(),
  });
  window.glowApp.setScanState('analyzing', b64);

  try {
    let result;
    if (!apiBase()) {
      await new Promise(r => setTimeout(r, 1800));
      result = mockResult();
      result._demo = true;
    } else {
      result = await callScanAPI(b64);
    }
    saveScanToHistory(result, b64);
    window.glowApp.showScanResult(result);
  } catch (err) {
    if (err.name === 'AbortError') {
      window.glowApp.setScanState('error', 'Analysis timed out. Check your connection and try again.');
      return;
    }
    // API error — degrade to demo with warning
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

window.scanModule = { startScan, captureStudioPhoto };
