import Hero from '../sections/Hero';
import Clients from '../sections/Clients';
import About from '../sections/About';
import Services from '../sections/Services';
import Work from '../sections/Work';
import Process from '../sections/Process';
import Stats from '../sections/Stats';
import Testimonials from '../sections/Testimonials';

/** The landing page. `ready` flips once the preloader hands over (it drives the hero entrance). */
export default function Home({ ready }) {
  return (
    <>
      <Hero ready={ready} />
      <Clients />
      <About />
      <Services />
      <Work />
      <Process />
      <Stats />
      <Testimonials />
    </>
  );
}
