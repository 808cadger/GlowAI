// GlowAI — scan.js
// Bundled by esbuild → scan.bundle.js
// #ASSUMPTION: @capacitor/camera is installed; esbuild bundles this file.
// #ASSUMPTION: The app can complete a local demo scan when no backend is configured.

import { Capacitor } from '@capacitor/core';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import * as mpSelfie from '@mediapipe/selfie_segmentation';

const app = () => window.glowaiApp;
const FACE_MODEL_URLS = ['./models', 'https://justadudewhohacks.github.io/face-api.js/models'];
const SELFIE_MODEL_URLS = ['./models', 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'];
const MIN_FACE_AREA_FOR_SCAN = 0.22;
const MAX_FACE_CENTER_OFFSET = 0.16;

let faceModelPromise;
let faceModelStatus = 'idle';
let selfieModelPromise;
let selfieModelStatus = 'idle';
let liveScanState = {
  stream: null,
  timer: null,
  processing: false,
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
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelUrl),
        ]);
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

async function loadSelfieSegmentation() {
  if (selfieModelPromise) return selfieModelPromise;

  selfieModelPromise = (async () => {
    selfieModelStatus = 'loading';
    let lastError;
    for (const modelUrl of SELFIE_MODEL_URLS) {
      try {
        const selfie = new mpSelfie.SelfieSegmentation({
          locateFile: (file) => `${modelUrl}/${file}`,
        });
        selfie.setOptions({
          modelSelection: 1,
          selfieMode: true,
        });
        await selfie.initialize();
        selfieModelStatus = 'ready';
        return { ready: true, modelUrl, selfie };
      } catch (error) {
        lastError = error;
      }
    }
    selfieModelStatus = 'unavailable';
    return { ready: false, error: lastError };
  })();

  return selfieModelPromise;
}

async function analyzeFacePresence(dataUrl) {
  const modelState = await loadFaceModels();
  if (!modelState.ready) {
    return {
      available: false,
      detected: false,
      confidence: null,
      message: 'Face check is still loading. Try again with your face close inside the circle.',
    };
  }

  const img = await imageFromDataUrl(dataUrl);
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.35,
  });
  const detections = await faceapi.detectAllFaces(img, options).withFaceLandmarks(true);
  const detection = detections[0]?.detection;
  const landmarks = detections[0]?.landmarks;

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
  const closeEnough = faceArea >= MIN_FACE_AREA_FOR_SCAN;
  const centered = centerOffset <= MAX_FACE_CENTER_OFFSET;
  const qualityMessage = !closeEnough
    ? 'Move closer so your face fills the circle, then scan again.'
    : !centered
      ? 'Center your face inside the circle, then scan again.'
      : 'Face is close, centered, and ready for skin analysis.';

  return {
    available: true,
    detected: true,
    confidence: Math.round(score * 100),
    faceArea,
    minFaceArea: MIN_FACE_AREA_FOR_SCAN,
    centerOffset,
    maxCenterOffset: MAX_FACE_CENTER_OFFSET,
    centered,
    closeEnough,
    landmarks: landmarks
      ? {
          count: landmarks.positions.length,
          jaw: landmarks.getJawOutline().length,
          nose: landmarks.getNose().length,
          mouth: landmarks.getMouth().length,
          leftEye: landmarks.getLeftEye().length,
          rightEye: landmarks.getRightEye().length,
        }
      : null,
    message: qualityMessage,
  };
}

async function segmentSelfie(input) {
  const modelState = await loadSelfieSegmentation();
  if (!modelState.ready) return null;

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Selfie segmentation timed out')), 2500);
    modelState.selfie.onResults((results) => {
      window.clearTimeout(timeout);
      resolve(results);
    });
    modelState.selfie.send({ image: input }).catch((error) => {
      window.clearTimeout(timeout);
      reject(error);
    });
  });
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

function analyzeMetrics(segmentationMask, sourceCanvas) {
  if (!segmentationMask || !sourceCanvas?.width || !sourceCanvas?.height) return null;

  const { width, height } = sourceCanvas;
  const frameCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const frame = frameCtx.getImageData(0, 0, width, height).data;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  maskCtx.drawImage(segmentationMask, 0, 0, width, height);
  const mask = maskCtx.getImageData(0, 0, width, height).data;

  let count = 0;
  let luminance = 0;
  let redness = 0;
  let shine = 0;
  let texture = 0;
  let warmth = 0;
  let coolness = 0;
  let saturation = 0;
  let shadow = 0;
  let highlight = 0;
  let contrastSum = 0;
  let centerWeight = 0;
  let edgeWeight = 0;
  let greenBalance = 0;
  let blueBalance = 0;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = (y * width + x) * 4;
      if (mask[i + 3] < 128 && mask[i] < 128) continue;

      const r = frame[i];
      const g = frame[i + 1];
      const b = frame[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const right = ((y * width + x + 1) * 4);
      const down = (((y + 1) * width + x) * 4);
      const localContrast = Math.abs(r - frame[right]) + Math.abs(g - frame[right + 1]) + Math.abs(b - frame[right + 2])
        + Math.abs(r - frame[down]) + Math.abs(g - frame[down + 1]) + Math.abs(b - frame[down + 2]);
      const dx = Math.abs((x / width) - 0.5);
      const dy = Math.abs((y / height) - 0.5);

      luminance += lum;
      redness += Math.max(0, r - ((g + b) / 2));
      shine += lum > 218 ? 1 : 0;
      shadow += lum < 72 ? 1 : 0;
      highlight += lum > 205 ? 1 : 0;
      texture += localContrast;
      contrastSum += max - min;
      warmth += Math.max(0, r - b);
      coolness += Math.max(0, b - r);
      saturation += max === 0 ? 0 : (max - min) / max;
      centerWeight += Math.max(0, 1 - ((dx + dy) * 1.25));
      edgeWeight += dx + dy > 0.58 ? 1 : 0;
      greenBalance += g;
      blueBalance += b;
      count += 1;
    }
  }

  if (!count) return null;

  const avgLum = luminance / count;
  const avgRedness = redness / count;
  const shineRatio = shine / count;
  const shadowRatio = shadow / count;
  const highlightRatio = highlight / count;
  const avgTexture = texture / count;
  const avgContrast = contrastSum / count;
  const humidityStress = Math.max(0, Math.min(100, Math.round((shineRatio * 62) + shadowRatio * 18 + Math.max(0, avgRedness - 8) * 1.8)));

  return {
    hydration: Math.max(42, Math.min(96, Math.round(78 + (avgLum - 132) * 0.05 - shineRatio * 26 - humidityStress * 0.08))),
    clarity: Math.max(38, Math.min(97, Math.round(91 - avgTexture * 0.18 - avgRedness * 0.2 - shadowRatio * 12))),
    texture: Math.max(34, Math.min(96, Math.round(92 - avgTexture * 0.22 - avgContrast * 0.16))),
    tone: Math.max(42, Math.min(96, Math.round(88 - avgRedness * 0.24 - Math.abs(warmth - coolness) / count * 0.1))),
    oil: Math.max(28, Math.min(96, Math.round(55 + shineRatio * 118 + highlightRatio * 34))),
    redness: Math.max(0, Math.min(100, Math.round(avgRedness * 2.35))),
    humidityStress,
    moisture: Math.max(35, Math.min(98, Math.round(82 - shineRatio * 20 - shadowRatio * 15 + (avgLum - 128) * 0.04))),
    barrier: Math.max(35, Math.min(98, Math.round(89 - avgRedness * 0.32 - avgTexture * 0.12))),
    poreContrast: Math.max(0, Math.min(100, Math.round(avgContrast * 0.9))),
    shineIndex: Math.max(0, Math.min(100, Math.round(shineRatio * 100))),
    shadowIndex: Math.max(0, Math.min(100, Math.round(shadowRatio * 100))),
    highlightIndex: Math.max(0, Math.min(100, Math.round(highlightRatio * 100))),
    warmth: Math.max(0, Math.min(100, Math.round((warmth / count) * 0.9))),
    coolness: Math.max(0, Math.min(100, Math.round((coolness / count) * 0.9))),
    saturation: Math.max(0, Math.min(100, Math.round((saturation / count) * 100))),
    evenness: Math.max(0, Math.min(100, Math.round(96 - avgTexture * 0.16 - avgContrast * 0.18))),
    centerCoverage: Math.max(0, Math.min(100, Math.round((centerWeight / count) * 100))),
    edgeNoise: Math.max(0, Math.min(100, Math.round((edgeWeight / count) * 100))),
    greenBalance: Math.max(0, Math.min(255, Math.round(greenBalance / count))),
    blueBalance: Math.max(0, Math.min(255, Math.round(blueBalance / count))),
    segmentationCoverage: Math.max(0, Math.min(100, Math.round((count / ((width * height) / 4)) * 100))),
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
  const [baseSignals, faceQuality, selfieResults] = await Promise.all([
    Promise.resolve(sampleCanvas(canvas)),
    analyzeFacePresence(dataUrl),
    segmentSelfie(canvas).catch(() => null),
  ]);
  const segmentedSignals = selfieResults?.segmentationMask
    ? analyzeMetrics(selfieResults.segmentationMask, canvas)
    : null;
  const skinSignals = segmentedSignals
    ? { ...baseSignals, ...segmentedSignals, segmentation: 'selfie' }
    : { ...baseSignals, segmentation: 'full-frame' };

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
    await Promise.all([
      loadFaceModels(),
      loadSelfieSegmentation(),
    ]);
    liveScanState.timer = setInterval(async () => {
      if (liveScanState.processing) return;
      liveScanState.processing = true;
      try {
        const sample = await analyzeVideoFrame(video, canvas);
        if (sample) onSample?.(sample);
      } catch (error) {
        onError?.(error);
      } finally {
        liveScanState.processing = false;
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
function normalizeImageFormat(format = 'jpeg') {
  return format === 'jpg' ? 'jpeg' : format;
}

function dataUrlToBase64(dataUrl) {
  const parts = String(dataUrl || '').split(',');
  return parts.length > 1 ? parts[1] : '';
}

async function resizeDataUrl(dataUrl, maxBytes = 900_000) {
  const base64 = dataUrlToBase64(dataUrl);
  if (!base64) throw new Error('Captured photo was empty');
  const byteLen = Math.ceil(base64.length * 0.75);
  if (byteLen <= maxBytes) return dataUrl;

  const img = await imageFromDataUrl(dataUrl);
  const scale = Math.sqrt(maxBytes / byteLen);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(img.width * scale));
  canvas.height = Math.max(1, Math.floor(img.height * scale));
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

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

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Photo conversion failed'));
    reader.readAsDataURL(blob);
  });
}

async function normalizeCameraPhoto(photo) {
  if (!photo) return null;
  if (photo.dataUrl?.startsWith('data:image/')) return photo.dataUrl;
  if (photo.base64String) {
    const format = normalizeImageFormat(photo.format);
    return `data:image/${format};base64,${photo.base64String}`;
  }

  const uriCandidates = [
    photo.webPath,
    photo.path ? Capacitor.convertFileSrc(photo.path) : '',
    photo.path,
  ].filter(Boolean);

  let lastError;
  for (const uri of uriCandidates) {
    try {
      const response = await fetch(uri, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Photo load failed with ${response.status}`);
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error('Captured file was not an image');
      return blobToDataUrl(blob);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return null;
}

async function captureStudioPhoto({ facing = 'rear' } = {}) {
  const isNative = window.Capacitor?.isNativePlatform?.() ?? false;
  if (isNative) {
    const permitted = await ensureCameraPermission();
    if (!permitted) return null;

    let photo;
    try {
      photo = await Camera.getPhoto({
        quality: 82,
        width: 1280,
        height: 1280,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false,
        correctOrientation: true,
        presentationStyle: 'fullscreen',
        direction: facing === 'front' ? CameraDirection.Front : CameraDirection.Rear,
      });
    } catch (error) {
      const msg = String(error?.message || error);
      if (msg.includes('cancel') || msg.includes('User cancelled')) throw error;
      app()?.setScanStatus?.('Camera fallback', 'Opening the system photo picker so GlowAI can still use your picture.');
      const fallback = await capturePhotoWebForFacing(facing);
      return fallback ? {
        dataUrl: `data:image/jpeg;base64,${fallback}`,
        name: `${facing === 'front' ? 'selfie' : 'capture'}-${Date.now()}.jpg`,
      } : null;
    }

    const dataUrl = await normalizeCameraPhoto(photo);
    if (!dataUrl) return null;
    return {
      dataUrl,
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
    const resizedDataUrl = await resizeDataUrl(capture.dataUrl);
    const faceQuality = await analyzeFacePresence(resizedDataUrl);

    if (!faceQuality.available) {
      app()?.setScanStatus?.('Face check loading', faceQuality.message);
      app()?.pushAssistantMessage?.('GlowAI needs the face check before it can scan. Keep your face close inside the circle and try again.');
      return;
    }

    if (!faceQuality.detected) {
      app()?.setScanStatus?.('Find face', 'Put your face inside the circle before GlowAI scans.');
      app()?.pushAssistantMessage?.('I could not see a face clearly. Move into the circle with even light and try again.');
      return;
    }

    if (!faceQuality.closeEnough) {
      app()?.setScanStatus?.('Move closer', faceQuality.message);
      app()?.pushAssistantMessage?.('Move closer to the camera so your face fills the circle. GlowAI will not scan until the picture is close enough to be clear.');
      return;
    }

    if (!faceQuality.centered) {
      app()?.setScanStatus?.('Center face', faceQuality.message);
      app()?.pushAssistantMessage?.('Keep your face centered inside the circle. GlowAI will not scan until the face is lined up.');
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
  loadSelfieSegmentation,
  analyzeMetrics,
  startCameraStream,
  stopCameraStream,
  analyzeVideoFrame,
  startLiveSkinScan,
  getFaceModelStatus: () => faceModelStatus,
  getSelfieModelStatus: () => selfieModelStatus,
};
