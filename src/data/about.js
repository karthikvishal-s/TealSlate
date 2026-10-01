import workspace from '../assets/images/studio-workspace.webp';
import team from '../assets/images/studio-team.webp';
import shoot from '../assets/images/studio-shoot.webp';

// `accent: true` segments are highlighted in teal once the scroll-fill reaches them.
export const about = {
  label: 'The studio',
  statement: [
    { text: 'We are a creative production studio of designers, developers, filmmakers, and strategists. We turn' },
    { text: 'bold ideas', accent: true },
    { text: 'into brands people remember, websites people love to use, and stories people' },
    { text: 'actually watch.', accent: true },
  ],
  supporting: [
    'Strategy, design, code, and camera under one roof. That means fewer handoffs, faster decisions, and work that feels like one idea from the first frame to the last pixel.',
    'Small senior team, big ambitions. Every project is led by the people who actually make it.',
  ],
  // Floating parallax collage between the statement and the founders.
  collage: [
    { image: team, alt: 'A team gathered around a table in a strategy session', caption: 'Strategy sessions' },
    { image: shoot, alt: 'A photo studio set up with lights and a backdrop', caption: 'On set' },
    { image: workspace, alt: 'A bright, plant-filled creative workspace', caption: 'Where the work happens' },
  ],
};
