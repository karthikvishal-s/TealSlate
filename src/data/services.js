import web from '../assets/images/service-web.webp';
import marketing from '../assets/images/service-marketing.webp';
import promotion from '../assets/images/service-promotion.webp';
import branding from '../assets/images/service-branding.webp';
import video from '../assets/images/service-video.webp';
import social from '../assets/images/service-social.webp';

// `image`: swap for your own work in src/assets/images/ (see CREDITS.md for the current stock photos).
export const services = [
  {
    id: 'web',
    image: web,
    title: 'Web Design & Development',
    description:
      'Fast, immersive websites built to convert. From motion-rich brand sites to headless e-commerce, designed and engineered in-house.',
    tags: ['UX / UI', 'Creative dev', 'E-commerce', 'CMS'],
  },
  {
    id: 'marketing',
    image: marketing,
    title: 'Digital Marketing',
    description:
      'Performance campaigns grounded in creative that stops the scroll. We plan, produce, launch, and optimise across search, social, and display.',
    tags: ['Paid social', 'SEO', 'Analytics', 'CRO'],
  },
  {
    id: 'promotion',
    image: promotion,
    title: 'Brand Promotion',
    description:
      'Launches and activations that get people talking. Integrated campaigns, partnerships, and content built around a single sharp idea.',
    tags: ['Campaigns', 'Launches', 'Activations', 'PR assets'],
  },
  {
    id: 'branding',
    image: branding,
    title: 'Branding & Identity',
    description:
      'Strategy-led identities with a point of view. Naming, positioning, visual systems, and guidelines that scale from favicon to billboard.',
    tags: ['Strategy', 'Naming', 'Visual identity', 'Guidelines'],
  },
  {
    id: 'video',
    image: video,
    title: 'Video Production',
    description:
      'Brand films, product spots, and social cuts, handled from treatment to final grade. Our in-house crew shoots, edits, animates, and finishes.',
    tags: ['Brand films', 'Commercials', 'Motion design', 'Post'],
  },
  {
    id: 'social',
    image: social,
    title: 'Social Media Management',
    description:
      'Always-on content engines. We build the calendar, shoot the content, run the community, and report on what actually moved the needle.',
    tags: ['Content', 'Community', 'Creators', 'Reporting'],
  },
];
