// GlowAI — scan.js
// Bundled by esbuild → scan.bundle.js
// #ASSUMPTION: @capacitor/camera is installed; esbuild bundles this file.
// #ASSUMPTION: The app can complete a local demo scan when no backend is configured.

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';

const app = () => window.glowaiApp;
const FACE_MODEL_URLS = ['./models', 'https://justadudewhohacks.github.io/face-api.js/models'];

let faceModelPromise;
let faceModelStatus = 'idle';
let liveScanState = {
  stream: null,
  timer: null,
};

function imageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}

async function loadFaceModels() {
  if (faceModelPromise) return faceModelPromise;

  faceModelPromise = (async () => {
    faceModelStatus = 'loading';
    let lastError;
    for (const modelUrl of FACE_MODEL_URLS) {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
        faceModelStatus = 'ready';
        return { ready: true, modelUrl };
      } catch (error) {
        lastError = error;
      }
    }
    faceModelStatus = 'unavailable';
    return { ready: false, error: lastError };
  })();

  return faceModelPromise;
}

async function analyzeFacePresence(dataUrl) {
  const modelState = await loadFaceModels();
  if (!modelState.ready) {
    return {
      available: false,
      detected: true,
      confidence: null,
      message: 'Face model unavailable; continuing with guided scan.',
    };
  }

  const img = await imageFromDataUrl(dataUrl);
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.35,
  });
  const detection = await faceapi.detectSingleFace(img, options);

  if (!detection) {
    return {
      available: true,
      detected: false,
      confidence: 0,
      message: 'No face was detected. Use even light, center your face, and scan again.',
    };
  }

  const { box, score } = detection;
  const faceArea = (box.width * box.height) / (img.width * img.height);
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const centerOffset = Math.hypot((centerX / img.width) - 0.5, (centerY / img.height) - 0.5);

  return {
    available: true,
    detected: true,
    confidence: Math.round(score * 100),
    faceArea,
    centered: centerOffset < 0.28,
    closeEnough: faceArea > 0.08,
    message: 'Face detected and ready for skin analysis.',
  };
}

async function startCameraStream(video, { facing = 'front' } = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Live camera is not supported in this browser.');
  }

  stopCameraStream();
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: facing === 'front' ? 'user' : 'environment',
      width: { ideal: 960 },
      height: { ideal: 1280 },
    },
    audio: false,
  });
  liveScanState.stream = stream;
  video.srcObject = stream;
  await video.play();
  return stream;
}

function stopCameraStream() {
  if (liveScanState.timer) {
    clearInterval(liveScanState.timer);
    liveScanState.timer = null;
  }
  if (liveScanState.stream) {
    liveScanState.stream.getTracks().forEach((track) => track.stop());
    liveScanState.stream = null;
  }
}

function sampleCanvas(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let luminance = 0;
  let redness = 0;
  let shine = 0;
  let texture = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    luminance += lum;
    redness += Math.max(0, r - ((g + b) / 2));
    shine += lum > 216 ? 1 : 0;
    const localContrast = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    texture += localContrast;
    count += 1;
  }

  const avgLum = luminance / count;
  const avgRedness = redness / count;
  const shineRatio = shine / count;
  const avgTexture = texture / count;

  return {
    hydration: Math.max(48, Math.min(94, Math.round(74 + (avgLum - 132) * 0.06 - shineRatio * 22))),
    clarity: Math.max(45, Math.min(96, Math.round(88 - avgTexture * 0.28 - avgRedness * 0.16))),
    texture: Math.max(38, Math.min(94, Math.round(90 - avgTexture * 0.33))),
    tone: Math.max(46, Math.min(95, Math.round(86 - avgRedness * 0.22))),
    oil: Math.max(34, Math.min(92, Math.round(62 + shineRatio * 95))),
    redness: Math.max(0, Math.min(100, Math.round(avgRedness * 2.2))),
  };
}

async function analyzeVideoFrame(video, canvas) {
  if (!video.videoWidth || !video.videoHeight) return null;

  const width = 360;
  const height = Math.round(width * (video.videoHeight / video.videoWidth));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
  const [skinSignals, faceQuality] = await Promise.all([
    Promise.resolve(sampleCanvas(canvas)),
    analyzeFacePresence(dataUrl),
  ]);

  const humidityStress = Math.max(0, Math.min(100, Math.round((skinSignals.oil * 0.58) + ((100 - skinSignals.hydration) * 0.42))));
  return {
    dataUrl,
    skinSignals: {
      ...skinSignals,
      humidityStress,
    },
    faceQuality,
    createdAt: new Date().toISOString(),
  };
}

async function startLiveSkinScan({ video, canvas, onSample, onError } = {}) {
  try {
    await startCameraStream(video, { facing: 'front' });
    await loadFaceModels();
    liveScanState.timer = setInterval(async () => {
      try {
        const sample = await analyzeVideoFrame(video, canvas);
        if (sample) onSample?.(sample);
      } catch (error) {
        onError?.(error);
      }
    }, 900);
  } catch (error) {
    onError?.(error);
    throw error;
  }
}

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

    app()?.setScanStatus?.('Finding face', 'Checking that your face is visible and centered before analysis.');
    const resized = await resizeBase64(capture.dataUrl.split(',')[1]);
    const resizedDataUrl = `data:image/jpeg;base64,${resized}`;
    const faceQuality = await analyzeFacePresence(resizedDataUrl);

    if (faceQuality.available && !faceQuality.detected) {
      app()?.handleScanError?.(faceQuality.message);
      return;
    }

    const qualityHint = faceQuality.available
      ? `Face confidence ${faceQuality.confidence}%. Reading hydration, tone, texture, clarity, and routine fit.`
      : 'Reading hydration, tone, texture, clarity, and routine fit with the local guide.';
    app()?.setScanStatus?.('Analyzing scan', qualityHint);
    await new Promise(resolve => setTimeout(resolve, 700));
    app()?.handleScanCapture?.(resizedDataUrl, faceQuality);
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes('cancel') || msg.includes('No image') || msg.includes('User cancelled')) {
      app()?.setScanStatus?.('Idle', 'Scan canceled. Start again when you are ready.');
      return;
    }
    app()?.handleScanError?.('Could not access camera. Check camera permissions and try again.');
  }
}

window.scanModule = {
  startScan,
  captureStudioPhoto,
  loadFaceModels,
  analyzeFacePresence,
  startCameraStream,
  stopCameraStream,
  analyzeVideoFrame,
  startLiveSkinScan,
  getFaceModelStatus: () => faceModelStatus,
};
