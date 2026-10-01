import { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { easeExpo } from '../lib/motion';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { useReducedMotion } from '../hooks/useReducedMotion';

const tiltSpring = { stiffness: 260, damping: 22, mass: 0.3 };

/** Animated abstract portrait used until a real founder photo is added. */
function PortraitArt({ founder }) {
  const [a, b, c] = founder.palette;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ background: `linear-gradient(160deg, ${c} 0%, ${a} 55%, ${b} 100%)` }}
    >
      {/* Slowly rotating organic shapes */}
      <div className="portrait-anim spin-slow absolute -left-1/4 -top-1/4 size-[150%] opacity-70">
        <svg viewBox="0 0 200 200" className="size-full">
          <path
            fill={c}
            fillOpacity="0.55"
            d="M47.6,-61.2C60.9,-52.6,70.1,-37.3,74.3,-20.6C78.5,-3.9,77.6,14.2,70.2,28.9C62.8,43.6,48.9,54.9,33.3,62.7C17.7,70.5,0.4,74.8,-17.6,72.6C-35.6,70.4,-54.3,61.7,-65.4,47.1C-76.5,32.5,-80,12,-76.4,-6.6C-72.8,-25.2,-62.1,-41.9,-47.6,-50.7C-33.1,-59.5,-16.5,-60.4,0.4,-60.9C17.4,-61.4,34.3,-69.8,47.6,-61.2Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      <div className="portrait-anim spin-slow-reverse absolute -bottom-1/3 -right-1/3 size-[120%] opacity-60">
        <svg viewBox="0 0 200 200" className="size-full">
          <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="2 6" />
          <circle cx="100" cy="100" r="52" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="0.6" />
        </svg>
      </div>
      <div className="portrait-anim float-y absolute right-[14%] top-[12%] size-[22%] rounded-full bg-white/35" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: 'radial-gradient(rgb(255 255 255) 1px, transparent 1px)', backgroundSize: '12px 12px' }}
      />
      <span className="absolute inset-0 grid place-items-center font-display text-[clamp(3.5rem,7vw,5.5rem)] font-bold tracking-tighter text-white drop-shadow-[0_6px_24px_rgb(20_33_31/0.25)]">
        {founder.initials}
      </span>
    </div>
  );
}

/**
 * Founder card with a pointer-following 3D tilt, moving light sheen, portrait zoom
 * and focus chips that lift on hover (Motion only; GSAP animates the parents).
 */
export default function FounderCard({ founder, index }) {
  const ref = useRef(null);
  const touch = useIsTouchDevice();
  const reduced = useReducedMotion();
  const interactive = !touch && !reduced;
  const [hovered, setHovered] = useState(false);

  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(30);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.5), transparent 55%)`;

  const onPointerMove = (e) => {
    if (!interactive || e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rotateY.set((px - 0.5) * 10);
    rotateX.set(-(py - 0.5) * 8);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  };

  return (
    <motion.article
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="group relative flex h-full flex-col rounded-[1.75rem] border border-line bg-card p-2.5 shadow-[0_24px_60px_-36px_rgb(20_33_31/0.35)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem]">
        <div className="absolute inset-0 transition-transform duration-500 ease-expo group-hover:scale-[1.05]">
          {founder.photo ? (
            <img
              src={founder.photo}
              alt={`Portrait of ${founder.name}`}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <PortraitArt founder={founder} />
          )}
        </div>

        {/* Sheen that follows the pointer */}
        {interactive && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare }}
          />
        )}

        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-0.5 font-display text-[11px] font-bold text-ink">
          0{index + 1}
        </span>

        {/* Focus areas sit on the portrait and lift with a quick stagger on hover */}
        <motion.ul
          aria-label={`${founder.name}'s focus areas`}
          className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5"
          initial={false}
          animate={hovered ? 'lift' : 'rest'}
          variants={{ lift: { transition: { staggerChildren: 0.035 } }, rest: {} }}
        >
          {founder.skills.map((skill) => (
            <motion.li
              key={skill}
              className="rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm"
              variants={{
                lift: { y: -4, transition: { duration: 0.25, ease: easeExpo } },
                rest: { y: 0, transition: { duration: 0.2 } },
              }}
            >
              {skill}
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">{founder.role}</p>
        <h4 className="mt-1.5 font-display text-2xl font-bold tracking-tight">{founder.name}</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted">{founder.bio}</p>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-ink/75">
          <Sparkles aria-hidden="true" className="mt-px size-3.5 shrink-0 text-teal" />
          {founder.funFact}
        </p>
        {/* Spacer keeps the links aligned at the bottom when the two cards differ in copy length */}
        <div className="flex-1" />
        <ul className="mt-4 flex gap-4 border-t border-line pt-3 text-xs font-medium">
          {founder.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-teal hover:decoration-teal"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
