import { ArrowUpRight } from 'lucide-react';
import { contact } from '../data/contact';
import { site, socials } from '../data/site';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';
import Magnetic from '../components/Magnetic';
import ContactForm from '../components/ContactForm';
import RollingText from '../components/RollingText';

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="gutter py-28 md:py-40">
      <SectionLabel index="(06)">Contact</SectionLabel>

      {/* Motion (magnetic) on the wrapper, GSAP (split reveal) on the heading inside: never the same element */}
      <Magnetic strength={0.08} className="mt-6 inline-block">
        <SplitTextReveal
          id="contact-title"
          type="words"
          className="font-display text-mega font-bold"
        >
          Let&apos;s <span className="text-teal">talk</span>
        </SplitTextReveal>
      </Magnetic>

      <div className="mt-16 grid gap-16 md:mt-24 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-4">
          <p className="max-w-sm text-lg leading-relaxed text-muted">{contact.intro}</p>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted">Email us</p>
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              <RollingText>{site.email}</RollingText>
              <ArrowUpRight aria-hidden="true" className="size-6 text-teal transition-transform duration-500 ease-expo group-hover:rotate-45" />
            </a>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted">Follow along</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="group text-sm font-medium">
                    <RollingText>{s.label}</RollingText>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
