// Simulated (demo) Instagram availability checker.
// IMPORTANT: This does NOT contact Instagram. Results are randomly simulated
// so you can explore the workflow without hitting any real service.

export type CheckStatus = "available" | "taken" | "unknown"

export type CheckOutcome = {
  status: CheckStatus
  message: string
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Deterministic simulated result so the same handle behaves consistently.
 * Short, clean handles lean "taken"; longer ones lean "available".
 */
export function simulateCheck(handle: string): CheckOutcome {
  const h = handle.toLowerCase()
  const seed = hashString(h)
  const roll = seed % 100
  const len = h.length

  // Bias: shorter handles are more likely to already be taken.
  const takenChance = len <= 6 ? 68 : len <= 10 ? 48 : 32
  const unknownChance = 12

  if (roll < unknownChance) {
    return {
      status: "unknown",
      message: "Simulated: couldn't determine a result (demo only).",
    }
  }
  if (roll < unknownChance + takenChance) {
    return {
      status: "taken",
      message: "Simulated: a public profile likely exists (demo only).",
    }
  }
  return {
    status: "available",
    message: "Simulated: no public profile found (demo only).",
  }
}

export const STATUS_META: Record<
  CheckStatus,
  { label: string; short: string }
> = {
  taken: { label: "Likely taken", short: "Taken" },
  available: { label: "No public profile", short: "Available" },
  unknown: { label: "Unclear", short: "Unclear" },
}
