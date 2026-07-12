"use server";

import { headers } from "next/headers";
import { createCalendarFromInput, logger } from "@/lib";
import { createRateLimiter, clientIpFromHeaders } from "@/lib/rate-limit";

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

// Generation is expensive (IGDB + Claude), so the form path gets a tighter
// per-IP limit than the general 30 req/min API limit in the proxy.
const limiter = createRateLimiter(5);

export async function createCalendar(formData: unknown): Promise<ActionResult> {
  try {
    const requestHeaders = await headers();
    const ip = clientIpFromHeaders(requestHeaders);

    if (!limiter.check(ip)) {
      logger.warn("Rate limit exceeded for calendar creation");
      return {
        success: false,
        error: "Too many requests. Please slow down.",
      };
    }

    const outcome = await createCalendarFromInput(formData);

    switch (outcome.status) {
      case "limit-reached":
        return {
          success: false,
          error: "Daily generation limit reached. Please try again tomorrow.",
        };
      case "no-games":
        return {
          success: false,
          error: "No games found for the selected preferences.",
        };
      case "created":
        return { success: true, id: outcome.id };
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      logger.warn("Invalid form data", {
        error: error.message,
        name: error.name,
      });
      return { success: false, error: "Invalid form data." };
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Failed to create calendar", {
      error: errorMessage,
      name: error instanceof Error ? error.name : "Unknown",
    });
    return { success: false, error: "Failed to create calendar." };
  }
}
