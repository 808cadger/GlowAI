const API_BASE = window.GLOWAI_API_BASE || '';
let stripeLoader;

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
  const stripe = await loadStripeScript(checkout.publishable_key);
  if (!stripe) throw new Error('Stripe.js did not initialize.');

  const { error } = await stripe.redirectToCheckout({ sessionId: checkout.session_id });
  if (error) throw error;
}

async function loadStripeScript(publishableKey) {
  if (!publishableKey) throw new Error('Stripe publishable key is missing.');
  if (window.Stripe) return window.Stripe(publishableKey);
  if (!stripeLoader) {
    stripeLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => resolve(window.Stripe);
      script.onerror = () => reject(new Error('Stripe.js could not be loaded.'));
      document.head.appendChild(script);
    });
  }
  const Stripe = await stripeLoader;
  return Stripe(publishableKey);
}

window.GlowAIPayments = { subscribe };
