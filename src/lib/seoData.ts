export type MetricKey =
  | 'authority'
  | 'traffic'
  | 'keywords'
  | 'backlinks'
  | 'referringDomains'
  | 'trafficValue'

export type Keyword = {
  id: number
  keyword: string
  position: number
  change: number
  volume: number
  difficulty: number
  cpc: number
  trend: number[]
  url: string
}

export type AuditIssue = {
  id: string
  category: 'Crawlability' | 'Performance' | 'Internal links' | 'Content' | 'Markup'
  severity: 'Error' | 'Warning' | 'Notice'
  title: string
  affected: number
  description: string
}

export type Backlink = {
  id: number
  source: string
  domainRating: number
  links: number
  type: 'Follow' | 'Nofollow'
  anchor: string
  firstSeen: string
}

export type SeoData = {
  domain: string
  analyzedAt: string
  tier: 'Emerging' | 'Growing' | 'Established'
  metrics: Record<MetricKey, { value: number; change: number }>
  trafficTrend: { month: string; traffic: number; value: number }[]
  keywordDistribution: { bucket: string; keywords: number; color: string }[]
  keywords: Keyword[]
  health: number
  auditIssues: AuditIssue[]
  competitors: {
    domain: string
    authority: number
    traffic: number
    keywords: number
    backlinks: number
    referringDomains: number
    overlap: number
    color: string
  }[]
  backlinks: Backlink[]
  linkTypes: { name: string; value: number; color: string }[]
  anchors: { name: string; value: number; color: string }[]
}

const KNOWN_BRANDS: Record<string, number> = {
  google: 0.99,
  youtube: 0.98,
  apple: 0.95,
  microsoft: 0.95,
  amazon: 0.95,
  stripe: 0.87,
  shopify: 0.85,
  notion: 0.82,
  figma: 0.82,
  hubspot: 0.84,
  openai: 0.88,
  github: 0.91,
  slack: 0.82,
}

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

/** A tiny deterministic PRNG so the same normalized domain creates the same projection. */
export function stringToSeed(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createSeededRandom(seed: number) {
  let state = seed || 1
  return () => {
    state += 0x6d2b79f5
    let result = state
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (number: number, minimum: number, maximum: number) =>
  Math.min(Math.max(number, minimum), maximum)
const int = (random: () => number, minimum: number, maximum: number) =>
  Math.floor(random() * (maximum - minimum + 1)) + minimum
const pick = <T,>(random: () => number, items: readonly T[]) => items[Math.floor(random() * items.length)]
const roundTo = (value: number, multiple: number) => Math.max(multiple, Math.round(value / multiple) * multiple)

export function normalizeDomain(input: string) {
  const candidate = input.trim().toLowerCase()
  if (!candidate) return ''
  try {
    const url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return candidate.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

function getDomainStrength(domain: string, random: () => number) {
  const root = domain.split('.')[0]
  const brandBoost = KNOWN_BRANDS[root]
  if (brandBoost) return clamp(brandBoost + random() * 0.025, 0, 0.98)

  const uncommonTld = /\.(xyz|info|biz|net|io|dev|co)$/.test(domain) ? 0.035 : 0
  const complexity = root.length * 0.033 + (root.match(/[-\d]/g)?.length ?? 0) * 0.075 + uncommonTld
  return clamp(0.68 - complexity + random() * 0.34, 0.11, 0.77)
}

function getTier(strength: number): SeoData['tier'] {
  if (strength > 0.72) return 'Established'
  if (strength > 0.37) return 'Growing'
  return 'Emerging'
}

function makeTrend(random: () => number, traffic: number) {
  const startRatio = 0.66 + random() * 0.17
  let previous = traffic * startRatio
  return MONTHS.map((month, index) => {
    const trajectory = traffic * (startRatio + ((index + 1) / 12) * (0.96 - startRatio))
    const noise = (random() - 0.46) * traffic * 0.065
    previous = Math.max(100, Math.round((trajectory + noise + previous * 0.16) / 1.16))
    const value = Math.round(previous * (0.7 + random() * 0.55))
    return { month, traffic: previous, value }
  })
}

function makeKeywords(random: () => number, domain: string, authority: number, strength: number): Keyword[] {
  const root = domain.split('.')[0].replace(/[-_]/g, ' ')
  const industryWords = [
    'software', 'platform', 'solutions', 'tools', 'services', 'pricing', 'reviews', 'integrations',
    'automation', 'analytics', 'dashboard', 'templates', 'guide', 'online', 'business', 'workflow',
  ]
  const intents = [
    `${root}`, `${root} pricing`, `${root} login`, `${root} alternatives`, `${root} review`,
    `best ${pick(random, industryWords)}`, `${pick(random, industryWords)} for small business`,
    `${pick(random, industryWords)} comparison`, `how to use ${root}`, `${root} integration`,
    `${root} tutorial`, `affordable ${pick(random, industryWords)}`, `${pick(random, industryWords)} examples`,
    `${root} customer stories`, `free ${pick(random, industryWords)} tools`,
  ]
  const paths = ['/pricing', '/features', '/blog', '/resources', '/integrations', '/solutions', '/about']

  return Array.from({ length: 200 }, (_, index) => {
    const keyword = index < intents.length ? intents[index] : `${pick(random, intents)} ${pick(random, ['2026', 'for teams', 'guide', 'tips', 'best practices', 'easy'])}`
    const headTerm = index < 16
    const volumeMax = headTerm ? 900000 : strength > 0.72 ? 240000 : strength > 0.35 ? 85000 : 22000
    const volume = roundTo(Math.max(50, Math.pow(random(), 2.75) * volumeMax), 10)
    const likelyTopPosition = clamp(Math.round(62 - authority * 0.63 - Math.log10(volume + 10) * 2.5 + random() * 26), 1, 99)
    const difficulty = clamp(Math.round(10 + Math.log10(volume + 1) * 11 + strength * 14 + random() * 15), 5, 95)
    const change = int(random, -8, 9)
    const base = 26 + random() * 38
    const trend = Array.from({ length: 7 }, (__, trendIndex) => Math.max(5, Math.round(base + trendIndex * change * 0.65 + (random() - 0.45) * 12)))

    return {
      id: index + 1,
      keyword,
      position: likelyTopPosition,
      change,
      volume,
      difficulty,
      cpc: Number(clamp(0.2 + difficulty * 0.19 + random() * 5.7, 0.2, 25).toFixed(2)),
      trend,
      url: `https://${domain}${pick(random, paths)}`,
    }
  })
}

function makeAudit(random: () => number, strength: number): { health: number; issues: AuditIssue[] } {
  const health = clamp(Math.round(61 + strength * 29 + random() * 8), 58, 96)
  const pageBase = int(random, 7, strength > 0.7 ? 75 : 36)
  const issueTemplates: Omit<AuditIssue, 'id' | 'affected'>[] = [
    { category: 'Crawlability', severity: 'Error', title: 'Pages return 4xx status codes', description: 'Broken URLs may waste crawl budget and create dead ends for visitors.' },
    { category: 'Crawlability', severity: 'Warning', title: 'Pages are blocked from crawling', description: 'Review robots directives to ensure important content remains accessible.' },
    { category: 'Performance', severity: 'Warning', title: 'Pages have slow Largest Contentful Paint', description: 'Optimize above-the-fold media, rendering paths, and server response time.' },
    { category: 'Performance', severity: 'Notice', title: 'Images could use modern formats', description: 'Serve responsive AVIF or WebP assets where image quality permits.' },
    { category: 'Internal links', severity: 'Error', title: 'Internal links point to redirected pages', description: 'Update navigation links to their final destination to preserve link equity.' },
    { category: 'Internal links', severity: 'Warning', title: 'Pages have only one internal link', description: 'Strengthen contextual linking so valuable pages are easy to discover.' },
    { category: 'Content', severity: 'Error', title: 'Pages have missing meta descriptions', description: 'Write unique, benefit-led descriptions for important indexable pages.' },
    { category: 'Content', severity: 'Warning', title: 'Pages have duplicate title tags', description: 'Differentiate intent so each page can earn a distinct search result.' },
    { category: 'Markup', severity: 'Notice', title: 'Pages could add FAQ structured data', description: 'Use schema only where visible FAQ content genuinely answers searcher questions.' },
    { category: 'Markup', severity: 'Warning', title: 'Canonical URLs are inconsistent', description: 'Consolidate duplicate versions into one preferred, indexable URL.' },
  ]
  const selected = issueTemplates
    .filter((_, index) => index < 6 || random() > 0.27)
    .map((issue, index) => ({
      ...issue,
      id: `issue-${index}`,
      affected: Math.max(1, Math.round(pageBase * (issue.severity === 'Error' ? 0.45 : issue.severity === 'Warning' ? 0.9 : 1.3) * (0.45 + random()))),
    }))
  return { health, issues: selected }
}

function makeCompetitors(random: () => number, domain: string, metrics: SeoData['metrics']) {
  const root = domain.split('.')[0].replace(/[^a-z0-9]/g, '') || 'rank'
  const names = [domain, `${root}hq.com`, `${root}ly.com`, `get${root}.com`]
  const colors = ['#6255f6', '#3b82f6', '#14b8a6', '#f59e0b']
  return names.map((name, index) => {
    const multiplier = index === 0 ? 1 : 0.54 + random() * 1.15
    return {
      domain: name,
      authority: clamp(Math.round(metrics.authority.value * multiplier + (index ? random() * 14 - 7 : 0)), 12, 96),
      traffic: Math.max(500, Math.round(metrics.traffic.value * multiplier)),
      keywords: Math.max(80, Math.round(metrics.keywords.value * multiplier * (0.75 + random() * 0.45))),
      backlinks: Math.max(120, Math.round(metrics.backlinks.value * multiplier * (0.65 + random() * 0.65))),
      referringDomains: Math.max(20, Math.round(metrics.referringDomains.value * multiplier * (0.7 + random() * 0.4))),
      overlap: index === 0 ? 100 : int(random, 14, 64),
      color: colors[index],
    }
  })
}

function makeBacklinks(random: () => number, domain: string, strength: number): Backlink[] {
  const publishers = ['forbes', 'techcrunch', 'producthunt', 'g2', 'zapier', 'notion', 'medium', 'growthnotes', 'saasframe', 'futuretools', 'marketingsherpa', 'wired']
  const sections = ['insights', 'resources', 'best-tools', 'guides', 'news', 'research', 'reviews']
  const anchors = [domain, 'visit website', 'learn more', 'source', 'read the full guide', 'product page', 'this platform']
  return Array.from({ length: 72 }, (_, index) => {
    const publisher = pick(random, publishers)
    const firstSeenMonth = String(int(random, 1, 12)).padStart(2, '0')
    return {
      id: index,
      source: `https://${publisher}.com/${pick(random, sections)}/${domain.split('.')[0]}-${int(random, 100, 999)}`,
      domainRating: clamp(Math.round(24 + strength * 53 + random() * 31), 12, 96),
      links: int(random, 1, strength > 0.7 ? 42 : 18),
      type: random() > 0.22 ? 'Follow' : 'Nofollow',
      anchor: pick(random, anchors),
      firstSeen: `2026-${firstSeenMonth}-${String(int(random, 1, 28)).padStart(2, '0')}`,
    }
  })
}

export function generateSeoData(input: string): SeoData {
  const domain = normalizeDomain(input) || 'stripe.com'
  const random = createSeededRandom(stringToSeed(domain))
  const strength = getDomainStrength(domain, random)
  const authority = clamp(Math.round(15 + strength * 77 + random() * 4), 15, 95)
  const traffic = roundTo(Math.pow(10, 3.1 + strength * 4) * (0.8 + random() * 0.5), 100)
  const keywords = roundTo(Math.pow(10, 2.28 + strength * 3.05) * (0.8 + random() * 0.4), 10)
  const backlinks = roundTo(Math.pow(10, 2.72 + strength * 3.85) * (0.8 + random() * 0.4), 10)
  const referringDomains = roundTo(Math.pow(10, 1.76 + strength * 3.06) * (0.75 + random() * 0.5), 10)
  const trafficValue = roundTo(traffic * (0.12 + strength * 0.6 + random() * 0.3), 10)
  const metricChange = (base: number) => Number((base + random() * 7.6).toFixed(1))
  const metrics: SeoData['metrics'] = {
    authority: { value: authority, change: metricChange(-1.1) },
    traffic: { value: traffic, change: metricChange(-1.9) },
    keywords: { value: keywords, change: metricChange(-2.2) },
    backlinks: { value: backlinks, change: metricChange(-0.6) },
    referringDomains: { value: referringDomains, change: metricChange(-1.5) },
    trafficValue: { value: trafficValue, change: metricChange(-2.1) },
  }
  const keywordRows = makeKeywords(random, domain, authority, strength)
  const audit = makeAudit(random, strength)
  const follows = int(random, 70, 89)
  const anchorWeights = [int(random, 38, 58), int(random, 15, 28), int(random, 10, 19), int(random, 8, 16)]
  const anchorWeightTotal = anchorWeights.reduce((sum, value) => sum + value, 0)
  const anchorValues = anchorWeights.map((value) => Math.round((value / anchorWeightTotal) * 100))
  anchorValues[anchorValues.length - 1] += 100 - anchorValues.reduce((sum, value) => sum + value, 0)

  return {
    domain,
    analyzedAt: 'just now',
    tier: getTier(strength),
    metrics,
    trafficTrend: makeTrend(random, traffic),
    keywordDistribution: [
      { bucket: '1–3', keywords: Math.round(keywords * (0.055 + strength * 0.055)), color: '#6255f6' },
      { bucket: '4–10', keywords: Math.round(keywords * (0.12 + strength * 0.06)), color: '#8175ff' },
      { bucket: '11–20', keywords: Math.round(keywords * (0.22 + random() * 0.05)), color: '#a7a0ff' },
      { bucket: '21–50', keywords: Math.round(keywords * (0.36 + random() * 0.08)), color: '#c5c1ff' },
      { bucket: '51–100', keywords: Math.round(keywords * (0.2 + random() * 0.05)), color: '#e3e1ff' },
    ],
    keywords: keywordRows,
    health: audit.health,
    auditIssues: audit.issues,
    competitors: makeCompetitors(random, domain, metrics),
    backlinks: makeBacklinks(random, domain, strength),
    linkTypes: [
      { name: 'Follow', value: follows, color: '#6255f6' },
      { name: 'Nofollow', value: 100 - follows, color: '#c6c2ff' },
    ],
    anchors: [
      { name: 'Branded', value: anchorValues[0], color: '#6255f6' },
      { name: 'URL', value: anchorValues[1], color: '#3b82f6' },
      { name: 'Generic', value: anchorValues[2], color: '#14b8a6' },
      { name: 'Partial match', value: anchorValues[3], color: '#f59e0b' },
    ],
  }
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatCurrency(value: number, compact = false) {
  if (compact) return `$${formatCompact(value)}`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function formatCpc(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}
