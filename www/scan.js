// GlowAI — scan.js
// Bundled by esbuild → scan.bundle.js
// #ASSUMPTION: @capacitor/camera is installed; esbuild bundles this file.
// #ASSUMPTION: The app can complete a local demo scan when no backend is configured.

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const app = () => window.glowaiApp;

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
    app()?.handleScanError?.('Camera access is blocked. Open Settings, enable camera access for GlowAI, then try again.');
    return false;
  }

  // Show rationale before prompting
  if (perms.camera === 'prompt-with-rationale') {
    const ok = window.confirm('GlowAI uses your camera to capture a face scan and build cosmetic skincare guidance. Your demo scan stays on this device unless you connect a backend.');
    if (!ok) return false;
  }

  const granted = await Camera.requestPermissions({ permissions: ['camera'] });
  if (granted.camera !== 'granted') {
    app()?.handleScanError?.('Camera permission is required to scan. Tap the button to try again.');
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

// ── Main: startScan() ─────────────────────────────────────────────────────────
async function startScan() {
  try {
    const permitted = await ensureCameraPermission();
    if (!permitted) return;

    app()?.setScanStatus?.('Opening camera', 'Use even light, center your face, and keep the phone steady.');
    const capture = await captureStudioPhoto({ facing: 'front' });

    if (!capture?.dataUrl) {
      app()?.setScanStatus?.('Idle', 'Scan canceled. Start again when you are ready.');
      return;
    }

    app()?.setScanStatus?.('Analyzing scan', 'Reading hydration, tone, texture, clarity, and routine fit.');
    const resized = await resizeBase64(capture.dataUrl.split(',')[1]);
    await new Promise(resolve => setTimeout(resolve, 700));
    app()?.handleScanCapture?.(`data:image/jpeg;base64,${resized}`);
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes('cancel') || msg.includes('No image') || msg.includes('User cancelled')) {
      app()?.setScanStatus?.('Idle', 'Scan canceled. Start again when you are ready.');
      return;
    }
    app()?.handleScanError?.('Could not access camera. Check camera permissions and try again.');
  }
}

window.scanModule = { startScan, captureStudioPhoto };
