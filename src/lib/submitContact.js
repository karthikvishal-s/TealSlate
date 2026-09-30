/**
 * ─────────────────────────────────────────────────────────────
 *  CONTACT FORM INTEGRATION POINT
 * ─────────────────────────────────────────────────────────────
 * The form UI calls `submitContact(values)` and expects:
 *   - resolve  → success state
 *   - throw    → error state
 *
 * Right now it's a stub that fakes a network request.
 * Swap the body for one of the options below.
 *
 * ── Option A: Web3Forms (no backend, free tier) ──────────────
 *   const res = await fetch('https://api.web3forms.com/submit', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
 *     body: JSON.stringify({
 *       access_key: import.meta.env.VITE_WEB3FORMS_KEY,
 *       subject: `New enquiry from ${values.name}`,
 *       ...values,
 *     }),
 *   });
 *   const data = await res.json();
 *   if (!data.success) throw new Error(data.message);
 *
 * ── Option B: EmailJS (npm i @emailjs/browser) ───────────────
 *   import emailjs from '@emailjs/browser';
 *   await emailjs.send(
 *     import.meta.env.VITE_EMAILJS_SERVICE_ID,
 *     import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
 *     values,
 *     { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY },
 *   );
 */
export async function submitContact(values) {
  await new Promise((resolve) => setTimeout(resolve, 1400));

  // Simulate a failure if the message contains "fail" (handy for testing the error UI).
  if (/\bfail\b/i.test(values.message)) {
    throw new Error('Simulated network error');
  }

  return { ok: true };
}
