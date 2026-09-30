import { useEffect, useState } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { useLenis } from './hooks/useLenis';
import Preloader from './components/Preloader';
import Grain from './components/Grain';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const { lenis } = useLenis();

  // Scroll is locked until the preloader hands over.
  useEffect(() => {
    if (!lenis) return;
    if (loaded) lenis.start();
    else lenis.stop();
  }, [lenis, loaded]);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.remove('is-loading');
    ScrollTrigger.refresh();
  }, [loaded]);

  return (
    <>
      <Preloader onComplete={() => setLoaded(true)} />
      <Grain />

      <main id="main" className="relative z-10 bg-night">
      </main>
    </>
  );
}
