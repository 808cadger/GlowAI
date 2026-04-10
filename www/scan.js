import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const apiBase = () => (localStorage.getItem('glowai_api_url') || '').replace(/\/$/, '');
const authToken = () => localStorage.getItem('glowai_token') || 'dev-token';

async function ensureCameraPermission() {
  if (!(window.Capacitor?.isNativePlatform?.())) return true;

  let perms;
  try {
    perms = await Camera.checkPermissions();
  } catch {
    return true;
  }

  if (perms.camera === 'granted') return true;

  if (perms.camera === 'denied') {
    window.glowApp.setScanState(
      'error',
      'Camera access is blocked. Open Settings > Apps > FarmSense > Permissions > Camera and enable it, then try again.'
    );
    return false;
  }

  if (perms.camera === 'prompt-with-rationale') {
    const ok = await window.glowApp.showConsentDialog(
      'Camera Access',
      'FarmSense uses the camera to capture crop conditions for AI review. Photos are used only for the inspection flow you start.'
    );
    if (!ok) return false;
  }

  const granted = await Camera.requestPermissions({ permissions: ['camera'] });
  if (granted.camera !== 'granted') {
    window.glowApp.setScanState('error', 'Camera permission is required to run a field scan.');
    return false;
  }

  return true;
}

async function resizeBase64(b64, maxBytes = 900000) {
  const byteLen = Math.ceil(b64.length * 0.75);
  if (byteLen <= maxBytes) return b64;

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.sqrt(maxBytes / byteLen);
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${b64}`;
  });
}

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

function capturePhotoWeb() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0';
    document.body.appendChild(input);

    const cleanup = () => {
      try {
        document.body.removeChild(input);
      } catch {}
    };

    input.onchange = () => {
      cleanup();
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = event => resolve(event.target.result.split(',')[1]);
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    };

    setTimeout(() => {
      cleanup();
      resolve(null);
    }, 60000);

    input.click();
  });
}

async function callScanAPI(base64Image) {
  const base = apiBase();
  if (!base) throw new Error('NO_API_URL');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const resp = await fetch(`${base}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken()}`,
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

const MOCK_RESULTS = [
  {
    field_summary: 'mild water stress',
    field_icon: '💧',
    issues: ['leaf_curling', 'midday_droop', 'dry_topsoil'],
    recommendations: [
      'Inspect emitter flow on the affected lateral before the next cycle.',
      'Walk the zone at first light to compare recovery after overnight irrigation.',
      'Check pressure variance between the head and tail of the row.',
      'Log a follow-up irrigation task if canopy recovery remains uneven.',
    ],
    suggested_appointment: {
      type: 'Irrigation Check',
      urgency: 'soon',
      reason: 'Signs point to inconsistent delivery rather than full block stress.',
    },
  },
  {
    field_summary: 'possible nutrient imbalance',
    field_icon: '🌱',
    issues: ['patchy_yellowing', 'edge_fading', 'uneven_growth'],
    recommendations: [
      'Compare color shift against your last feed event and irrigation timing.',
      'Pull a quick soil or tissue sample from both healthy and affected areas.',
      'Check whether symptoms are following a fertigation or row pattern.',
      'Review the next nutrient pass before applying a blanket correction.',
    ],
    suggested_appointment: {
      type: 'Soil Sample',
      urgency: 'routine',
      reason: 'The pattern needs field confirmation before making a feed adjustment.',
    },
  },
  {
    field_summary: 'localized pest pressure',
    field_icon: '🐞',
    issues: ['leaf_damage', 'clustered_hotspot', 'canopy_irregularity'],
    recommendations: [
      'Scout the affected edge and underside of leaves for active insects.',
      'Mark the hotspot and compare spread against neighboring rows.',
      'Check recent spray coverage or drift protection around the block edge.',
      'Create a targeted pest review task for the scout team.',
    ],
    suggested_appointment: {
      type: 'Pest Review',
      urgency: 'urgent',
      reason: 'Damage appears concentrated enough to justify a same-day field walk.',
    },
  },
];

function mockResult() {
  const pick = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
  return {
    ...pick,
    id: `demo-${Date.now()}`,
    created_at: new Date().toISOString(),
    _demo: true,
  };
}

function saveScanToHistory(result, b64) {
  try {
    const history = JSON.parse(localStorage.getItem('glowai_scan_history') || '[]');
    history.unshift({ ...result, thumb: b64.slice(0, 200) });
    localStorage.setItem('glowai_scan_history', JSON.stringify(history.slice(0, 20)));
  } catch {}
}

async function startScan() {
  const isNative = window.Capacitor?.isNativePlatform?.() ?? false;
  const permitted = await ensureCameraPermission();
  if (!permitted) return;

  window.glowApp.setScanState('loading');

  let b64 = null;
  try {
    if (isNative) {
      try {
        b64 = await capturePhoto();
      } catch (err) {
        const msg = String(err);
        if (msg.includes('cancel') || msg.includes('No image') || msg.includes('User cancelled')) {
          window.glowApp.setScanState('idle');
          return;
        }
        if (msg.includes('permission') || msg.includes('denied')) {
          window.glowApp.setScanState('error', 'Camera access denied. Check FarmSense permissions and try again.');
          return;
        }
        b64 = await capturePhotoWeb();
      }
    } else {
      b64 = await capturePhotoWeb();
    }
  } catch {
    window.glowApp.setScanState('error', 'Could not access the camera. Check permissions and try again.');
    return;
  }

  if (!b64) {
    window.glowApp.setScanState('idle');
    return;
  }

  b64 = await resizeBase64(b64);
  window.glowApp.setScanState('analyzing', b64);

  try {
    let result;
    if (!apiBase()) {
      await new Promise(resolve => setTimeout(resolve, 1600));
      result = mockResult();
    } else {
      result = await callScanAPI(b64);
    }
    saveScanToHistory(result, b64);
    window.glowApp.showScanResult(result);
  } catch (err) {
    if (err.name === 'AbortError') {
      window.glowApp.setScanState('error', 'Analysis timed out. Check connectivity and try again.');
      return;
    }
    const demo = mockResult();
    demo._demo = true;
    demo._apiError = err.message;
    saveScanToHistory(demo, b64);
    window.glowApp.showScanResult(demo);
  }
}

window.scanModule = { startScan };
