# GlowAI

An AI-powered skincare mobile app built with Capacitor and Claude AI (Anthropic). Features a full multi-screen SPA with an agentic AI assistant that analyzes your skin, builds personalized routines, and tracks your progress.

---

## Features

- **Agentic Claude AI** with 5 tools: skin analysis, product recommendations, routine builder, ingredient explainer, progress tracker
- Tool-use agentic loop — AI proactively chains multi-step actions
- Personalized onboarding quiz (skin type, concerns, goals)
- Skin scan with animated analysis flow and AI-generated results
- Personalized AM/PM skincare routine with step tracking and streaks
- Demo mode when no API key is set
- Mobile-first UI with safe area support, smooth transitions, dark theme

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Android Studio](https://developer.android.com/studio)
- Android SDK (API level 22+ minSdk, 33+ targetSdk)
- Java Development Kit (JDK) 17

---

## Installation

```bash
git clone <your-repo-url>
cd quickapp
npm install
npx cap sync android
```

---

## Running on Android

### Option A: Android Studio

```bash
npx cap open android
```

Press **Run** (▶) in Android Studio to build and deploy.

### Option B: Command line

```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Building a Release APK

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

> **Note:** Keep the keystore and its credentials secure. Do not commit credentials to version control.

---

## Project Structure

```
quickapp/
├── android/                  # Native Android project (Capacitor)
│   └── app/
│       └── build.gradle      # Android build configuration
├── www/                      # Web app (mobile SPA)
│   └── index.html
├── capacitor.config.json     # Capacitor configuration
└── package.json
```

---

## Configuration

The app serves the skincare SPA from `www/index.html`. To use the Claude AI features, set your Anthropic API key in the app's Settings screen.

```json
{
  "appId": "com.glowai.app",
  "appName": "GlowAI",
  "webDir": "www"
}
```

---

## Tech Stack

- **Claude AI (Anthropic)** — agentic tool-use loop
- **Capacitor** — native Android wrapper
- **Vanilla JS / HTML / CSS** — mobile SPA
