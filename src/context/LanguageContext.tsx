import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'st'; // English | Sesotho

// Core UI strings — extend as needed
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.gallery':     'Gallery',
    'nav.about':       'About',
    'nav.commissions': 'Commissions',
    'nav.workshops':   'Workshops',
    'nav.shop':        'Shop',
    'nav.moments':     'Moments',
    'nav.events':      'Events',
    'nav.contact':     'Contact',
    // Hero
    'hero.tagline':    'Contemporary fine art from the Kingdom of Lesotho',
    'hero.cta.gallery':'Explore Gallery',
    'hero.cta.commission': 'Commission a Work',
    // Common
    'available':       'Available',
    'sold':            'Sold',
    'add.to.cart':     'Add to Cart',
    'save':            'Save to Wishlist',
    'enquire':         'Enquire',
    'commission':      'Commission Similar',
    'view.full':       'View Full',
    'close':           'Close',
    'back':            'Back',
    'send.message':    'Send Message',
    'name':            'Name',
    'email':           'Email',
    'phone':           'Phone',
    'message':         'Message',
    // Membership
    'circle.title':    "Collector's Circle",
    'circle.sub':      'Join Mapheane\'s inner studio community',
    'join.now':        'Join Now',
    // Checkout
    'checkout.delivery': 'Delivery',
    'checkout.pickup':   'Pickup',
    'checkout.free':     'Free',
    // Footer
    'footer.newsletter': 'Studio Letters',
    'footer.newsletter.sub': 'New works, process notes, and collector previews.',
    'footer.subscribe':  'Subscribe',
  },
  st: {
    // Nav
    'nav.gallery':     'Pokello',
    'nav.about':       'Ka Nna',
    'nav.commissions': 'Commissions',
    'nav.workshops':   'Likilasi',
    'nav.shop':        'Duka',
    'nav.moments':     'Metsotso',
    'nav.events':      'Liketsahalo',
    'nav.contact':     'Ikopanye',
    // Hero
    'hero.tagline':    'Bonono ba sejoale-joale ho tsoa Mmuso oa Lesotho',
    'hero.cta.gallery':'Hlahloba Pokello',
    'hero.cta.commission': 'Laela Mosebetsi',
    // Common
    'available':       'E Fumaneha',
    'sold':            'E Rekisitsoe',
    'add.to.cart':     'Kenya Karateng',
    'save':            'Boloka',
    'enquire':         'Botsa',
    'commission':      'Commission E Tšoanang',
    'view.full':       'Bona Kaofela',
    'close':           'Koala',
    'back':            'Khutlela',
    'send.message':    'Romela Molaetsa',
    'name':            'Lebitso',
    'email':           'Imeile',
    'phone':           'Mohala',
    'message':         'Molaetsa',
    // Membership
    'circle.title':    'Sehlopha sa Barekisi',
    'circle.sub':      'Kenela sehlopha sa motse-bona oa Mapheane',
    'join.now':        'Kenela Joale',
    // Checkout
    'checkout.delivery': 'Pitso',
    'checkout.pickup':   'Tšeho',
    'checkout.free':     'Mahala',
    // Footer
    'footer.newsletter': 'Mangolo a Motse-bona',
    'footer.newsletter.sub': 'Mesebetsi e mecha, maemo a tšebetso, le lipuisano tsa barekisi.',
    'footer.subscribe':  'Ngolisa',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string): string => {
    return TRANSLATIONS[lang][key] ?? TRANSLATIONS['en'][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
