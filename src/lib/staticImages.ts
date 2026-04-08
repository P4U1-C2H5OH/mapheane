/**
 * staticImages.ts
 *
 * Cloudinary URLs for static site images (hero, about, placeholders).
 * f_auto,q_auto → Cloudinary serves WebP/AVIF automatically and optimises
 * quality, cutting large PNGs to a fraction of their original size.
 */

const CDN = 'https://res.cloudinary.com/doy7pcli0/image/upload/f_auto,q_auto/mapheane/static';

export const STATIC_IMAGES = {
  /** About section — artist detail */
  artist:      `${CDN}/Img9.png`,
  /** About page — artist / secondary hero */
  heroSecondary:         `${CDN}/Image 3 no-bg.png`,
  /** About section — field panorama */
  field:        `${CDN}/image-4.png`,
  /** About page - basotho_context */
  falls: `${CDN}/falls.jpg`,
  /** Hero section cover */
  hero:         `${CDN}/Image 7 - Stylized Portrait b-white.png`,
} as const;
