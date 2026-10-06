import { useEffect } from 'react';
import Contact from '../sections/Contact';

const TITLE = "Contact | TealSlate: Let's make it move";

/** The contact page: the dark contact panel, with room above it for the fixed navbar. */
export default function ContactPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="pt-24 md:pt-28">
      <Contact />
    </div>
  );
}
