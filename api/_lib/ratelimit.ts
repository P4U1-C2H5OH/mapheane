import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/** Extract the real client IP from Vercel's forwarded headers */
export const getIp = (req: any): string =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown';

/** No-op limiter used when Upstash is not configured */
const noopLimiter = { limit: async (_id: string) => ({ success: true }) };

function makeLimiter(prefix: string, count: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url.includes('placeholder')) return noopLimiter;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(count, window),
    prefix,
  });
}

/** 5 requests per IP per hour — contact / commission / workshop forms */
export const contactLimit    = makeLimiter('rl:contact',    5,  '1 h');

/** 10 requests per IP per hour — newsletter signup */
export const newsletterLimit = makeLimiter('rl:newsletter', 10, '1 h');

/** 3 requests per IP per hour — order submission */
export const ordersLimit     = makeLimiter('rl:orders',     3,  '1 h');
