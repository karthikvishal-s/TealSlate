import { Quote } from 'lucide-react';
import { testimonials } from '../data/testimonials';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';

export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="overflow-hidden py-28 md:py-40">
      <div className="gutter">
        <div className="mb-16 md:mb-24">
          <SectionLabel index="(05)">Kind words</SectionLabel>
          <SplitTextReveal id="testimonials-title" className="mt-6 font-display text-display font-bold">
            Clients who <span className="text-teal">stay</span>
          </SplitTextReveal>
        </div>

        <ul className="relative flex flex-col items-center gap-5 lg:flex-row lg:flex-wrap lg:items-start lg:justify-center lg:gap-6">
          {testimonials.map((t) => (
            <li key={t.name} className="relative w-full max-w-[34rem] lg:w-[min(26rem,28vw)] lg:max-w-none">
              <figure className="flex min-h-[22rem] flex-col justify-between rounded-3xl border border-line p-7 md:p-10 bg-card">
                <Quote aria-hidden="true" className="size-9 fill-teal/20 text-teal" />
                <blockquote className="mt-7 font-display text-lg font-medium leading-snug tracking-tight md:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-line pt-6">
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-teal/15 font-display text-sm font-bold text-teal"
                  >
                    {t.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                  <span>
                    <cite className="block font-semibold not-italic">{t.name}</cite>
                    <span className="text-sm text-muted">
                      {t.role}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
