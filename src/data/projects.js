import aurora from '../assets/images/work-aurora.webp';
import monsoon from '../assets/images/work-monsoon.webp';
import koyo from '../assets/images/work-koyo.webp';
import fieldnote from '../assets/images/work-fieldnote.webp';
import harbor from '../assets/images/work-harbor.webp';
import pulse from '../assets/images/work-pulse.webp';

/**
 * Selected work.
 * `image`: imported from src/assets/images/ (stock placeholders, see CREDITS.md); swap for real case-study shots.
 * When null, the `gradient` is used as a placeholder.
 */
export const projects = [
  {
    id: 'aurora',
    name: 'Aurora Coffee',
    category: 'Branding · Packaging',
    year: '2026',
    href: '#',
    image: aurora,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 45%, #1c1917 100%)',
  },
  {
    id: 'monsoon',
    name: 'Monsoon Mobility',
    category: 'Website · Launch campaign',
    year: '2025',
    href: '#',
    image: monsoon,
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0e7490 50%, #0b1215 100%)',
  },
  {
    id: 'koyo',
    name: 'Kōyō Skincare',
    category: 'Brand film · Social',
    year: '2025',
    href: '#',
    image: koyo,
    gradient: 'linear-gradient(135deg, #fda4af 0%, #e11d48 55%, #3f0d1a 100%)',
  },
  {
    id: 'fieldnote',
    name: 'Fieldnote',
    category: 'Digital marketing · CRO',
    year: '2024',
    href: '#',
    image: fieldnote,
    gradient: 'linear-gradient(135deg, #a3e635 0%, #15803d 55%, #052e16 100%)',
  },
  {
    id: 'harbor',
    name: 'Harbor & Pine',
    category: 'Identity · Web design',
    year: '2024',
    href: '#',
    image: harbor,
    gradient: 'linear-gradient(135deg, #93c5fd 0%, #4338ca 55%, #1e1b4b 100%)',
  },
  {
    id: 'pulse',
    name: 'Pulse Arena',
    category: 'Social · Event promotion',
    year: '2023',
    href: '#',
    image: pulse,
    gradient: 'linear-gradient(135deg, #f0abfc 0%, #9333ea 50%, #1e0b2e 100%)',
  },
];
