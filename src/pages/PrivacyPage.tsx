import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (page: any) => void;
}

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: `When you use this website, we may collect the following information: your name and email address when you submit a contact or commission inquiry; your shipping address and payment details when you complete a purchase (payment details are processed directly by our payment provider and are never stored on our servers); and standard web analytics data such as pages visited and time spent on the site.

We do not collect any information without your knowledge or consent. We do not sell, rent, or share your personal information with third parties for marketing purposes.`,
  },
  {
    title: 'How We Use Your Information',
    body: `Information you provide is used solely to: respond to your inquiry or commission request; process and fulfil your order; send you order updates and shipping notifications; and, if you have subscribed, send you studio newsletters (you may unsubscribe at any time).

We do not use your information for profiling, targeted advertising, or any automated decision-making.`,
  },
  {
    title: 'Cookies and Analytics',
    body: `This website uses minimal, privacy-respecting analytics to understand how visitors use the site. No advertising cookies or cross-site tracking are used. You may disable cookies in your browser settings at any time without affecting your ability to use the site.`,
  },
  {
    title: 'Data Storage and Security',
    body: `Your data is stored securely and accessed only by Mapheane and the technical team managing this platform. We use industry-standard encryption for all data in transit (HTTPS). We retain your data only as long as necessary to fulfil the purpose for which it was collected, or as required by applicable law.`,
  },
  {
    title: 'Your Rights',
    body: `You have the right to: access the personal data we hold about you; request correction of inaccurate information; request deletion of your data; withdraw consent for marketing communications at any time; and lodge a complaint with a data protection authority if you believe your rights have been violated.

To exercise any of these rights, contact us at hello@mapheane.art.`,
  },
  {
    title: 'International Transfers',
    body: `This website is operated from Maseru, Kingdom of Lesotho. If you are accessing the site from outside Lesotho or Southern Africa, please be aware that your information may be transferred to and processed in jurisdictions with different data protection laws. By using this site, you consent to such transfer.`,
  },
  {
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of the site after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    title: 'Contact',
    body: `For any questions about this Privacy Policy or your personal data, please contact: hello@mapheane.art · Maseru, Kingdom of Lesotho.`,
  },
];

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-background min-h-screen pt-32 pb-24 px-6 md:px-12"
    >
      <div className="container mx-auto max-w-3xl">
        <button onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-12">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Home
        </button>

        <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-5">Legal</span>
        <h1 className="font-serif text-5xl md:text-6xl italic text-charcoal mb-4" style={{ letterSpacing: '-0.02em', lineHeight: '1.0' }}>
          Privacy Policy
        </h1>
        <p className="text-xs text-muted/60 font-sans mb-14">
          Effective date: 1 January 2025 · Mapheane · Maseru, Kingdom of Lesotho
        </p>

        <div className="w-12 h-px bg-terracotta/30 mb-14" />

        <p className="text-muted leading-relaxed mb-12 text-sm">
          Mapheane respects your privacy and is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights in relation to it. This site is operated from Maseru, Kingdom of Lesotho.
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.6 }}
              className="border-t border-charcoal/6 pt-8"
            >
              <h2 className="font-serif text-xl italic text-charcoal mb-4">{section.title}</h2>
              {section.body.split('\n\n').map((para, j) => (
                <p key={j} className="text-sm text-charcoal/70 leading-relaxed mb-3 last:mb-0">{para}</p>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
