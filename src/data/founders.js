/**
 * The two founders shown in the Studio section.
 *
 * Placeholder names and copy: edit freely.
 * Real photos: add a portrait (4:5 works best) to src/assets/founders/, then
 *   import aarav from '../assets/founders/aarav.jpg';
 * and set `photo: aarav`. Until then a stylized animated portrait is shown.
 */
export const foundersIntro = {
  label: 'The founders',
  heading: 'Meet the people behind TealSlate',
  body: 'TealSlate is founder-led by design. When you work with us, you work directly with the two people who started it: no account managers, no handoffs, no junior team you never meet.',
  badge: 'Founder-led • Small team • Big craft • ',
};

export const founders = [
  {
    id: 'aarav',
    name: 'Aarav Mehta',
    initials: 'AM',
    role: 'Co-founder · Creative & Technology',
    bio: 'A designer who codes. Aarav leads design, websites, and everything interactive, turning brand ideas into fast, beautiful experiences people enjoy using.',
    quote: 'We started TealSlate so ambitious businesses could get studio-grade craft without the big-agency price tag.',
    skills: ['Web design', 'Creative dev', 'Motion', 'UX strategy'],
    funFact: 'Will redesign a menu while waiting for the food.',
    socials: [
      { label: 'LinkedIn', href: 'https://linkedin.com/' },
      { label: 'Instagram', href: 'https://instagram.com/' },
    ],
    photo: null,
    palette: ['#2dd4bf', '#0f766e', '#f4c4a0'],
  },
  {
    id: 'riya',
    name: 'Riya Kapoor',
    initials: 'RK',
    role: 'Co-founder · Brand & Growth',
    bio: 'A storyteller with a strategist’s brain. Riya shapes positioning, campaigns, and content, making sure every pixel and every post moves the business forward.',
    quote: 'Every brand has a story worth telling. Our job is to make sure the right people actually hear it.',
    skills: ['Brand strategy', 'Campaigns', 'Content', 'Video'],
    funFact: 'Has a 40-tab browser window called “ideas”.',
    socials: [
      { label: 'LinkedIn', href: 'https://linkedin.com/' },
      { label: 'Instagram', href: 'https://instagram.com/' },
    ],
    photo: null,
    palette: ['#f4a68c', '#0f766e', '#d6efea'],
  },
];
