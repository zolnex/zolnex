import type { SeoData } from './seoData'

export const GEMINI_MODEL = 'gemini-3.1-flash-lite'

export type AiBriefResult = {
  text: string
  source: 'gemini'
}

function dashboardContext(data: SeoData) {
  const metrics = data.metrics
  const topKeywords = data.keywords
    .slice()
    .sort((first, second) => first.position - second.position)
    .slice(0, 8)
    .map((keyword) => `${keyword.keyword} (position ${keyword.position}, volume ${keyword.volume})`)
    .join('; ')
  const issues = data.auditIssues
    .filter((issue) => issue.severity !== 'Notice')
    .slice(0, 4)
    .map((issue) => `${issue.severity}: ${issue.title} (${issue.affected} pages)`)
    .join('; ')

  return `Domain: ${data.domain}
Projection note: The dashboard metrics below are deterministic local estimates, not a crawl or verified search-console data.
Domain authority: ${metrics.authority.value}
Estimated organic traffic: ${metrics.traffic.value}
Estimated ranking keywords: ${metrics.keywords.value}
Estimated backlinks: ${metrics.backlinks.value}
Estimated referring domains: ${metrics.referringDomains.value}
Estimated traffic value: ${metrics.trafficValue.value} USD per month
Technical health score: ${data.health}/100
Top projected keyword samples: ${topKeywords}
Audit samples: ${issues}`
}

export async function generateGeminiSeoBrief({
  apiKey,
  data,
  request,
}: {
  apiKey: string
  data: SeoData
  request: string
}): Promise<AiBriefResult> {
  const prompt = `You are RankPulse AI, a rigorous SEO strategy assistant. Work only from the supplied local estimates. Do not claim that a live crawl, live rankings, Google Search Console, backlinks, or real keyword volume were accessed. Clearly frame recommendations as hypotheses to validate.

${dashboardContext(data)}

User request: ${request}

Respond in concise Markdown. Give: (1) an executive readout of no more than 2 sentences, (2) exactly 3 prioritized actions with rationale, (3) 3 keyword/content opportunity angles drawn from or adjacent to the supplied samples, and (4) a short validation checklist. Keep the response under 420 words.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 700 },
      }),
    },
  )

  if (!response.ok) {
    let message = `Gemini returned ${response.status}.`
    try {
      const payload = (await response.json()) as { error?: { message?: string } }
      if (payload.error?.message) message = payload.error.message
    } catch {
      // The HTTP status is enough context if Gemini returned a non-JSON body.
    }
    throw new Error(message)
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim()
  if (!text) throw new Error('Gemini did not return a usable response. Please try again.')

  return { text, source: 'gemini' }
}
