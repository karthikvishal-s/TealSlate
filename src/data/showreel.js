import posterImage from '../assets/images/showreel-poster.webp';

/**
 * Showreel config.
 * Drop your video into /public (e.g. /public/video/showreel.mp4) and set:
 *   videoSrc: '/video/showreel.mp4'
 *   poster:   '/video/showreel-poster.jpg'
 * While videoSrc is null, the poster image is shown as a still (with the same scroll animation).
 */
export const showreel = {
  videoSrc: null,
  poster: posterImage,
  title: 'Showreel',
  year: '2026',
  caption: 'Two minutes of our favourite frames: brand films, launches, and late nights in the edit suite.',
};
