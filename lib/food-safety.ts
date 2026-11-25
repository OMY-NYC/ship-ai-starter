/**
 * The food-safety rule, done in code so the AI never even sees unsafe food.
 * Plain TypeScript with no imports, so the browser, the server and
 * scripts/guardrail-test.mjs can all use it.
 */

/** Anything this many days old or more gets tossed. */
export const MAX_DAYS = 4

/** Gravy and seafood only keep this many days. */
export const SHORT_LIFE_DAYS = 2

const SHORT_LIFE =
  /\b(gravy|seafood|shrimp|prawns?|crab|lobster|fish|salmon|tuna|cod|oysters?|clams?|mussels?|scallops?|squid|calamari)\b/i

export type FridgeItem = { item: string; days_old: number }

/** Why an item must be tossed, or null when it is safe to use. */
export function tossReason(item: string, daysOld: number): string | null {
  if (!Number.isFinite(daysOld) || daysOld < 0) return "unknown age"
  if (daysOld >= MAX_DAYS) return `${daysOld} days old; the limit is ${MAX_DAYS - 1}`
  if (SHORT_LIFE.test(item) && daysOld > SHORT_LIFE_DAYS) {
    return `${daysOld} days old; gravy and seafood only keep ${SHORT_LIFE_DAYS}`
  }
  return null
}

export function splitBySafety<T extends FridgeItem>(items: T[]) {
  const safe: T[] = []
  const toss: (T & { reason: string })[] = []
  for (const entry of items) {
    const reason = tossReason(entry.item, entry.days_old)
    if (reason) toss.push({ ...entry, reason })
    else safe.push(entry)
  }
  return { safe, toss }
}

/**
 * Finds "the gravy is 8 days old" style claims in a typed note, so they go
 * through the same safety rule as the fridge.
 */
export function itemsMentionedInNote(note: string): FridgeItem[] {
  const found: FridgeItem[] = []
  const pattern = /([a-z][a-z ]{0,40}?)\s+(?:is|are|was|were)\s+(\d{1,3})\s+days?\s+old/gi
  for (const match of note.matchAll(pattern)) {
    const item = match[1].replace(/^(?:.*\b(?:the|my|our|some|this|that|and|but)\s+)/i, "").trim()
    if (item) found.push({ item, days_old: Number(match[2]) })
  }
  return found
}
