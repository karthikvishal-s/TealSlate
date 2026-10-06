import { usePageMeta } from '../hooks/usePageMeta';
import Contact from '../sections/Contact';

/** The contact page: the dark contact panel, with room above it for the fixed navbar. */
export default function ContactPage() {
  usePageMeta({
    title: "Contact | TealSlate: Let's make it move",
    description:
      'Start a project with TealSlate. Tell us about your goals and we will reply within one business day with next steps, a rough timeline, and the right people.',
    path: '/contact',
  });

  return (
    <div className="pt-24 md:pt-28">
      <Contact />
    </div>
  );
}
