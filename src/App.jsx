import { useEffect, useRef, useState } from 'react';
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
import Footer from './sections/Footer';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const { lenis } = useLenis();
  const footerRef = useRef(null);
  const [footer, setFooter] = useState({ height: 0, fixed: false });

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

  // Sticky footer reveal: <main> gets a bottom margin equal to the footer height,
  // unless the footer is taller than the viewport (then it just flows normally).
  useEffect(() => {
    const el = footerRef.current;
    const measure = () => {
      const height = el.offsetHeight;
      const fixed = height < window.innerHeight * 0.95;
      setFooter((prev) => (prev.height === height && prev.fixed === fixed ? prev : { height, fixed }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Page height changed, so trigger positions must be recalculated.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [footer]);

  return (
    <>
      <Preloader onComplete={() => setLoaded(true)} />
      <CustomCursor />
      <Grain />
      <Navbar ready={loaded} />

      <main
        id="main"
        className={`relative z-10 bg-night ${footer.fixed ? 'rounded-b-[2rem] shadow-[0_30px_60px_rgb(0_0_0/0.45)] md:rounded-b-[3rem]' : ''}`}
        style={{ marginBottom: footer.fixed ? footer.height : 0 }}
      >
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

      <Footer ref={footerRef} fixed={footer.fixed} />
    </>
  );
}
