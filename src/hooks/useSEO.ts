import { useEffect } from 'react';
import { eurToZar } from '../lib/pricing';

interface SEOMeta {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  url?: string;
  price?: number;  // EUR price for product schema
  artist?: string;
  medium?: string;
  year?: number;
}

const BASE_TITLE = 'Mapheane';
const BASE_DESC  = 'Contemporary fine art from the Kingdom of Lesotho — mixed media painting, charcoal drawing, and glazed stoneware sculpture.';
const BASE_IMAGE = 'https://mapheane.art/og-default.jpg';
const BASE_URL   = 'https://mapheane.art';

export function useSEO({
  title, description, image, type = 'website', url,
  price, artist = 'Mapheane', medium, year,
}: SEOMeta = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    const desc      = description ?? BASE_DESC;
    const img       = image ?? BASE_IMAGE;
    const pageUrl   = url ? `${BASE_URL}/${url}` : BASE_URL;

    // Document title
    document.title = fullTitle;

    // Upsert a <meta> tag
    const setMeta = (selector: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (selector.startsWith('meta[name')) {
          el.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] ?? '');
        } else {
          el.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] ?? '');
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Standard meta
    setMeta('meta[name="description"]',         desc);
    setMeta('meta[name="robots"]',              'index, follow');
    setMeta('meta[name="author"]',              'Mapheane');

    // Open Graph
    setMeta('meta[property="og:title"]',        fullTitle);
    setMeta('meta[property="og:description"]',  desc);
    setMeta('meta[property="og:image"]',        img);
    setMeta('meta[property="og:url"]',          pageUrl);
    setMeta('meta[property="og:type"]',         type);
    setMeta('meta[property="og:site_name"]',    'Mapheane');
    setMeta('meta[property="og:locale"]',       'en_ZA');

    // Twitter Card
    setMeta('meta[name="twitter:card"]',        'summary_large_image');
    setMeta('meta[name="twitter:title"]',       fullTitle);
    setMeta('meta[name="twitter:description"]', desc);
    setMeta('meta[name="twitter:image"]',       img);
    setMeta('meta[name="twitter:creator"]',     '@mapheane_art');

    // JSON-LD structured data
    const existingLd = document.querySelector('#json-ld');
    if (existingLd) existingLd.remove();

    const ldScript = document.createElement('script');
    ldScript.id   = 'json-ld';
    ldScript.type = 'application/ld+json';

    if (type === 'product' && price) {
      ldScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description: desc,
        image: img,
        brand: { '@type': 'Person', name: artist },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'ZAR',
          price: eurToZar(price).toFixed(2),
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Person', name: artist },
        },
        ...(medium && { material: medium }),
        ...(year   && { dateCreated: year.toString() }),
      });
    } else {
      ldScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: BASE_TITLE,
        url: BASE_URL,
        description: BASE_DESC,
        author: {
          '@type': 'Person',
          name: 'Mapheane',
          jobTitle: 'Contemporary Visual Artist',
          address: { '@type': 'PostalAddress', addressCountry: 'LS', addressLocality: 'Maseru' },
        },
      });
    }
    document.head.appendChild(ldScript);

    return () => {
      document.title = BASE_TITLE;
      document.querySelector('#json-ld')?.remove();
    };
  }, [title, description, image, type, url, price, artist, medium, year]);
}
