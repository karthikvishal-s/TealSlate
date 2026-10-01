import { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { easeExpo } from '../lib/motion';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { useReducedMotion } from '../hooks/useReducedMotion';

const tiltSpring = { stiffness: 160, damping: 18, mass: 0.4 };

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
      <svg viewBox="0 0 200 200" className="spin-slow absolute -left-1/4 -top-1/4 size-[150%] opacity-70">
        <path
          fill={c}
          fillOpacity="0.55"
          d="M47.6,-61.2C60.9,-52.6,70.1,-37.3,74.3,-20.6C78.5,-3.9,77.6,14.2,70.2,28.9C62.8,43.6,48.9,54.9,33.3,62.7C17.7,70.5,0.4,74.8,-17.6,72.6C-35.6,70.4,-54.3,61.7,-65.4,47.1C-76.5,32.5,-80,12,-76.4,-6.6C-72.8,-25.2,-62.1,-41.9,-47.6,-50.7C-33.1,-59.5,-16.5,-60.4,0.4,-60.9C17.4,-61.4,34.3,-69.8,47.6,-61.2Z"
          transform="translate(100 100)"
        />
      </svg>
      <svg viewBox="0 0 200 200" className="spin-slow-reverse absolute -bottom-1/3 -right-1/3 size-[120%] opacity-60">
        <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="2 6" />
        <circle cx="100" cy="100" r="52" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="0.6" />
      </svg>
      <div className="float-y absolute right-[14%] top-[12%] size-[22%] rounded-full bg-white/35 backdrop-blur-sm" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: 'radial-gradient(rgb(255 255 255) 1px, transparent 1px)', backgroundSize: '14px 14px' }}
      />
      <span className="absolute inset-0 grid place-items-center font-display text-[clamp(5rem,13vw,10rem)] font-bold tracking-tighter text-white drop-shadow-[0_8px_30px_rgb(20_33_31/0.25)]">
        {founder.initials}
      </span>
    </div>
  );
}

/**
 * Founder card with a pointer-following 3D tilt, moving light sheen, portrait zoom
 * and skill chips that pop in on hover (Motion only; GSAP animates the parents).
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
    rotateY.set((px - 0.5) * 12);
    rotateX.set(-(py - 0.5) * 10);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  };

  const showChips = hovered || !interactive;

  return (
    <motion.article
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className="group relative rounded-[2rem] border border-line bg-card p-3 shadow-[0_30px_80px_-40px_rgb(20_33_31/0.35)] md:p-4"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
        <div className="absolute inset-0 transition-transform duration-1000 ease-expo group-hover:scale-[1.06]">
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
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: glare }}
          />
        )}

        <span className="absolute left-4 top-4 rounded-full bg-paper/85 px-3 py-1 font-display text-xs font-bold text-ink backdrop-blur-md">
          0{index + 1}
        </span>

        {/* Skills pop in on hover (always visible on touch) */}
        <motion.ul
          aria-label={`${founder.name}'s focus areas`}
          className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2"
          initial={false}
          animate={showChips ? 'show' : 'hide'}
          variants={{ show: { transition: { staggerChildren: 0.06 } }, hide: {} }}
        >
          {founder.skills.map((skill) => (
            <motion.li
              key={skill}
              className="rounded-full bg-paper/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-md"
              variants={{
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: easeExpo } },
                hide: { opacity: 0, y: 14, scale: 0.9, transition: { duration: 0.25 } },
              }}
            >
              {skill}
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <div className="px-2 pb-3 pt-6 md:px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">{founder.role}</p>
        <h4 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{founder.name}</h4>
        <p className="mt-4 text-base leading-relaxed text-muted">{founder.bio}</p>
        <p className="mt-5 flex items-start gap-2 text-sm text-ink/80">
          <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal" />
          {founder.funFact}
        </p>
        <ul className="mt-6 flex gap-5 border-t border-line pt-5 text-sm font-medium">
          {founder.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-line underline-offset-4 transition-colors duration-300 hover:text-teal hover:decoration-teal"
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
