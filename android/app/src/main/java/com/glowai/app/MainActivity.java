package com.glowai.app;

import android.content.Intent;
import android.media.AudioAttributes;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import com.getcapacitor.BridgeActivity;

import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "GlowAIStartupVoice";
    private static final String STARTUP_GREETING = "Welcome to GlowAI. Scan your face to get instant skin insights, appointment options, and product suggestions that keep your routine in rhythm.";
    private TextToSpeech textToSpeech;
    private boolean ttsReady = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initStartupVoice();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        speakStartupGreeting();
    }

    @Override
    public void onDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        super.onDestroy();
    }

    private void initStartupVoice() {
        textToSpeech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                textToSpeech.setLanguage(Locale.US);
                textToSpeech.setSpeechRate(0.86f);
                textToSpeech.setPitch(0.94f);
                textToSpeech.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build());
                ttsReady = true;
                speakStartupGreeting();
            } else {
                Log.w(TAG, "TextToSpeech init failed with status " + status);
            }
        });
    }

    private void speakStartupGreeting() {
        if (!ttsReady || textToSpeech == null) {
            Log.d(TAG, "Greeting skipped because TTS is not ready");
            return;
        }
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            int result = textToSpeech.speak(STARTUP_GREETING, TextToSpeech.QUEUE_FLUSH, null, "glowai_startup_greeting");
            Log.d(TAG, "Startup greeting speak result " + result);
        }, 650);
    }
}
