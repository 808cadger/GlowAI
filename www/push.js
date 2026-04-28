import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const API_BASE = window.GLOWAI_API_BASE || '';

async function registerPush({ userId = 'local-demo-user' } = {}) {
  if (window.GLOWAI_ENABLE_PUSH !== true) {
    return { registered: false, reason: 'push-disabled' };
  }
  if (!Capacitor.isNativePlatform()) {
    return { registered: false, reason: 'native-only' };
  }

  let permission = await PushNotifications.checkPermissions();
  if (permission.receive === 'prompt') {
    permission = await PushNotifications.requestPermissions();
  }
  if (permission.receive !== 'granted') {
    return { registered: false, reason: 'permission-denied' };
  }

  PushNotifications.addListener('registration', async (token) => {
    localStorage.setItem('glowai_push_token', token.value);
    await sendTokenToBackend(token.value, userId);
  });

  PushNotifications.addListener('registrationError', (error) => {
    window.glowaiApp?.logAgentAction?.('push', 'Push registration failed', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    const title = notification.title || 'Wash reminder';
    const body = notification.body || 'Scan progress?';
    window.glowaiApp?.pushAssistantMessage?.(`${title}: ${body}`);
    window.glowaiApp?.showPage?.('scan');
  });

  PushNotifications.addListener('pushNotificationActionPerformed', () => {
    window.glowaiApp?.showPage?.('scan');
  });

  await PushNotifications.register();
  return { registered: true };
}

async function sendTokenToBackend(token, userId) {
  const apiToken = localStorage.getItem('glowai_api_token') || '';
  if (!API_BASE || !apiToken) return;

  await fetch(`${API_BASE}/api/push-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      user_id: userId,
      token,
      platform: Capacitor.getPlatform(),
    }),
  }).catch(() => {});
}

window.GlowAIPush = { registerPush };
