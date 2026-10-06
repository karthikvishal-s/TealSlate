import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { ScrollTrigger } from './lib/gsap';
import { useLenis } from './hooks/useLenis';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Grain from './components/Grain';
import Navbar from './components/Navbar';
import { PageTransitionProvider } from './components/PageTransition';
import Footer from './sections/Footer';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';

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
    <PageTransitionProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-teal focus:px-5 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>

      <Preloader onComplete={() => setLoaded(true)} />
      <CustomCursor />
      <Grain />
      <Navbar ready={loaded} />

      <main
        id="main"
        tabIndex={-1}
        data-rounded={footer.fixed}
        className={`group/main relative z-10 bg-paper outline-none ${footer.fixed ? 'rounded-b-[2rem] shadow-[0_30px_60px_rgb(0_0_0/0.45)] md:rounded-b-[3rem]' : ''}`}
        style={{ marginBottom: footer.fixed ? footer.height : 0 }}
      >
        <Routes>
          <Route path="/" element={<Home ready={loaded} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer ref={footerRef} fixed={footer.fixed} />
    </PageTransitionProvider>
  );
}
