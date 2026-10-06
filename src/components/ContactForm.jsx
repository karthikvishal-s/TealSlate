import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowUpRight, Check, ChevronDown, LoaderCircle } from 'lucide-react';
import { easeExpo } from '../lib/motion';
import { contact } from '../data/contact';
import { submitContact } from '../lib/submitContact';
import MagneticButton from './MagneticButton';
import { useLenis } from '../hooks/useLenis';
import { useReducedMotion } from '../hooks/useReducedMotion';

const INITIAL = { name: '', email: '', company: '', service: '', budget: '', message: '', botcheck: false };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
  const errors = {};
  if (!v.name.trim()) errors.name = 'Please tell us your name.';
  if (!v.email.trim()) errors.email = 'We need an email to reply to.';
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = 'That email doesn’t look quite right.';
  if (!v.service) errors.service = 'Pick the service you’re interested in.';
  if (!v.budget) errors.budget = 'Choose a rough budget range.';
  if (v.message.trim().length < 20) errors.message = 'A little more detail helps (20+ characters).';
  return errors;
}

const inputBase =
  'peer w-full border-0 border-b bg-transparent px-0 py-3 text-lg text-current placeholder:text-muted/50 outline-none transition-colors duration-300 focus:border-teal focus-visible:outline-none aria-[invalid=true]:border-rose-400';

function Field({ id, label, error, optional, children }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 flex items-baseline justify-between text-xs uppercase tracking-[0.22em] text-muted">
        {label}
        {optional && <span className="normal-case tracking-normal text-muted/60">Optional</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            className="mt-2 flex items-center gap-1.5 text-sm text-rose-400"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: easeExpo }}
          >
            <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactForm() {
  const formRef = useRef(null);
  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const { scrollTo } = useLenis();
  const reduced = useReducedMotion();

  const errors = validate(values);
  const showError = (name) => (touched[name] || submitted) && errors[name];

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
    if (status === 'error') setStatus('idle');
  };
  const blur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      // Glide to the first invalid field, focus it, and give it a small nudge.
      const first = Object.keys(errors)[0];
      const field = formRef.current.querySelector(`[name="${first}"]`);
      if (!field) return;
      scrollTo(field, { offset: -160 });
      field.focus({ preventScroll: true });
      if (!reduced) {
        field.closest(field.type === 'radio' ? 'fieldset' : '.relative')?.animate(
          [0, -2, 2, -2, 2, 0].map((x) => ({ transform: `translateX(${x}px)` })),
          { duration: 240, easing: 'ease-in-out' },
        );
      }
      return;
    }
    setStatus('submitting');
    try {
      // Honeypot: bots tick hidden checkboxes; pretend success and drop it.
      if (!values.botcheck) {
        const { botcheck: _bot, ...payload } = values;
        await submitContact(payload);
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(INITIAL);
    setTouched({});
    setSubmitted(false);
    setStatus('idle');
  };

  const aria = (name) => ({
    'aria-invalid': showError(name) ? true : undefined,
    'aria-describedby': showError(name) ? `${name}-error` : undefined,
  });

  return (
    <div className="relative">
      {/* popLayout: the form steps out of the flow while the send button grows into the
          confirmation card (shared layoutId), so the reply reads as the result of the click. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {status === 'success' ? (
          <motion.div
            key="success"
            layoutId={reduced ? undefined : 'contact-send'}
            role="status"
            className="flex min-h-[32rem] flex-col items-start justify-center border border-line bg-paper/[0.04] p-8 md:p-12"
            style={{ borderRadius: 24 }}
            initial={reduced ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeExpo }}
          >
            {[
              <span key="icon" className="draw-check grid size-16 place-items-center rounded-full bg-teal text-night">
                <Check aria-hidden="true" className="size-8" strokeWidth={2.5} />
              </span>,
              <h3 key="title" className="mt-8 font-display text-4xl font-bold tracking-tight md:text-5xl">
                {contact.successTitle}
              </h3>,
              <p key="body" className="mt-4 max-w-md text-lg leading-relaxed text-muted">
                {contact.successBody}
              </p>,
              <button
                key="again"
                type="button"
                onClick={reset}
                className="mt-10 text-sm font-semibold text-teal underline decoration-teal/40 underline-offset-8 transition-colors hover:decoration-teal"
              >
                Send another message
              </button>,
            ].map((el, i) => (
              <motion.div
                key={el.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: easeExpo, delay: 0.3 + i * 0.06 }}
              >
                {el}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            aria-label="Project enquiry"
            className="grid gap-x-8 gap-y-10 md:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.6, ease: easeExpo }}
          >
            <Field id="name" label="Your name" error={showError('name')}>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={values.name}
                onChange={update}
                onBlur={blur}
                className={`${inputBase} border-line`}
                {...aria('name')}
              />
            </Field>

            <Field id="email" label="Email" error={showError('email')}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="jane@company.com"
                value={values.email}
                onChange={update}
                onBlur={blur}
                className={`${inputBase} border-line`}
                {...aria('email')}
              />
            </Field>

            <Field id="company" label="Company" optional>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="Company or brand"
                value={values.company}
                onChange={update}
                className={`${inputBase} border-line`}
              />
            </Field>

            <Field id="service" label="Service" error={showError('service')}>
              <div className="relative">
                <select
                  id="service"
                  name="service"
                  value={values.service}
                  onChange={update}
                  onBlur={blur}
                  className={`${inputBase} appearance-none border-line pr-8 ${values.service ? '' : 'text-muted/70'}`}
                  {...aria('service')}
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {contact.serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 top-1/2 size-5 -translate-y-1/2 text-muted"
                />
              </div>
            </Field>

            <fieldset
              className="md:col-span-2"
              aria-invalid={showError('budget') ? true : undefined}
              aria-describedby={showError('budget') ? 'budget-error' : undefined}
            >
              <legend className="mb-4 text-xs uppercase tracking-[0.22em] text-muted">Budget range</legend>
              <div className="flex flex-wrap gap-2.5">
                {contact.budgetOptions.map((opt) => (
                  <label key={opt} className="relative">
                    <input
                      type="radio"
                      name="budget"
                      value={opt}
                      checked={values.budget === opt}
                      onChange={update}
                      onBlur={blur}
                      className="peer sr-only"
                    />
                    <span className="block rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:border-paper/40 peer-checked:border-teal peer-checked:bg-teal peer-checked:text-night peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-teal">
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
              <AnimatePresence initial={false}>
                {showError('budget') && (
                  <motion.p
                    id="budget-error"
                    className="mt-3 flex items-center gap-1.5 text-sm text-rose-400"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35, ease: easeExpo }}
                  >
                    <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
                    {errors.budget}
                  </motion.p>
                )}
              </AnimatePresence>
            </fieldset>

            <div className="md:col-span-2">
              <Field id="message" label="Project details" error={showError('message')}>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your goals, timeline, and what success looks like."
                  value={values.message}
                  onChange={update}
                  onBlur={blur}
                  className={`${inputBase} resize-none border-line`}
                  {...aria('message')}
                />
              </Field>
            </div>

            {/* Honeypot (hidden from people and assistive tech) */}
            <input
              type="checkbox"
              name="botcheck"
              checked={values.botcheck}
              onChange={update}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <div className="flex flex-col-reverse items-start gap-6 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <div aria-live="polite" className="min-h-6 text-sm">
                {status === 'error' && (
                  <p role="alert" className="flex items-center gap-2 text-rose-400">
                    <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
                    Something went wrong sending your message. Please try again or email us directly.
                  </p>
                )}
              </div>
              <MagneticButton
                type="submit"
                layoutId={reduced ? undefined : 'contact-send'}
                variant="paper"
                size="lg"
                disabled={status === 'submitting'}
                icon={status === 'submitting' ? undefined : ArrowUpRight}
                className="shrink-0"
              >
                {status === 'submitting' ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send message'
                )}
              </MagneticButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
