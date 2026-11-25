/**
 * A small built-in guardrail so the starter works with zero setup.
 * It checks text on the way IN to the model and on the way OUT.
 *
 * Want a stronger one? Replace checkInput and checkOutput with calls to a
 * guardrail service such as Block Convey's PRISM. Keep the same return shape
 * and nothing else in the app has to change.
 */

export type GuardrailResult = {
  text: string
  blocked: boolean
  reason?: string
  redacted: string[]
}

const PERSONAL_INFO: { label: string; pattern: RegExp }[] = [
  { label: "email", pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { label: "SSN", pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { label: "card number", pattern: /\b(?:\d[ -]?){13,16}\b/g },
  { label: "phone", pattern: /(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g },
]

const INJECTION =
  /\b(ignore|forget|override|bypass)\b.{0,30}\b(rules|instructions|guardrails?|prompt)\b|\b(system prompt|developer mode|jailbreak)\b|\b(every|all|other) (users?|people|accounts?)('s)? (data|rows|plans|records)\b/i

const MAX_INPUT_LENGTH = 500

function redact(text: string) {
  const found: string[] = []
  let clean = text
  for (const { label, pattern } of PERSONAL_INFO) {
    clean = clean.replace(pattern, () => {
      if (!found.includes(label)) found.push(label)
      return `[${label} removed]`
    })
  }
  return { clean, found }
}

export function checkInput(raw: string): GuardrailResult {
  const text = raw.trim()

  if (!text) return { text, blocked: true, reason: "Type a goal first.", redacted: [] }
  if (text.length > MAX_INPUT_LENGTH) {
    return { text, blocked: true, reason: `Keep it under ${MAX_INPUT_LENGTH} characters.`, redacted: [] }
  }
  if (INJECTION.test(text)) {
    return {
      text,
      blocked: true,
      reason: "That looks like an attempt to get around the app's rules, so it was not sent to the AI.",
      redacted: [],
    }
  }

  const { clean, found } = redact(text)
  return { text: clean, blocked: false, redacted: found }
}

export function checkOutput(raw: string): GuardrailResult {
  const { clean, found } = redact(raw.trim())
  return { text: clean, blocked: false, redacted: found }
}

/* ---------- Leftover Remix checks (added on top; nothing above was loosened) ---------- */

/** "It's fine, ignore the date" pushes. */
const IGNORE_THE_DATE = /\b(ignore|forget)\b.*\b(date|days|old|expired)\b/i

/** A note has to be about food. Generous on purpose: it only stops off-topic asks. */
const FOOD_WORDS =
  /\b(turkey|ham|chicken|beef|pork|steak|meat|wings?|potato(es)?|mashed|yams?|gravy|stuffing|dressing|rolls?|bread|cornbread|biscuits?|pies?|pumpkin|apple|pecan|cranberr(y|ies)|sauce|casseroles?|beans?|greens|collards?|sprouts|vegg(ie|ies)|vegetables?|carrots?|corn|peas|salad|soup|stew|rice|pasta|noodles|mac|cheese|eggs?|butter|cream|desserts?|cakes?|cookies?|fruit|shrimp|seafood|fish|salmon|crab|sandwich(es)?|leftovers?|fridge|meal|dinner|lunch|breakfast|brunch|snack|cook|bake|recipe|dish|food|eat)\b/i

export const NOT_ABOUT_FOOD = "Tell me what's in your fridge."

/**
 * Checks the optional note typed next to "Remix it".
 * Runs every checkInput check first, then the two Leftover Remix checks.
 * An empty note is fine: the remix then uses only your fridge.
 */
export function checkLeftoverNote(raw: string): GuardrailResult {
  if (!raw.trim()) return { text: "", blocked: false, redacted: [] }

  const result = checkInput(raw)
  if (result.blocked) return result

  if (IGNORE_THE_DATE.test(raw)) {
    return {
      text: result.text,
      blocked: true,
      reason: "Food safety comes first, so asks to ignore how old food is are not sent to the AI.",
      redacted: [],
    }
  }
  if (!FOOD_WORDS.test(raw)) {
    return { text: result.text, blocked: true, reason: NOT_ABOUT_FOOD, redacted: [] }
  }
  return result
}

/** Checks a fridge item name before it is saved (and later shown to the AI). */
export function checkLeftoverItem(raw: string): GuardrailResult {
  const text = raw.trim()
  if (!text) return { text, blocked: true, reason: "Type a leftover first.", redacted: [] }
  if (text.length > 60) {
    return { text, blocked: true, reason: "Keep item names under 60 characters.", redacted: [] }
  }
  const result = checkInput(text)
  if (result.blocked) return result
  if (IGNORE_THE_DATE.test(text)) {
    return { text, blocked: true, reason: "Item names can't include instructions.", redacted: [] }
  }
  return result
}
