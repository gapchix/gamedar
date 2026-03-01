import Anthropic from "@anthropic-ai/sdk";
import type { GenerationInput, GenerationResult } from "@/types";
import { generationResultSchema } from "@/types";
import { logger } from "./logger";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY must be set");
  }
  return new Anthropic({ apiKey });
}

export const anthropic =
  globalForAnthropic.anthropic ?? createAnthropicClient();

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}

const PERIOD_WEEKS: Record<string, number> = {
  "1-month": 4,
  "3-months": 13,
  "6-months": 26,
};

function buildSchedulePrompt(input: GenerationInput): string {
  const { platform, genres, hoursPerWeek, timePeriod, playStyle, games } =
    input;

  const totalWeeks = PERIOD_WEEKS[timePeriod];
  const totalHours = hoursPerWeek * totalWeeks;
  const startDate = new Date().toISOString().split("T")[0];

  const playStyleDesc: Record<string, string> = {
    casual:
      "Prefers shorter games, variety over completion, relaxed pacing. Multiply estimated hours by 0.7.",
    balanced:
      "Mix of short and long games, aims to finish most games. Keep estimated hours as-is.",
    hardcore:
      "Enjoys long RPGs and completionist runs, deep engagement with fewer titles. Multiply estimated hours by 1.4.",
  };

  const gameList = games
    .map(
      (g) =>
        `- "${g.title}" (IGDB ID: ${g.igdbId}, ~${g.estimatedHours}h, rating: ${g.rating ?? "N/A"}, genres: ${g.genres.join(", ")})`,
    )
    .join("\n");

  return `You are a gaming schedule planner. Create a personalized game calendar.

## Player Profile
- **Platform:** ${platform}
- **Preferred genres:** ${genres.join(", ")}
- **Available time:** ${hoursPerWeek} hours/week for ${totalWeeks} weeks (${totalHours} total hours)
- **Play style:** ${playStyle} — ${playStyleDesc[playStyle]}
- **Start date:** ${startDate}

## Available Games (from IGDB)
${gameList}

## Instructions
1. Select games that fit within the total ${totalHours} hours budget.
2. Order them in a logical sequence (consider genre variety, pacing, game length).
3. For each game, assign a start date and end date based on estimated hours and ${hoursPerWeek}h/week.
4. Adjust estimated hours based on play style multiplier.
5. Games should not overlap. Each game ends before the next starts.
6. Provide a brief reason for each game's placement.

Respond with ONLY valid JSON matching this exact schema:
{
  "games": [
    {
      "igdbId": <number>,
      "title": "<string>",
      "estimatedHours": <number>,
      "startDate": "<YYYY-MM-DD>",
      "endDate": "<YYYY-MM-DD>",
      "order": <number starting at 1>,
      "reason": "<brief explanation>"
    }
  ],
  "summary": "<1-2 sentence overall schedule description>"
}`;
}

export async function generateSchedule(
  input: GenerationInput,
): Promise<GenerationResult> {
  const prompt = buildSchedulePrompt(input);

  const model = process.env.ANTHROPIC_MODEL;
  if (!model) {
    throw new Error("ANTHROPIC_MODEL must be set");
  }

  logger.info("Generating schedule with Claude", {
    model,
    gamesProvided: input.games.length,
    platform: input.platform,
    timePeriod: input.timePeriod,
  });

  const message = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  logger.debug("Claude response received", {
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    stopReason: message.stop_reason,
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let parsed: unknown;
  try {
    const jsonStr = textBlock.text
      .replace(/^```json?\n?/m, "")
      .replace(/\n?```$/m, "")
      .trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    logger.error("Failed to parse Claude response as JSON", {
      response: textBlock.text.slice(0, 500),
    });
    throw new Error(
      `Failed to parse Claude response as JSON: ${textBlock.text.slice(0, 200)}`,
    );
  }

  const result = generationResultSchema.parse(parsed);

  logger.info("Schedule generated", {
    games: result.games.length,
    summary: result.summary,
  });

  return result;
}
