// Instagram-focused username utilities: cleanup, validation, scoring, generation.

export const IG_MIN = 3
export const IG_MAX = 30

/** Instagram allows letters, numbers, periods and underscores only. */
export function cleanHandle(raw: string): string {
  let v = (raw ?? "").trim().toLowerCase()
  v = v.replace(/^@+/, "") // strip leading @
  v = v.replace(/\s+/g, "") // no spaces
  v = v.replace(/[^a-z0-9._]/g, "") // only allowed chars
  v = v.replace(/\.{2,}/g, ".") // collapse consecutive dots
  v = v.replace(/^[.]+/, "").replace(/[.]+$/, "") // no leading/trailing dot
  return v.slice(0, IG_MAX)
}

export type ValidationResult = { valid: boolean; reason?: string }

export function validateHandle(handle: string): ValidationResult {
  const v = handle
  if (v.length < IG_MIN) return { valid: false, reason: `Too short (min ${IG_MIN})` }
  if (v.length > IG_MAX) return { valid: false, reason: `Too long (max ${IG_MAX})` }
  if (!/^[a-z0-9._]+$/.test(v)) return { valid: false, reason: "Invalid characters" }
  if (/^[.]/.test(v) || /[.]$/.test(v)) return { valid: false, reason: "Can't start or end with a dot" }
  if (/\.{2}/.test(v)) return { valid: false, reason: "No consecutive dots" }
  return { valid: true }
}

export function isValidHandle(handle: string): boolean {
  return validateHandle(handle).valid
}

export type ScoreTier = "excellent" | "good" | "fair" | "weak"

export type ScoreResult = {
  score: number
  tier: ScoreTier
  notes: string[]
}

const VOWELS = new Set(["a", "e", "i", "o", "u"])

/** Heuristic username quality score from 0-100 (higher = cleaner/more memorable). */
export function scoreUsername(handle: string): ScoreResult {
  const notes: string[] = []
  if (!isValidHandle(handle)) return { score: 0, tier: "weak", notes: ["Not a valid handle"] }

  let score = 60
  const len = handle.length
  const letters = handle.replace(/[^a-z]/g, "")
  const digits = (handle.match(/\d/g) || []).length
  const specials = (handle.match(/[._]/g) || []).length

  // Length sweet spot 5-14
  if (len >= 5 && len <= 14) {
    score += 18
    notes.push("Great length")
  } else if (len < 5) {
    score += 6
  } else if (len > 20) {
    score -= 12
    notes.push("A bit long")
  }

  // Numbers reduce memorability
  if (digits === 0) {
    score += 12
    notes.push("No numbers")
  } else if (digits <= 2) {
    score -= 4
  } else {
    score -= 14
    notes.push("Lots of numbers")
  }

  // Special characters
  if (specials === 0) {
    score += 8
    notes.push("Clean, no dots/underscores")
  } else if (specials === 1) {
    score += 2
  } else {
    score -= 8
    notes.push("Many separators")
  }

  // Pronounceability: vowel presence + no long consonant runs
  const vowelCount = [...letters].filter((c) => VOWELS.has(c)).length
  const vowelRatio = letters.length ? vowelCount / letters.length : 0
  if (vowelRatio >= 0.25 && vowelRatio <= 0.6) {
    score += 8
    notes.push("Easy to say")
  } else if (vowelRatio === 0 && letters.length > 0) {
    score -= 10
  }

  // Penalize 4+ repeated chars in a row
  if (/(.)\1{3,}/.test(handle)) {
    score -= 12
    notes.push("Repeated letters")
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let tier: ScoreTier = "weak"
  if (score >= 85) tier = "excellent"
  else if (score >= 70) tier = "good"
  else if (score >= 50) tier = "fair"

  return { score, tier, notes }
}

export const THEMES: Record<string, string[]> = {
  modern: ["nova", "vibe", "urban", "prime", "luxe", "daily", "wave", "pixel", "social", "fresh"],
  minimal: ["mono", "pure", "line", "form", "base", "plain", "core", "soft", "simple", "calm"],
  gaming: ["shadow", "phantom", "hunter", "dragon", "venom", "raven", "ghost", "blaze", "frost", "reaper"],
  nature: ["forest", "river", "ocean", "leaf", "cloud", "stone", "rain", "sunset", "willow", "bloom"],
  space: ["nova", "orbit", "cosmo", "lunar", "stellar", "astro", "nebula", "solar", "galaxy", "comet"],
  tech: ["byte", "code", "data", "logic", "node", "cloud", "cyber", "dev", "stack", "quantum"],
  creative: ["canvas", "dream", "pixel", "verse", "story", "color", "echo", "vision", "muse", "craft"],
  aesthetic: ["aura", "velvet", "peach", "honey", "cherry", "angel", "cloudy", "lush", "dusk", "petal"],
}

export const THEME_LABELS: { value: string; label: string }[] = [
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "gaming", label: "Gaming" },
  { value: "nature", label: "Nature" },
  { value: "space", label: "Space" },
  { value: "tech", label: "Tech" },
  { value: "creative", label: "Creative" },
  { value: "custom", label: "My own words only" },
]

export type GeneratorOptions = {
  theme: string
  amount: number
  minLength: number
  maxLength: number
  useNumbers: boolean
  randomCase: boolean
  avoidDuplicates: boolean
  prefix: string
  suffix: string
  separator: string
  include: string
  exclude: string
  customWords: string[]
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomizeCase(v: string): string {
  return v
    .split("")
    .map((c) => (Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase()))
    .join("")
}

export function clampLen(n: number): number {
  if (Number.isNaN(n)) return IG_MIN
  return Math.min(IG_MAX, Math.max(IG_MIN, Math.round(n)))
}

export function parseWords(text: string): string[] {
  return text
    .split(/\r?\n|,/)
    .map((x) => cleanHandle(x))
    .filter(Boolean)
}

export type GenerateResult = {
  usernames: string[]
  skippedInvalid: number
}

export function generateUsernames(opts: GeneratorOptions): GenerateResult {
  const amount = Math.min(10000, Math.max(1, Math.round(opts.amount) || 1))
  let minLength = clampLen(opts.minLength)
  let maxLength = clampLen(opts.maxLength)
  if (minLength > maxLength) [minLength, maxLength] = [maxLength, minLength]

  const sep = cleanHandle(opts.separator).slice(0, 1) // separator must be dot/underscore-safe
  const prefix = cleanHandle(opts.prefix)
  const suffix = cleanHandle(opts.suffix)
  const include = cleanHandle(opts.include)
  const excludeList = opts.exclude
    .split(/[\s,]+/)
    .map((x) => cleanHandle(x))
    .filter(Boolean)

  const themeWords = opts.theme === "custom" ? opts.customWords : [...(THEMES[opts.theme] || []), ...opts.customWords]

  const words = themeWords.length ? themeWords : opts.customWords

  const results: string[] = []
  const used = new Set<string>()
  let skippedInvalid = 0
  let attempts = 0
  const maxAttempts = amount * 200

  if (words.length === 0) return { usernames: [], skippedInvalid: 0 }

  while (results.length < amount && attempts < maxAttempts) {
    attempts++

    const first = randomItem(words)
    const parts: string[] = [first]
    if (Math.random() < 0.6) parts.push(randomItem(words))

    let core = parts.join(sep)

    if (opts.useNumbers && Math.random() < 0.8) {
      core += String(randomInt(1, 9999))
    }

    let username = [prefix, core, suffix].filter(Boolean).join(sep || "")
    username = cleanHandle(username)

    if (username.length < minLength || username.length > maxLength) continue
    if (include && !username.includes(include)) continue
    if (excludeList.some((bad) => username.includes(bad))) continue

    if (!isValidHandle(username)) {
      skippedInvalid++
      continue
    }

    if (opts.randomCase) {
      // Instagram is case-insensitive but we keep the visual variety option.
      username = randomizeCase(username)
    }

    const key = username.toLowerCase()
    if (opts.avoidDuplicates && used.has(key)) continue

    used.add(key)
    results.push(username)
  }

  return { usernames: results, skippedInvalid }
}

/** Remove duplicates (case-insensitive) and invalid handles from a list. */
export function cleanupList(list: string[]): {
  cleaned: string[]
  removedDuplicates: number
  removedInvalid: number
} {
  const seen = new Set<string>()
  const cleaned: string[] = []
  let removedDuplicates = 0
  let removedInvalid = 0

  for (const raw of list) {
    const h = cleanHandle(raw)
    if (!isValidHandle(h)) {
      removedInvalid++
      continue
    }
    const key = h.toLowerCase()
    if (seen.has(key)) {
      removedDuplicates++
      continue
    }
    seen.add(key)
    cleaned.push(h)
  }

  return { cleaned, removedDuplicates, removedInvalid }
}
