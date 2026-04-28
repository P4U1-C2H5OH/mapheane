create policy "Anyone can insert public interactions" on public_interactions
  for insert with check (
    action in (
      'artwork_view',
      'event_view',
      'moment_view',
      'quick_view',
      'wishlist_add',
      'wishlist_remove',
      'moment_like',
      'moment_unlike',
      'cart_add',
      'share',
      'calendar_add',
      'ticket_click',
      'rsvp',
      'notify_request',
      'newsletter_signup'
    )
    and target_type in ('artwork', 'edition', 'moment', 'event', 'shop', 'gallery', 'newsletter')
  );
