import React from 'react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

const LABELS: Record<Language, string> = {
  en: 'EN',
  st: 'ST',
};

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const other: Language   = lang === 'en' ? 'st' : 'en';

  return (
    <div className={`flex items-center gap-0 border border-charcoal/12 overflow-hidden ${className}`}>
      {(['en', 'st'] as Language[]).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 text-xs font-sans uppercase tracking-wider transition-all duration-200 ${
            lang === l
              ? 'bg-charcoal text-background'
              : 'text-muted hover:text-charcoal bg-transparent'
          }`}
          aria-label={l === 'en' ? 'Switch to English' : 'Switch to Sesotho'}
          aria-pressed={lang === l}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
