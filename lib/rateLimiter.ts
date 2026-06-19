import { headers } from "next/headers";

interface LimitRecord {
  count: number;
  resetTime: number;
}

const cache = new Map<string, LimitRecord>();

if (typeof global !== "undefined") {
  const globalAny = global as unknown as Record<string, unknown>;
  if (!globalAny.rateLimitInterval) {
    globalAny.rateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of cache.entries()) {
        if (now > record.resetTime) {
          cache.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

export async function checkRateLimit(
  actionName: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for") ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";
  const key = `${actionName}:${ip}`;

  const now = Date.now();
  const record = cache.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: LimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    cache.set(key, newRecord);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
