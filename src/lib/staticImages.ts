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
  artist:      'https://res.cloudinary.com/doy7pcli0/image/upload/v1775624029/Img9_fiuwbd.png',
  /** About page — artist / secondary hero */
  heroSecondary: 'https://res.cloudinary.com/doy7pcli0/image/upload/v1775624028/Image_3_no-bg_widcuq.png',
  /** About page - basotho_context */
  falls: 'https://res.cloudinary.com/doy7pcli0/image/upload/v1775624019/falls_g5uhos.jpg',
  /** Hero section cover */
  hero:         'https://res.cloudinary.com/doy7pcli0/image/upload/v1775624029/Image_7_-_Stylized_Portrait_b-white_o9d8r3.png',
} as const;
