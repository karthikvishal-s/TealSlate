import { useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import Contact from '../sections/Contact';

/** The contact page: one night panel from the top edge down, the navbar sitting on it. */
export default function ContactPage({ ready }) {
  usePageMeta({
    title: "Contact | TealSlate: Let's make it move",
    description:
      'Start a project with TealSlate. Tell us about your goals and we will reply within one business day with next steps, a rough timeline, and the right people.',
    path: '/contact',
  });

  // Night all the way out: overscroll bounce and the mobile browser chrome match the page.
  useEffect(() => {
    const html = document.documentElement;
    const meta = document.head.querySelector('meta[name="theme-color"]');
    const previous = meta?.getAttribute('content');
    html.classList.add('is-night');
    meta?.setAttribute('content', '#0B0F0E');
    return () => {
      html.classList.remove('is-night');
      if (previous) meta?.setAttribute('content', previous);
    };
  }, []);

  return <Contact ready={ready} />;
}
