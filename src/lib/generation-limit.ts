import { prisma } from "./prisma";
import { logger } from "./logger";
import { DAILY_GENERATION_LIMIT } from "@/utils";

function todayUtc(): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export interface SlotReservation {
  reserved: boolean;
  remaining: number;
}

/**
 * Atomically reserve one generation slot for today (UTC).
 *
 * The conditional UPDATE is a single statement, so concurrent requests
 * can't all pass a stale count check the way a count-then-insert flow can.
 * Call releaseGenerationSlot() if generation fails after reserving.
 */
export async function reserveGenerationSlot(): Promise<SlotReservation> {
  const date = todayUtc();

  await prisma.dailyUsage.upsert({
    where: { date },
    create: { date },
    update: {},
  });

  const updated = await prisma.dailyUsage.updateMany({
    where: { date, count: { lt: DAILY_GENERATION_LIMIT } },
    data: { count: { increment: 1 } },
  });

  if (updated.count === 0) {
    logger.warn("Daily generation limit reached", {
      limit: DAILY_GENERATION_LIMIT,
    });
    return { reserved: false, remaining: 0 };
  }

  const row = await prisma.dailyUsage.findUnique({ where: { date } });
  const used = row?.count ?? DAILY_GENERATION_LIMIT;
  return {
    reserved: true,
    remaining: Math.max(0, DAILY_GENERATION_LIMIT - used),
  };
}

/** Return a reserved slot after a failed generation so users can retry. */
export async function releaseGenerationSlot(): Promise<void> {
  const date = todayUtc();
  await prisma.dailyUsage.updateMany({
    where: { date, count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}
