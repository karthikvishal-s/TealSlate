import { clients } from '../data/clients';
import Marquee from '../components/Marquee';
import SectionLabel from '../components/SectionLabel';

function Logo({ client }) {
  return (
    <span className="flex items-center gap-10 px-5 md:gap-16 md:px-8">
      {client.logo ? (
        <img src={client.logo} alt={client.name} loading="lazy" className="h-8 w-auto opacity-70 md:h-10" />
      ) : (
        <span className={`whitespace-nowrap text-2xl text-ink/70 md:text-4xl ${client.style}`}>{client.name}</span>
      )}
      <span aria-hidden="true" className="size-2 rotate-45 bg-teal/60" />
    </span>
  );
}

export default function Clients() {
  const half = Math.ceil(clients.length / 2);
  const rows = [clients.slice(0, half), clients.slice(half)];

  return (
    <section aria-labelledby="clients-title" className="border-y border-line py-16 md:py-24">
      <div className="gutter mb-10 flex items-end justify-between gap-6 md:mb-14">
        <SectionLabel>
          <span id="clients-title">Trusted by</span>
        </SectionLabel>
        <p className="max-w-xs text-right text-sm text-muted">
          Startups, scale-ups, and household names across four continents.
        </p>
      </div>

      <ul className="sr-only">
        {clients.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>

      <div aria-hidden="true" className="flex flex-col gap-6 md:gap-10">
        {rows.map((row, i) => (
          <Marquee key={i} duration={i ? 38 : 32} direction={i ? -1 : 1}>
            {/* Repeat the row so each marquee copy is wider than the viewport */}
            {[...row, ...row].map((client, j) => (
              <Logo key={`${client.name}-${j}`} client={client} />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
