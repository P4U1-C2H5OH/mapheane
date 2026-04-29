create unique index if not exists availability_requests_artwork_email_exact_unique
  on availability_requests (artwork_id, email);
