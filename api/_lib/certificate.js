function formatIssueDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function joinParts(parts) {
  return parts.filter(Boolean).join(' · ');
}

async function loadCertificate(supabase, ref) {
  const { data: row, error } = await supabase
    .from('orders')
    .select('ref, status, customer, cart_items, created_at')
    .eq('ref', ref)
    .single();

  if (error || !row) {
    return { error: 'Order not found', status: 404 };
  }

  if (row.status === 'cancelled' || row.status === 'pending') {
    return { error: 'Certificate not available for this order', status: 404 };
  }

  const first = (row.cart_items ?? [])[0];
  let artwork = first?.artwork ?? {};
  const edition = first?.edition;
  const artworkId = artwork.id ?? edition?.artworkId ?? edition?.artwork_id;

  if (artworkId && (!artwork.dimensions || !artwork.year || (!artwork.technique && !artwork.medium))) {
    const { data: fallbackArtwork, error: fallbackError } = await supabase
      .from('artworks')
      .select('id, title, medium, technique, dimensions, year')
      .eq('id', artworkId)
      .maybeSingle();
    if (!fallbackError && fallbackArtwork) {
      artwork = { ...fallbackArtwork, ...artwork };
    }
  }

  const editionLabel = edition
    ? joinParts([edition.type, edition.size, edition.paper])
    : 'Original · One of a kind';
  const medium = edition?.medium ?? artwork.technique ?? artwork.medium ?? first?.medium ?? '—';
  const dimensions = edition?.size ?? artwork.dimensions ?? '—';
  const year = edition?.year ?? artwork.year ?? new Date(row.created_at).getFullYear();

  return {
    certificate: {
      title:         edition?.title        ?? artwork.title ?? first?.title ?? 'Untitled',
      medium,
      dimensions,
      year:          String(year),
      edition:       editionLabel,
      classification: edition ? 'Print Edition' : 'Original Artwork',
      ref:           `COA-${row.ref.replace('MAP-', '')}`,
      orderRef:      row.ref,
      collectorName: row.customer?.name    ?? '—',
      date:          formatIssueDate(row.created_at),
      artistName:    'Mapheane',
    },
  };
}

module.exports = { loadCertificate };
