import { loadStripe } from '@stripe/stripe-js';

const API_BASE = window.GLOWAI_API_BASE || '';

async function subscribe({ plan = 'freemium_unlock', userId = 'local-demo-user' } = {}) {
  const token = localStorage.getItem('glowai_api_token') || '';
  const res = await fetch(`${API_BASE}/api/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ plan, user_id: userId }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Stripe checkout could not start.');
  }

  const checkout = await res.json();
  const stripe = await loadStripe(checkout.publishable_key);
  if (!stripe) throw new Error('Stripe.js did not initialize.');

  const { error } = await stripe.redirectToCheckout({ sessionId: checkout.session_id });
  if (error) throw error;
}

window.GlowAIPayments = { subscribe };
