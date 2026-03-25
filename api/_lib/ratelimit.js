/** Extract the real client IP from Vercel's forwarded headers */
const getIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? 'unknown';

/** No-op limiter — used when Upstash is not configured */
const noopLimiter = { limit: async (_id) => ({ success: true }) };

function makeLimiter(prefix, count, window) {
  const url   = process.env.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_TOKEN;
  if (!url || !token || url.includes('placeholder')) return noopLimiter;

  // Dynamic requires so Upstash packages don't crash the function on cold start
  // when credentials aren't configured
  return {
    limit: async (id) => {
      const { Ratelimit } = require('@upstash/ratelimit');
      const { Redis }     = require('@upstash/redis');
      const redis = new Redis({ url, token });
      const limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(count, window), prefix });
      return limiter.limit(id);
    },
  };
}

/** 5 requests per IP per hour — contact / commission / workshop forms */
const contactLimit    = makeLimiter('rl:contact',    5,  '1 h');

/** 10 requests per IP per hour — newsletter signup */
const newsletterLimit = makeLimiter('rl:newsletter', 10, '1 h');

/** 3 requests per IP per hour — order submission */
const ordersLimit     = makeLimiter('rl:orders',     3,  '1 h');

module.exports = { getIp, contactLimit, newsletterLimit, ordersLimit };
