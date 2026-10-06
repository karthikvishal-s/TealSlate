import team from '../assets/images/studio-team.webp';
import workspace from '../assets/images/studio-workspace.webp';
import shoot from '../assets/images/studio-shoot.webp';
import reel from '../assets/images/showreel-poster.webp';

// `weeks`: [first, last] week of the engagement (null = ongoing).
// `image`: the print pinned at this stop on the Process map.
export const process = [
  {
    title: 'Discover',
    image: team,
    weeks: [1, 2],
    duration: 'Week 1-2',
    description:
      'We dig into your business, audience, and competitors through workshops, interviews, and audits, so we solve the right problem, not just the brief.',
  },
  {
    title: 'Strategize',
    image: workspace,
    weeks: [2, 3],
    duration: 'Week 2-3',
    description:
      'Insights become a sharp positioning, a creative platform, and a roadmap with clear goals, channels, and metrics everyone signs off on.',
  },
  {
    title: 'Create',
    image: shoot,
    weeks: [3, 10],
    duration: 'Week 3-10',
    description:
      'Designers, developers, and filmmakers build in tight loops. You see real work early and often, not a big reveal at the end.',
  },
  {
    title: 'Launch & Grow',
    image: reel,
    weeks: [10, null],
    duration: 'Ongoing',
    description:
      'We ship, measure, and iterate. Post-launch we stay on as your creative partner, optimising campaigns and evolving the brand as you scale.',
  },
];
