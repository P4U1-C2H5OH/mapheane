const { createClient } = require('@supabase/supabase-js');
const { trackLimit, getIp } = require('./_lib/ratelimit');
const { loadCertificate } = require('./_lib/certificate');

const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN ?? 'https://mapheane.art').trim();

function setCors(req, res) {
  const origin = req.headers.origin;
  const allowed =
    !origin ||
    origin === ALLOWED_ORIGIN ||
    origin.includes('localhost') ||
    /^https:\/\/mapheane(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

  res.setHeader('Access-Control-Allow-Origin', origin && allowed ? origin : ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return allowed;
}

function pdfText(value) {
  return [...String(value ?? '')]
    .map(char => {
      const code = char.charCodeAt(0);
      return code >= 32 && code <= 126 ? char : '-';
    })
    .join('')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text, maxChars) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function commandText(font, size, x, y, text) {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`;
}

function generatePdf(cert) {
  const lines = [
    '0.8 w',
    '40 40 515 762 re S',
    '0.4 w',
    '58 58 479 726 re S',
    commandText('F2', 12, 158, 764, 'Mapheane Studio - Maseru, Kingdom of Lesotho'),
    commandText('F2', 28, 134, 722, 'Certificate of Authenticity'),
    commandText('F1', 10, 244, 704, cert.classification ?? 'Authentic Work'),
    commandText('F1', 11, 94, 660, 'This document certifies that the work described below is an authentic work'),
    commandText('F1', 11, 145, 644, 'issued by Mapheane and registered by Mapheane Studio.'),
    '80 420 435 185 re S',
  ];

  const details = [
    ['Title of Work', cert.title],
    ['Edition', cert.edition],
    ['Medium', cert.medium],
    ['Year of Creation', cert.year],
    ['Dimensions', cert.dimensions],
    ['Certificate Ref.', cert.ref],
    ['Order Ref.', cert.orderRef],
  ];

  let y = 574;
  for (const [label, value] of details) {
    const wrappedLines = wrapText(value, 52);
    lines.push(commandText('F1', 8, 100, y, label.toUpperCase()));
    for (const [index, wrapped] of wrappedLines.entries()) {
      lines.push(commandText('F2', 12, 230, y - index * 15, wrapped));
    }
    y -= Math.max(30, wrappedLines.length * 15 + 10);
  }

  lines.push(commandText('F1', 10, 232, 370, 'Registered to'));
  lines.push(commandText('F2', 22, 190, 340, cert.collectorName));
  lines.push(commandText('F1', 10, 214, 318, `Date of issue: ${cert.date}`));

  [
    'Every work that leaves my studio carries something of the light and the place where',
    'it was made - the highland air of Lesotho, the memory of a tradition, and the hours',
    'of a particular life. I sign each certificate as acknowledgement of that history.',
  ].forEach((line, index) => {
    lines.push(commandText('F2', 11, 88, 270 - index * 16, line));
  });
  lines.push(commandText('F2', 11, 88, 218, '- Mapheane, Maseru'));

  lines.push('85 145 m 265 145 l S');
  lines.push(commandText('F2', 30, 98, 162, cert.artistName ?? 'Mapheane'));
  lines.push(commandText('F1', 8, 94, 130, 'ARTIST SIGNATURE'));
  lines.push('330 145 m 510 145 l S');
  lines.push(commandText('F1', 12, 362, 162, cert.date));
  lines.push(commandText('F1', 8, 373, 130, 'DATE OF ISSUE'));
  lines.push(commandText('F1', 8, 86, 78, 'This certificate is issued by Mapheane Studio, Maseru, Kingdom of Lesotho.'));
  lines.push(commandText('F1', 8, 438, 78, cert.ref));

  const stream = lines.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>',
    `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf, 'utf8');
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

async function handler(req, res) {
  if (!setCors(req, res)) return res.status(403).json({ error: 'Forbidden' });
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const ref = typeof req.query.ref === 'string' ? req.query.ref.trim().toUpperCase() : '';
    if (!ref || !/^MAP-[A-Z0-9]{6}$/.test(ref)) {
      return res.status(400).json({ error: 'Invalid reference format' });
    }

    const ip = getIp(req);
    try {
      const { success } = await trackLimit.limit(ip);
      if (!success) {
        res.setHeader('Retry-After', '3600');
        return res.status(429).json({ error: 'Too many requests. Try again later.' });
      }
    } catch (limitError) {
      console.error('Certificate rate limit error:', limitError);
    }

    const supabase = createClient(
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_SERVICE_KEY
    );

    const result = await loadCertificate(supabase, ref);
    if (result.error) return res.status(result.status ?? 500).json({ error: result.error });

    if (req.query.format === 'pdf') {
      const pdf = generatePdf(result.certificate);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.certificate.ref}.pdf"`);
      res.setHeader('Content-Length', String(pdf.length));
      return res.status(200).send(pdf);
    }

    res.status(200).json(result.certificate);
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ error: 'Unable to load certificate. Please try again.' });
  }
}

module.exports = handler;
