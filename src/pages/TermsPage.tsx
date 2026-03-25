import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (page: any) => void;
}

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: `By accessing or using this website, you agree to be bound by these Terms of Use. If you do not agree, please do not use this site. These terms apply to all visitors, including those who purchase artworks, commission works, or book workshops.`,
  },
  {
    title: 'Original Artwork Sales',
    body: `All original artworks are one-of-a-kind works. Once sold, the physical work transfers to the buyer. Mapheane retains all intellectual property rights including copyright, reproduction rights, and the right to photograph and publish the work.

Prices are listed in South African Rand (ZAR) with approximate equivalents in EUR. The final price at checkout reflects the rate at time of purchase. All sales are final; returns are not accepted for original artworks unless the work arrives damaged (see Shipping & Damage policy below).`,
  },
  {
    title: 'Print Editions',
    body: `Limited edition prints are produced in fixed quantities. Each print is numbered, signed, and accompanied by a Certificate of Authenticity. Edition numbers are assigned in order of purchase. Open edition prints are signed but not numbered.

Prints are non-returnable. If a print arrives damaged, contact us within 7 days with photographic evidence and we will arrange a replacement.`,
  },
  {
    title: 'Commissions',
    body: `Commission agreements are governed by a separate commission contract provided at the time of inquiry acceptance. Key terms include: a non-refundable first payment securing the commission slot; two revision rounds included in the agreed price; copyright remaining with Mapheane; and the client bearing all customs, import duties, and shipping costs.

Cancellation after work has commenced results in forfeiture of all payments made to date.`,
  },
  {
    title: 'Workshops and Retreats',
    body: `Workshop bookings are confirmed upon receipt of payment. Cancellations made more than 30 days before the event are refunded in full minus an administrative fee. Cancellations within 8–30 days receive a credit toward a future workshop. Cancellations within 7 days are non-refundable but may be transferred to another participant.

Mapheane reserves the right to cancel or reschedule a workshop due to illness, force majeure, or insufficient bookings. In such cases, participants receive a full refund or the option to transfer to another date.`,
  },
  {
    title: 'Intellectual Property',
    body: `All content on this website — including artwork images, text, design, and photography — is the intellectual property of Mapheane and may not be reproduced, distributed, or used without express written permission. This includes screenshots, downloads, and social media reposts of artwork images without attribution.

You may share links to pages on this site freely. You may share artwork images on social media for non-commercial purposes provided Mapheane is clearly credited (@mapheane.art).`,
  },
  {
    title: 'Shipping and Damage',
    body: `Original artworks ship via DHL Express with full insurance at declared value. Delivery times are estimated and not guaranteed. Import duties, customs fees, and any local taxes are the responsibility of the buyer.

If your artwork arrives damaged: photograph the outer packaging before opening, photograph the damage, and contact hello@mapheane.art within 7 days. We will liaise with the shipping provider and arrange resolution.`,
  },
  {
    title: 'Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, Mapheane shall not be liable for any indirect, incidental, or consequential damages arising from your use of this site or purchase of works. Our total liability in any matter shall not exceed the amount paid by you for the specific transaction giving rise to the claim.`,
  },
  {
    title: 'Governing Law',
    body: `These Terms are governed by and construed in accordance with the laws of the Kingdom of Lesotho. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Lesotho, without prejudice to your rights as a consumer under applicable local law.`,
  },
  {
    title: 'Contact',
    body: `Questions regarding these Terms may be directed to: hello@mapheane.art · Maseru, Kingdom of Lesotho.`,
  },
];

export function TermsPage({ onNavigate }: TermsPageProps) {
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
          Terms of Use
        </h1>
        <p className="text-xs text-muted/60 font-sans mb-14">
          Effective date: 1 January 2025 · Mapheane · Maseru, Kingdom of Lesotho
        </p>

        <div className="w-12 h-px bg-terracotta/30 mb-14" />

        <p className="text-muted leading-relaxed mb-12 text-sm">
          These Terms of Use govern your access to and use of the Mapheane website and all transactions conducted through it, including original artwork sales, print edition purchases, commission agreements, and workshop bookings.
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.6 }}
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
