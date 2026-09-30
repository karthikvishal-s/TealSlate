import { useEffect, useState } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { useLenis } from './hooks/useLenis';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Grain from './components/Grain';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Showreel from './sections/Showreel';
import Clients from './sections/Clients';
import About from './sections/About';
import Services from './sections/Services';
import Work from './sections/Work';
import Process from './sections/Process';
import Stats from './sections/Stats';
import Testimonials from './sections/Testimonials';
import Contact from './sections/Contact';

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
      <CustomCursor />
      <Grain />
      <Navbar ready={loaded} />

      <main id="main" className="relative z-10 bg-night">
        <Hero ready={loaded} />
        <Showreel />
        <Clients />
        <About />
        <Services />
        <Work />
        <Process />
        <Stats />
        <Testimonials />
        <Contact />
      </main>
    </>
  );
}
