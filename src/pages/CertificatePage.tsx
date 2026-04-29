import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Shield, Award, Printer, Loader2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface CertificatePageProps {
  onNavigate: (page: any) => void;
  orderRef?: string;
}

interface CertData {
  title: string;
  medium: string;
  dimensions: string;
  year: string;
  edition: string;
  ref: string;
  orderRef: string;
  collectorName: string;
  date: string;
  classification?: string;
  artistName?: string;
}

// Shown when navigated to without a ref (e.g. from PressKit as a preview)
const PREVIEW: CertData = {
  title: 'Ce Père Idéal',
  medium: 'Mixed media on resin canvas',
  dimensions: '97 × 130 cm',
  year: '2024',
  edition: 'Original · One of a kind',
  ref: 'COA-PREVIEW',
  orderRef: '',
  collectorName: '[Collector Name]',
  date: 'March 2026',
  classification: 'Original Artwork',
  artistName: 'Mapheane',
};

export function CertificatePage({ onNavigate, orderRef }: CertificatePageProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [cert, setCert]       = useState<CertData | null>(orderRef ? null : PREVIEW);
  const [loading, setLoading] = useState(!!orderRef);
  const [notFound, setNotFound] = useState(false);

  useSEO({
    title: 'Certificate of Authenticity — Mapheane',
    description: 'Authenticity documentation for original artworks by Mapheane, Maseru, Lesotho.',
  });

  useEffect(() => {
    if (!orderRef) return;
    setLoading(true);
    fetch(`/api/certificate?ref=${encodeURIComponent(orderRef)}`)
      .then(async res => {
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error('Lookup failed');
        setCert(await res.json());
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderRef]);

  const handlePrint = () => window.print();
  const handleDownloadPdf = async () => {
    if (!orderRef || !cert) {
      handlePrint();
      return;
    }
    const res = await fetch(`/api/certificate-pdf?ref=${encodeURIComponent(orderRef)}`);
    if (!res.ok) {
      handlePrint();
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cert.ref}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const isPreview = !orderRef;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-background min-h-screen overflow-hidden"
    >
      {/* ── Page header ───────────────────────────────────── */}
      <section className="pt-36 pb-8 px-6 md:px-12 print:hidden">
        <div className="container mx-auto max-w-4xl">
          <button onClick={() => onNavigate(orderRef ? 'track-order' : 'presskit')}
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-10">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
            <div>
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Provenance</span>
              <h1 className="font-serif text-5xl text-charcoal" style={{ letterSpacing: '-0.02em' }}>
                Certificate of Authenticity
              </h1>
            </div>
            {cert && !loading && (
              <div className="flex gap-3">
                <button onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-3 border border-charcoal/15 text-xs font-sans uppercase tracking-widest text-muted hover:border-charcoal/40 hover:text-charcoal transition-all duration-300">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-5 py-3 bg-charcoal text-background text-xs font-sans uppercase tracking-widest hover:bg-terracotta transition-colors duration-400">
                  <Download className="w-4 h-4" /> Save PDF
                </button>
              </div>
            )}
          </div>

          {isPreview && (
            <p className="text-muted text-sm max-w-lg">
              Every original work and signed edition by Mapheane ships with a hand-signed physical certificate. This page shows a preview of that document.
            </p>
          )}
        </div>
      </section>

      {/* ── Loading / not found states ────────────────────── */}
      {loading && (
        <section className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </section>
      )}

      {notFound && (
        <section className="py-20 px-6 text-center">
          <p className="font-serif italic text-2xl text-charcoal mb-3">Certificate not found</p>
          <p className="text-muted text-sm mb-8">
            No certificate is available for reference <span className="font-sans text-charcoal">{orderRef}</span>.
            Certificates are issued once payment is verified.
          </p>
          <button onClick={() => onNavigate('track-order')}
            className="text-xs font-sans uppercase tracking-widest text-terracotta hover:underline">
            Track your order
          </button>
        </section>
      )}

      {/* ── Certificate document ─────────────────────────── */}
      {cert && !loading && (
        <section className="py-10 px-6 md:px-12 print:py-0 print:px-0">
          <div className="container mx-auto max-w-4xl">
            <div
              ref={certRef}
              className="bg-[#FAF8F4] border border-charcoal/10 shadow-[0_8px_60px_-12px_rgba(45,42,38,0.18)] print:shadow-none print:border-none relative overflow-hidden"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              {/* Decorative corner marks */}
              {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map(pos => (
                <div key={pos} className={`absolute ${pos} w-5 h-5 border-charcoal/15`}
                  style={{
                    borderTopWidth:    pos.includes('top')    ? '1px' : undefined,
                    borderBottomWidth: pos.includes('bottom') ? '1px' : undefined,
                    borderLeftWidth:   pos.includes('left')   ? '1px' : undefined,
                    borderRightWidth:  pos.includes('right')  ? '1px' : undefined,
                  }}
                />
              ))}

              {/* Subtle watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.025] overflow-hidden">
                <span className="font-serif text-[22vw] italic text-charcoal leading-none">M</span>
              </div>

              <div className="relative z-10 p-10 md:p-16">
                {/* Header */}
                <div className="text-center mb-10 pb-8 border-b border-charcoal/10">
                  <p className="text-xs font-sans uppercase tracking-[0.35em] text-terracotta mb-3">Mapheane Studio · Maseru, Lesotho</p>
                  <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-1" style={{ letterSpacing: '-0.01em' }}>
                    Certificate of Authenticity
                  </h2>
                  <p className="text-xs font-sans uppercase tracking-[0.2em] text-muted/60">{cert.classification ?? 'Authentic Work'}</p>
                </div>

                {/* Body */}
                <div className="mb-10">
                  <p className="text-base text-charcoal/70 leading-relaxed mb-8 text-center max-w-xl mx-auto" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    This document certifies that the work described below is an authentic work issued by{' '}
                    <strong className="text-charcoal font-normal">Mapheane</strong>, and constitutes proof of its authenticity and provenance.
                  </p>

                  {/* Work details */}
                  <div className="border border-charcoal/10 bg-white/60 p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                      {[
                        { label: 'Title of Work',    value: cert.title },
                        { label: 'Edition',          value: cert.edition },
                        { label: 'Medium',           value: cert.medium },
                        { label: 'Year of creation', value: cert.year },
                        { label: 'Dimensions',       value: cert.dimensions },
                        { label: 'Certificate Ref.', value: cert.ref },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-label uppercase tracking-[0.2em] text-muted/60 mb-1"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
                          <p className="text-base text-charcoal italic">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collector */}
                  <div className="text-center mb-8">
                    <p className="text-sm text-muted mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>This work is registered to</p>
                    <p className="font-serif text-2xl text-charcoal italic">{cert.collectorName}</p>
                    <p className="text-sm text-muted mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      Date of issue: {cert.date}
                    </p>
                  </div>

                  {/* Artist statement */}
                  <div className="border-l-2 border-terracotta/20 pl-6 mb-10">
                    <p className="font-serif italic text-base text-charcoal/70 leading-relaxed">
                      "Every work that leaves my studio carries something of the light and the place where it was made — the highland air of Lesotho, the memory of a tradition, and the hours of a particular life. I sign each certificate by hand as acknowledgement of that shared history."
                    </p>
                    <p className="text-sm text-muted mt-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      — Mapheane, Maseru
                    </p>
                  </div>
                </div>

                {/* Signature area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-charcoal/10">
                  <div>
                    <div className="h-14 flex items-end pb-2 border-b border-charcoal/20 mb-2">
                      <span className="font-serif italic text-3xl text-charcoal/40" style={{ letterSpacing: '-0.01em' }}>
                        {cert.artistName ?? 'Mapheane'}
                      </span>
                    </div>
                    <p className="text-label uppercase tracking-[0.2em] text-muted/50" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      Artist Signature
                    </p>
                  </div>
                  <div>
                    <div className="h-14 flex items-end pb-2 border-b border-charcoal/20 mb-2">
                      <div className="w-full h-px bg-charcoal/5" />
                    </div>
                    <p className="text-label uppercase tracking-[0.2em] text-muted/50" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      Date of issue
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-charcoal/8 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-terracotta/60" />
                    <span className="text-xs text-muted/60" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      This certificate is issued by Mapheane Studio, Maseru, Kingdom of Lesotho.
                    </span>
                  </div>
                  <p className="text-xs text-muted/40 font-sans">{cert.ref}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── What this means ──────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 border-t border-charcoal/5 print:hidden">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">What is included</span>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal" style={{ letterSpacing: '-0.015em' }}>
              Every original work ships with
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: 'Hand-signed Certificate',
                desc: 'Printed on 300gsm archival paper and signed in ink by Mapheane. Includes work title, medium, dimensions, year, and a unique certificate reference number.',
              },
              {
                icon: Shield,
                title: 'Provenance Documentation',
                desc: 'PDF version emailed at time of purchase, registered against the work reference number. Both documents together establish the full ownership history of the piece.',
              },
              {
                icon: Printer,
                title: 'Installation Guide',
                desc: 'A short printed note on how to hang, care for, and preserve the work — including advice on light exposure, framing, and the particular properties of the resin surface.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="p-6 border border-charcoal/8 hover:border-terracotta/25 transition-all duration-500"
              >
                <item.icon className="w-5 h-5 text-terracotta/70 mb-4" />
                <h3 className="font-serif italic text-lg text-charcoal mb-3">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('gallery')}
              className="inline-flex items-center gap-3 bg-terracotta text-white px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaDark transition-colors duration-400 shadow-button hover:shadow-button-hover"
            >
              Browse original works
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
