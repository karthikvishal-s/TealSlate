import { useRef } from 'react';
import { useScrollStretch } from '../lib/velocity';
import { clients } from '../data/clients';
import Marquee from '../components/Marquee';

function Logo({ client }) {
  return (
    // Hovering the reel dims every name except the one under the pointer.
    <span className="px-7 text-ink/70 transition-colors duration-300 ease-expo group-hover/reel:text-ink/35 hover:text-ink! md:px-12">
      {client.logo ? (
        <img src={client.logo} alt={client.name} loading="lazy" className="h-8 w-auto opacity-70 md:h-10" />
      ) : (
        <span className={`whitespace-nowrap text-2xl md:text-4xl ${client.style}`}>{client.name}</span>
      )}
    </span>
  );
}

export default function Clients() {
  const reel = useRef(null);
  useScrollStretch(reel);

  return (
    <section aria-labelledby="clients-title" className="border-y border-line py-16 md:py-24">
      <h2 id="clients-title" className="gutter mb-10 max-w-xl text-base font-semibold text-muted md:mb-14 md:text-lg">
        Trusted by startups, scale-ups, and household names across four continents.
      </h2>

      <ul className="sr-only">
        {clients.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>

      <div ref={reel} aria-hidden="true">
        <Marquee duration={44} pauseOnHover className="group/reel">
          {/* Repeat so each marquee copy is wider than the viewport */}
          {[...clients, ...clients].map((client, j) => (
            <Logo key={`${client.name}-${j}`} client={client} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
