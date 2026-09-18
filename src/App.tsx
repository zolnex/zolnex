import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react'
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileBarChart,
  Globe2,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GEMINI_MODEL, generateGeminiSeoBrief } from './lib/gemini'
import {
  formatCompact,
  formatCpc,
  formatCurrency,
  formatNumber,
  generateSeoData,
  normalizeDomain,
  type Keyword,
  type MetricKey,
  type SeoData,
} from './lib/seoData'

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const navItems = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/keywords', label: 'Keywords', icon: Target },
  { to: '/audit', label: 'Site audit', icon: ClipboardCheck },
  { to: '/competitors', label: 'Competitors', icon: BarChart3 },
  { to: '/backlinks', label: 'Backlinks', icon: Link2 },
]

type SeoContextValue = {
  data: SeoData
  projects: string[]
  isAnalyzing: boolean
  theme: 'light' | 'dark'
  startAnalysis: (raw: string) => string | null
  toggleTheme: () => void
}

const SeoContext = createContext<SeoContextValue | null>(null)

function useSeo() {
  const value = useContext(SeoContext)
  if (!value) throw new Error('useSeo must be used inside SeoProvider')
  return value
}

function SeoProvider({ children }: { children: ReactNode }) {
  const [initialDomain] = useState(() => {
    try {
      return normalizeDomain(localStorage.getItem('rankpulse-last-domain') || '') || 'stripe.com'
    } catch {
      return 'stripe.com'
    }
  })
  const [data, setData] = useState(() => generateSeoData(initialDomain))
  const [projects, setProjects] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rankpulse-projects') || '[]')
      return Array.isArray(saved) ? saved.slice(0, 6) : []
    } catch {
      return []
    }
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('rankpulse-theme') === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    try {
      localStorage.setItem('rankpulse-theme', theme)
    } catch {
      // LocalStorage is an enhancement only; the theme still works in memory.
    }
  }, [theme])

  const startAnalysis = (raw: string) => {
    const domain = normalizeDomain(raw)
    if (!domain || !domain.includes('.')) return null
    setIsAnalyzing(true)
    window.setTimeout(() => {
      const nextData = generateSeoData(domain)
      setData(nextData)
      setProjects((current) => {
        const next = [domain, ...current.filter((project) => project !== domain)].slice(0, 6)
        try {
          localStorage.setItem('rankpulse-projects', JSON.stringify(next))
          localStorage.setItem('rankpulse-last-domain', domain)
        } catch {
          // The analysis remains available when browser storage is unavailable.
        }
        return next
      })
      setIsAnalyzing(false)
    }, 820)
    return domain
  }

  return (
    <SeoContext.Provider
      value={{
        data,
        projects,
        isAnalyzing,
        theme,
        startAnalysis,
        toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      }}
    >
      {children}
    </SeoContext.Provider>
  )
}

export default function App() {
  return (
    <SeoProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/overview" element={<Workspace page={<OverviewPage />} />} />
        <Route path="/keywords" element={<Workspace page={<KeywordsPage />} />} />
        <Route path="/audit" element={<Workspace page={<AuditPage />} />} />
        <Route path="/competitors" element={<Workspace page={<CompetitorsPage />} />} />
        <Route path="/backlinks" element={<Workspace page={<BacklinksPage />} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SeoProvider>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 text-slate-950 dark:text-white">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/25">
        <Activity size={18} strokeWidth={2.7} />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">RankPulse</span>
    </div>
  )
}

function LandingPage() {
  const { startAnalysis, theme, toggleTheme } = useSeo()
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const domain = startAnalysis(value)
    if (!domain) {
      setError('Enter a valid domain, for example stripe.com')
      return
    }
    setError('')
    navigate('/overview')
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900 transition-colors dark:bg-[#0b1020] dark:text-slate-100">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 sm:inline-flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No account required
          </span>
          <ThemeButton theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
          <div className="landing-orb -left-32 top-0 bg-violet-400/25 dark:bg-violet-600/15" />
          <div className="landing-orb -right-24 top-12 bg-indigo-300/30 dark:bg-cyan-400/10" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
              <Zap size={13} fill="currentColor" /> SEO intelligence, in seconds
            </div>
            <h1 className="mt-7 font-display text-5xl font-bold tracking-[-0.045em] text-slate-950 sm:text-7xl dark:text-white">
              Know what moves your
              <span className="block bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent"> organic growth.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Explore a complete SEO opportunity profile: visibility trends, keyword demand, technical priorities, and competitive context for any domain.
            </p>

            <form onSubmit={submit} className="mx-auto mt-10 max-w-3xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_-28px_rgba(79,70,229,0.3)] sm:flex-row dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,0.6)]">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                  <Globe2 className="shrink-0 text-violet-500" size={21} />
                  <input
                    aria-label="Website domain"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Enter a domain, e.g. stripe.com"
                    className="h-12 w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                </div>
                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 dark:focus:ring-violet-500/30">
                  Analyze domain <ArrowUp className="rotate-45" size={16} />
                </button>
              </div>
              {error && <p className="mt-2 text-left text-sm text-rose-600">{error}</p>}
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">Works with any public-looking domain. Projection data is generated locally for this demo.</p>
            </form>

            <div className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
              <TrustItem text="Instant opportunity snapshot" />
              <TrustItem text="200 projected keyword signals" />
              <TrustItem text="Private by design" />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/70 py-12 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto grid max-w-6xl gap-7 px-5 sm:grid-cols-3 sm:px-8">
            <LandingFeature icon={<TrendingUp size={20} />} title="See momentum, not noise" description="Spot organic trend direction and ranking distribution at a glance." />
            <LandingFeature icon={<Target size={20} />} title="Prioritize what matters" description="Turn technical signals and keywords into a focused action queue." />
            <LandingFeature icon={<Bot size={20} />} title="Bring your own AI" description="Connect Gemini for a private, on-demand strategic brief." />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-300">SEO opportunity workspace</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">One workflow for keyword research, SEO audit, and competitor analysis.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">RankPulse brings the essential questions into a single, readable workspace: where visibility may be moving, which keyword themes deserve validation, and which technical patterns should enter the backlog first.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <LandingFeature icon={<Search size={20} />} title="Keyword research workspace" description="Filter and sort a detailed keyword signal table by position, demand, difficulty, and landing page." />
            <LandingFeature icon={<ClipboardCheck size={20} />} title="SEO audit checklist" description="Organize crawlability, performance, internal-link, content, and markup patterns by severity." />
            <LandingFeature icon={<BarChart3 size={20} />} title="Competitor analysis" description="Compare relative traffic, keywords, links, and shared opportunity areas across a peer set." />
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-300">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">A clearer way to explore SEO opportunities.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Faq question="What does RankPulse analyze?" answer="The workspace organizes estimated domain authority, organic visibility, keyword, backlink, technical audit, and competitor signals into one dashboard." />
              <Faq question="Are RankPulse metrics verified SEO data?" answer="No. This demonstration uses deterministic local projections. Use first-party analytics, Search Console, and a full crawl to validate decisions." />
              <Faq question="How does the Gemini SEO brief work?" answer="You can paste your own Gemini API key for a direct browser-to-Gemini request. The app does not store the key." />
              <Faq question="Who is this SEO dashboard for?" answer="It is designed for founders, marketers, and students who want a concise starting point for an SEO opportunity conversation." />
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:text-slate-500">
        <span>© 2026 RankPulse · SEO opportunity workspace</span>
        <span>Deterministic demo projections — not a live crawler.</span>
      </footer>
    </div>
  )
}

function TrustItem({ text }: { text: string }) {
  return <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" />{text}</span>
}

function LandingFeature({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 text-left">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{icon}</span>
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  )
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return <article className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><h3 className="font-semibold text-slate-900 dark:text-white">{question}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{answer}</p></article>
}

function ThemeButton({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  return (
    <button
      onClick={toggleTheme}
      className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-violet-300"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

function Workspace({ page }: { page: ReactNode }) {
  const { data, projects, isAnalyzing, theme, toggleTheme, startAnalysis } = useSeo()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState(data.domain)
  const [sectionLoading, setSectionLoading] = useState(false)

  useEffect(() => setQuery(data.domain), [data.domain])
  useEffect(() => {
    setMobileOpen(false)
    if (isAnalyzing) return
    setSectionLoading(true)
    const timer = window.setTimeout(() => setSectionLoading(false), 340)
    return () => window.clearTimeout(timer)
  }, [location.pathname, isAnalyzing])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    if (startAnalysis(query)) navigate('/overview')
  }

  const sidebar = (
    <aside className="flex h-full w-[264px] flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-[#10172a]">
      <div className="px-2"><Logo /></div>
      <div className="mt-8">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
              >
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
      <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
        <div className="flex items-center justify-between px-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Recent projects</p>
          <span className="text-xs text-slate-400">{projects.length}</span>
        </div>
        <div className="mt-2 space-y-1">
          {(projects.length ? projects : [data.domain]).map((project) => (
            <button
              key={project}
              onClick={() => {
                setQuery(project)
                startAnalysis(project)
                navigate('/overview')
              }}
              className={cn('project-link', project === data.domain && 'project-link-active')}
              title={`Analyze ${project}`}
            >
              <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{project.charAt(0).toUpperCase()}</span>
              <span className="truncate">{project}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-auto rounded-xl border border-violet-100 bg-violet-50 p-3.5 dark:border-violet-500/15 dark:bg-violet-500/[0.07]">
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-300"><Sparkles size={15} /> AI strategic brief</div>
        <p className="mt-1.5 text-xs leading-5 text-violet-600/80 dark:text-violet-300/65">Bring your Gemini key to turn these estimates into a next-step plan.</p>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900 transition-colors dark:bg-[#0b1020] dark:text-slate-100">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block">{sidebar}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/45" aria-label="Close sidebar" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full shadow-2xl">{sidebar}</div>
        </div>
      )}
      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f7f8fc]/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0b1020]/90 sm:px-7">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" aria-label="Open sidebar"><Menu size={19} /></button>
            <form onSubmit={submitSearch} className="hidden max-w-xl flex-1 sm:block">
              <label className="flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 text-slate-400 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-violet-500 dark:focus-within:ring-violet-500/10">
                <Search size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white" placeholder="Analyze another domain" />
                <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 md:block dark:bg-slate-800">↵</span>
              </label>
            </form>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 md:inline-flex dark:bg-emerald-500/10 dark:text-emerald-300"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />Demo workspace</span>
              <ThemeButton theme={theme} toggleTheme={toggleTheme} />
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">RP</span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8">
          {isAnalyzing || sectionLoading ? <DashboardSkeleton /> : page}
        </main>
      </div>
    </div>
  )
}

function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-300">{eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-[2rem] dark:text-white">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

function OverviewPage() {
  const { data, startAnalysis } = useSeo()
  const metricCards: { key: MetricKey; label: string; icon: ReactNode; format: (value: number) => string }[] = [
    { key: 'authority', label: 'Domain authority', icon: <ShieldCheck />, format: String },
    { key: 'traffic', label: 'Organic traffic', icon: <TrendingUp />, format: formatCompact },
    { key: 'keywords', label: 'Ranking keywords', icon: <Target />, format: formatCompact },
    { key: 'backlinks', label: 'Backlinks', icon: <Link2 />, format: formatCompact },
    { key: 'referringDomains', label: 'Referring domains', icon: <Globe2 />, format: formatCompact },
    { key: 'trafficValue', label: 'Traffic value', icon: <FileBarChart />, format: (value) => formatCurrency(value, true) },
  ]

  return (
    <>
      <PageHeading
        eyebrow="Domain overview"
        title={data.domain}
        description={`Local projection · ${data.tier} profile · analyzed ${data.analyzedAt}`}
        actions={
          <>
            <button onClick={() => startAnalysis(data.domain)} className="secondary-button"><Activity size={15} /> Re-analyze</button>
            <button onClick={() => exportOverviewPdf(data)} className="primary-button"><Download size={15} /> Export report</button>
          </>
        }
      />
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
        <CircleAlert className="mt-0.5 shrink-0" size={16} />
        <span><strong>Demo projection.</strong> Metrics are generated deterministically in this browser from the domain name. Validate decisions against Search Console, analytics, and a technical crawl.</span>
      </div>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map(({ key, label, icon, format }) => <MetricCard key={key} label={label} icon={icon} metric={data.metrics[key]} value={format(data.metrics[key].value)} />)}
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-5">
        <Panel className="xl:col-span-3" title="Estimated organic traffic" subtitle="12-month projected trend" action={<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"><ArrowUp size={13} /> {data.metrics.traffic.change.toFixed(1)}%</span>}>
          <div className="h-[300px] pt-4"><TrafficChart data={data} /></div>
        </Panel>
        <Panel className="xl:col-span-2" title="Keyword positions" subtitle="Projected ranking distribution">
          <div className="h-[300px] pt-4"><KeywordDistributionChart data={data} /></div>
        </Panel>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-5">
        <Panel className="xl:col-span-3" title="Top ranking opportunities" subtitle="Projected terms closest to page-one momentum" action={<NavLink to="/keywords" className="panel-link">View all keywords <ChevronRight size={15} /></NavLink>}>
          <div className="overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead><tr><th>Keyword</th><th>Position</th><th>Volume</th><th>Difficulty</th><th>Trend</th></tr></thead>
              <tbody>{data.keywords.slice().sort((a, b) => a.position - b.position).slice(0, 5).map((keyword) => <KeywordPreviewRow key={keyword.id} keyword={keyword} />)}</tbody>
            </table>
          </div>
        </Panel>
        <AiBriefPanel data={data} />
      </section>
    </>
  )
}

function MetricCard({ label, icon, value, metric }: { label: string; icon: ReactNode; value: string; metric: { value: number; change: number } }) {
  const positive = metric.change >= 0
  return (
    <article className="metric-card group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-600 transition group-hover:scale-105 dark:bg-violet-500/10 dark:text-violet-300">{icon}</span>
      </div>
      <p className="mt-5 font-display text-[2rem] font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className={cn('mt-2 inline-flex items-center gap-1 text-xs font-semibold', positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
        {positive ? <ArrowUp size={13} /> : <ArrowDown size={13} />} {Math.abs(metric.change).toFixed(1)}% <span className="font-normal text-slate-400">vs. last month</span>
      </p>
    </article>
  )
}

function Panel({ title, subtitle, children, action, className }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={cn('panel', className)}>
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h2>{subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  )
}

function TrafficChart({ data }: { data: SeoData }) {
  const formatTick = (value: number) => formatCompact(value)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.trafficTrend} margin={{ top: 12, right: 4, bottom: 0, left: 0 }}>
        <defs><linearGradient id="traffic-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6255f6" stopOpacity={0.28} /><stop offset="100%" stopColor="#6255f6" stopOpacity={0.01} /></linearGradient></defs>
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
        <YAxis tickFormatter={formatTick} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={44} />
        <Tooltip content={<ChartTooltip valuePrefix="" />} cursor={{ stroke: '#a5b4fc', strokeDasharray: '3 3' }} />
        <Area type="monotone" dataKey="traffic" stroke="#6255f6" strokeWidth={2.5} fill="url(#traffic-fill)" activeDot={{ r: 4, strokeWidth: 3, fill: '#fff', stroke: '#6255f6' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function ChartTooltip({ active, payload, label, valuePrefix = '' }: { active?: boolean; payload?: { value?: number; name?: string; color?: string }[]; label?: string; valuePrefix?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((entry, index) => <p key={index} className="mt-1 text-xs font-bold text-slate-800 dark:text-white"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />{entry.name}: {valuePrefix}{formatCompact(Number(entry.value))}</p>)}
    </div>
  )
}

function KeywordDistributionChart({ data }: { data: SeoData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.keywordDistribution} margin={{ top: 13, right: 0, bottom: 0, left: -16 }} barSize={30}>
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
        <YAxis tickFormatter={(value) => formatCompact(value)} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,.06)' }} />
        <Bar dataKey="keywords" radius={[5, 5, 0, 0]} name="Keywords">{data.keywordDistribution.map((entry) => <Cell key={entry.bucket} fill={entry.color} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function KeywordPreviewRow({ keyword }: { keyword: Keyword }) {
  return (
    <tr><td><div className="font-medium text-slate-800 dark:text-slate-100">{keyword.keyword}</div><div className="mt-0.5 text-[11px] text-slate-400">{keyword.url.replace('https://', '')}</div></td><td><Position position={keyword.position} change={keyword.change} /></td><td>{formatCompact(keyword.volume)}</td><td><Difficulty difficulty={keyword.difficulty} /></td><td><Sparkline values={keyword.trend} /></td></tr>
  )
}

function Position({ position, change }: { position: number; change: number }) {
  return <div><span className={cn('font-semibold', position <= 10 ? 'text-emerald-600 dark:text-emerald-400' : position <= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200')}>{position}</span>{change !== 0 && <span className={cn('ml-1.5 text-[11px] font-semibold', change > 0 ? 'text-emerald-600' : 'text-rose-500')}>{change > 0 ? '↑' : '↓'}{Math.abs(change)}</span>}</div>
}

function Difficulty({ difficulty }: { difficulty: number }) {
  const color = difficulty < 35 ? 'bg-emerald-500' : difficulty < 65 ? 'bg-amber-500' : 'bg-rose-500'
  return <div className="flex min-w-[105px] items-center gap-2"><span className="w-5 text-xs font-semibold text-slate-700 dark:text-slate-200">{difficulty}</span><span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><span className={cn('block h-full rounded-full', color)} style={{ width: `${difficulty}%` }} /></span></div>
}

function Sparkline({ values }: { values: number[] }) {
  const width = 66
  const height = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values.map((value, index) => `${(index / (values.length - 1)) * width},${height - 3 - ((value - min) / range) * (height - 7)}`).join(' ')
  const trendingUp = values[values.length - 1] >= values[0]
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Seven day trend"><polyline fill="none" stroke={trendingUp ? '#10b981' : '#f43f5e'} strokeWidth="1.8" points={points} /></svg>
}

function KeywordsPage() {
  const { data } = useSeo()
  const [term, setTerm] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [volumeFilter, setVolumeFilter] = useState('all')
  const [sort, setSort] = useState<{ key: keyof Keyword; direction: 'asc' | 'desc' }>({ key: 'position', direction: 'asc' })
  const [page, setPage] = useState(1)
  const perPage = 20

  useEffect(() => setPage(1), [term, positionFilter, volumeFilter, sort])
  const filtered = useMemo(() => data.keywords.filter((keyword) => {
    const matchesTerm = keyword.keyword.toLowerCase().includes(term.trim().toLowerCase())
    const matchesPosition = positionFilter === 'all' || (positionFilter === 'top3' && keyword.position <= 3) || (positionFilter === 'top10' && keyword.position <= 10) || (positionFilter === 'top20' && keyword.position <= 20) || (positionFilter === 'other' && keyword.position > 20)
    const matchesVolume = volumeFilter === 'all' || (volumeFilter === 'low' && keyword.volume < 1000) || (volumeFilter === 'mid' && keyword.volume >= 1000 && keyword.volume < 10000) || (volumeFilter === 'high' && keyword.volume >= 10000)
    return matchesTerm && matchesPosition && matchesVolume
  }).sort((first, second) => {
    const one = first[sort.key]
    const two = second[sort.key]
    const result = typeof one === 'string' && typeof two === 'string' ? one.localeCompare(two) : Number(one) - Number(two)
    return sort.direction === 'asc' ? result : -result
  }), [data.keywords, positionFilter, sort, term, volumeFilter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const rows = filtered.slice((page - 1) * perPage, page * perPage)
  const changeSort = (key: keyof Keyword) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }))

  return (
    <>
      <PageHeading eyebrow="Organic keywords" title={`Keyword footprint for ${data.domain}`} description={`${formatNumber(data.keywords.length)} projected ranking signals · refreshed just now`} />
      <Panel title="Ranking keywords" subtitle="Filter, sort, and investigate the 200-domain projection">
        <div className="mb-5 grid gap-2 lg:grid-cols-[1fr_180px_180px]">
          <label className="filter-input"><Search size={16} /><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Filter keyword phrases" /></label>
          <FilterSelect value={positionFilter} onChange={setPositionFilter} label="Position"><option value="all">All positions</option><option value="top3">Top 3</option><option value="top10">Top 10</option><option value="top20">Top 20</option><option value="other">21–100</option></FilterSelect>
          <FilterSelect value={volumeFilter} onChange={setVolumeFilter} label="Volume"><option value="all">All volumes</option><option value="low">Under 1K</option><option value="mid">1K – 10K</option><option value="high">10K+</option></FilterSelect>
        </div>
        <div className="overflow-x-auto"><table className="data-table min-w-[1020px]"><thead><tr>
          <SortHead label="Keyword" column="keyword" current={sort} onClick={changeSort} />
          <SortHead label="Position" column="position" current={sort} onClick={changeSort} />
          <SortHead label="Volume" column="volume" current={sort} onClick={changeSort} />
          <SortHead label="KD" column="difficulty" current={sort} onClick={changeSort} />
          <SortHead label="CPC" column="cpc" current={sort} onClick={changeSort} />
          <th>7D trend</th><SortHead label="Landing page" column="url" current={sort} onClick={changeSort} />
        </tr></thead><tbody>
          {rows.map((keyword) => <tr key={keyword.id}><td><span className="font-medium text-slate-800 dark:text-slate-100">{keyword.keyword}</span></td><td><Position position={keyword.position} change={keyword.change} /></td><td>{formatNumber(keyword.volume)}</td><td><Difficulty difficulty={keyword.difficulty} /></td><td>{formatCpc(keyword.cpc)}</td><td><Sparkline values={keyword.trend} /></td><td><span className="inline-flex max-w-[250px] items-center gap-1 truncate text-violet-600 dark:text-violet-300">{keyword.url.replace('https://', '')}<ExternalLink size={12} className="shrink-0" /></span></td></tr>)}
          {!rows.length && <tr><td colSpan={7} className="!py-14 text-center text-sm text-slate-500">No projected keywords match those filters.</td></tr>}
        </tbody></table></div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><p className="text-xs text-slate-500">Showing <strong className="text-slate-700 dark:text-slate-200">{filtered.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filtered.length)}</strong> of {filtered.length} signals</p><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </Panel>
    </>
  )
}

function FilterSelect({ value, onChange, label, children }: { value: string; onChange: (value: string) => void; label: string; children: ReactNode }) {
  return <label className="relative"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="filter-select">{children}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-slate-400" /></label>
}

function SortHead({ label, column, current, onClick }: { label: string; column: keyof Keyword; current: { key: keyof Keyword; direction: string }; onClick: (key: keyof Keyword) => void }) {
  const active = current.key === column
  return <th><button className={cn('inline-flex items-center gap-1 transition hover:text-violet-600 dark:hover:text-violet-300', active && 'text-violet-600 dark:text-violet-300')} onClick={() => onClick(column)}>{label}{active ? <span className="text-[11px]">{current.direction === 'asc' ? '↑' : '↓'}</span> : <ChevronsUpDown size={12} />}</button></th>
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => Math.min(Math.max(1, page - 2) + index, totalPages))
  return <div className="flex items-center gap-1"><button className="pagination-button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>{pages.map((number) => <button key={number} className={cn('pagination-button', number === page && 'pagination-current')} onClick={() => onChange(number)}>{number}</button>)}<button className="pagination-button" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} aria-label="Next page"><ChevronRight size={16} /></button></div>
}

function AuditPage() {
  const { data } = useSeo()
  const [open, setOpen] = useState<string | null>('Crawlability')
  const categories = ['Crawlability', 'Performance', 'Internal links', 'Content', 'Markup'] as const
  const errors = data.auditIssues.filter((issue) => issue.severity === 'Error').reduce((sum, issue) => sum + issue.affected, 0)
  const warnings = data.auditIssues.filter((issue) => issue.severity === 'Warning').reduce((sum, issue) => sum + issue.affected, 0)

  return (
    <>
      <PageHeading eyebrow="Site audit" title={`Technical health for ${data.domain}`} description="A prioritized checklist built from projected crawl and on-page signals" actions={<button onClick={() => exportOverviewPdf(data)} className="primary-button"><Download size={15} /> Export audit summary</button>} />
      <section className="grid gap-5 xl:grid-cols-5">
        <Panel className="xl:col-span-2" title="Health score" subtitle="Projected technical readiness">
          <div className="flex flex-col items-center justify-center py-8 sm:flex-row sm:gap-8 xl:flex-col xl:gap-2"><HealthGauge value={data.health} /><div className="mt-5 text-center sm:mt-0 sm:text-left xl:text-center"><span className={cn('severity-badge', data.health >= 80 ? 'severity-good' : 'severity-warning')}>{data.health >= 80 ? 'Good foundation' : 'Needs attention'}</span><p className="mt-3 max-w-[220px] text-sm leading-6 text-slate-500 dark:text-slate-400">Resolve errors first, then use warning patterns to guide your technical backlog.</p></div></div>
        </Panel>
        <Panel className="xl:col-span-3" title="Issue summary" subtitle="Affected page counts across the audit">
          <div className="grid gap-3 sm:grid-cols-3"><AuditStat label="Errors" value={errors} icon={<CircleAlert size={17} />} color="rose" /><AuditStat label="Warnings" value={warnings} icon={<CircleAlert size={17} />} color="amber" /><AuditStat label="Notices" value={data.auditIssues.filter((issue) => issue.severity === 'Notice').length} icon={<CircleAlert size={17} />} color="blue" /></div>
          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 text-violet-500" size={17} /><p className="leading-6 text-slate-600 dark:text-slate-300"><strong className="text-slate-800 dark:text-white">Fastest projected win:</strong> Clear missing metadata and redirecting internal links before creating new content. These are hypotheses to verify in your crawler and CMS.</p></div></div>
        </Panel>
      </section>
      <Panel className="mt-5" title="Issues by category" subtitle={`${data.auditIssues.length} issue patterns in the current projection`}>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {categories.map((category) => {
            const issues = data.auditIssues.filter((issue) => issue.category === category)
            if (!issues.length) return null
            const affected = issues.reduce((sum, issue) => sum + issue.affected, 0)
            const isOpen = open === category
            return <div key={category}><button onClick={() => setOpen(isOpen ? null : category)} className="flex w-full items-center gap-4 py-4 text-left"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{category === 'Performance' ? <Zap size={16} /> : category === 'Content' ? <FileBarChart size={16} /> : <ClipboardCheck size={16} />}</span><span className="flex-1"><span className="block text-sm font-semibold text-slate-800 dark:text-white">{category}</span><span className="mt-0.5 block text-xs text-slate-500">{issues.length} issue types · {affected} affected pages</span></span><ChevronDown size={18} className={cn('text-slate-400 transition', isOpen && 'rotate-180')} /></button>{isOpen && <div className="space-y-2 pb-4 pl-0 sm:pl-12">{issues.map((issue) => <div key={issue.id} className="rounded-xl border border-slate-100 px-4 py-3.5 dark:border-slate-800"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><span className={cn('severity-badge', issue.severity === 'Error' ? 'severity-error' : issue.severity === 'Warning' ? 'severity-warning' : 'severity-notice')}>{issue.severity}</span><h3 className="text-sm font-semibold text-slate-800 dark:text-white">{issue.title}</h3></div><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{issue.description}</p></div><span className="shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">{issue.affected} pages</span></div></div>)}</div>}</div>
          })}
        </div>
      </Panel>
    </>
  )
}

function HealthGauge({ value }: { value: number }) {
  return <div className="health-gauge" style={{ '--score': `${value * 3.6}deg` } as CSSProperties}><div className="health-gauge-inner"><span className="font-display text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</span><span className="mt-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">out of 100</span></div></div>
}

function AuditStat({ label, value, icon, color }: { label: string; value: number; icon: ReactNode; color: 'rose' | 'amber' | 'blue' }) {
  const styles = { rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300', amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300', blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300' }
  return <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"><span className={cn('grid h-8 w-8 place-items-center rounded-lg', styles[color])}>{icon}</span><p className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(value)}</p><p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p></div>
}

function CompetitorsPage() {
  const { data } = useSeo()
  const navigate = useNavigate()
  const chartData = ['Traffic', 'Keywords', 'Backlinks', 'Ref. domains'].map((metric) => {
    const key = metric === 'Traffic' ? 'traffic' : metric === 'Keywords' ? 'keywords' : metric === 'Backlinks' ? 'backlinks' : 'referringDomains'
    const max = Math.max(...data.competitors.map((competitor) => competitor[key]))
    return data.competitors.reduce<Record<string, string | number>>((row, competitor) => ({ ...row, [competitor.domain]: Math.round((competitor[key] / max) * 100) }), { metric })
  })
  return (
    <>
      <PageHeading eyebrow="Competitive landscape" title={`Search competitors for ${data.domain}`} description="Peer domains and overlap are local model projections to validate before planning outreach" />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{data.competitors.map((competitor, index) => <article key={competitor.domain} className={cn('competitor-card', index === 0 && 'competitor-card-primary')}><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">{index === 0 ? 'Your domain' : `Competitor ${index}`}</span>{index > 0 && <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{competitor.overlap}% overlap</span>}</div><h2 className="mt-4 truncate font-display text-lg font-bold text-slate-900 dark:text-white">{competitor.domain}</h2><div className="mt-6 grid grid-cols-2 gap-y-4"><MiniMetric label="Traffic" value={formatCompact(competitor.traffic)} /><MiniMetric label="Keywords" value={formatCompact(competitor.keywords)} /><MiniMetric label="Authority" value={String(competitor.authority)} /><MiniMetric label="Backlinks" value={formatCompact(competitor.backlinks)} /></div></article>)}</section>
      <Panel className="mt-5" title="Competitive visibility index" subtitle="Each metric is indexed to the leading domain in this peer set (100)"><div className="h-[360px] pt-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 8, right: 0, bottom: 0, left: -18 }} barGap={4}><XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `${value}`} /><Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,.06)' }} />{data.competitors.map((competitor) => <Bar key={competitor.domain} dataKey={competitor.domain} fill={competitor.color} radius={[4, 4, 0, 0]} />)}</BarChart></ResponsiveContainer></div></Panel>
      <section className="mt-5 grid gap-5 lg:grid-cols-2"><Panel title="Overlap opportunities" subtitle="Projected shared keyword territory"><div className="space-y-4 pt-5">{data.competitors.slice(1).map((competitor) => <div key={competitor.domain}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-semibold text-slate-700 dark:text-slate-200">{competitor.domain}</span><span className="font-bold text-violet-600 dark:text-violet-300">{competitor.overlap}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-violet-500" style={{ width: `${competitor.overlap}%` }} /></div></div>)}</div></Panel><Panel title="Suggested next move" subtitle="How to use this screen"><div className="pt-5 text-sm leading-7 text-slate-600 dark:text-slate-400"><p>Compare the top competitor’s content clusters with your top 20–50 terms, then validate the gap with real Search Console impressions.</p><button onClick={() => navigate('/overview')} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-300"><Bot size={16} /> Open AI strategic brief <ChevronRight size={16} /></button></div></Panel></section>
    </>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p><p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">{value}</p></div> }

function BacklinksPage() {
  const { data } = useSeo()
  const [type, setType] = useState<'All' | 'Follow' | 'Nofollow'>('All')
  const links = data.backlinks.filter((link) => type === 'All' || link.type === type).slice(0, 10)
  return (
    <>
      <PageHeading eyebrow="Backlink profile" title={`Authority signals for ${data.domain}`} description={`${formatCompact(data.metrics.backlinks.value)} projected links from ${formatCompact(data.metrics.referringDomains.value)} referring domains`} />
      <section className="grid gap-5 xl:grid-cols-2"><Panel title="Link attribute mix" subtitle="Projected follow / nofollow ratio"><div className="h-[275px]"><DonutChart data={data.linkTypes} /></div></Panel><Panel title="Anchor text distribution" subtitle="Projected composition across link anchors"><div className="h-[275px]"><DonutChart data={data.anchors} /></div></Panel></section>
      <Panel className="mt-5" title="Referring domains" subtitle="A sample of the projected referring-domain profile" action={<div className="flex rounded-lg bg-slate-100 p-1 text-xs dark:bg-slate-800">{(['All', 'Follow', 'Nofollow'] as const).map((item) => <button key={item} onClick={() => setType(item)} className={cn('rounded-md px-3 py-1.5 font-semibold transition', type === item ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-700 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400')}>{item}</button>)}</div>}><div className="overflow-x-auto"><table className="data-table min-w-[800px]"><thead><tr><th>Source URL</th><th>Domain rating</th><th>Links</th><th>Attribute</th><th>First seen</th></tr></thead><tbody>{links.map((link) => <tr key={link.id}><td><span className="inline-flex max-w-[440px] items-center gap-1 truncate font-medium text-violet-600 dark:text-violet-300">{link.source.replace('https://', '')}<ExternalLink size={12} className="shrink-0" /></span><span className="mt-0.5 block text-[11px] text-slate-400">Anchor: {link.anchor}</span></td><td><span className="font-semibold text-slate-700 dark:text-slate-200">{link.domainRating}</span></td><td>{formatNumber(link.links)}</td><td><span className={cn('severity-badge', link.type === 'Follow' ? 'severity-good' : 'severity-notice')}>{link.type}</span></td><td>{link.firstSeen}</td></tr>)}</tbody></table></div></Panel>
    </>
  )
}

function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return <div className="flex h-full flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none">{data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer><div className="-mt-9 flex w-full shrink-0 justify-center gap-4 sm:mt-0 sm:w-32 sm:flex-col sm:gap-3">{data.map((entry) => <div key={entry.name} className="flex items-center justify-between gap-2 text-xs"><span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><i className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />{entry.name}</span><strong className="text-slate-800 dark:text-white">{entry.value}%</strong></div>)}</div></div>
}

function AiBriefPanel({ data }: { data: SeoData }) {
  const [apiKey, setApiKey] = useState('')
  const [request, setRequest] = useState('Create a focused 90-day SEO action plan for this domain.')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const generate = async () => {
    if (!apiKey.trim()) {
      setError('Enter a Gemini API key to generate a live AI brief.')
      return
    }
    setWorking(true)
    setError('')
    try {
      const brief = await generateGeminiSeoBrief({ apiKey, data, request })
      setResult(brief.text)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to contact Gemini. Please try again.')
    } finally {
      setWorking(false)
    }
  }
  return <Panel className="xl:col-span-2" title="RankPulse AI" subtitle={`Powered by Gemini · ${GEMINI_MODEL}`}><div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-500/15 dark:bg-violet-500/[0.06]"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-600 text-white"><Bot size={17} /></span><p className="text-xs leading-5 text-slate-600 dark:text-slate-300">Generate a strategic brief from the open dashboard. The key is used only for this direct browser-to-Gemini request and is never stored.</p></div><label className="mt-4 block"><span className="sr-only">Gemini API key</span><input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Paste Gemini API key" className="ai-input" autoComplete="off" /></label><label className="mt-2 block"><span className="sr-only">AI request</span><textarea value={request} onChange={(event) => setRequest(event.target.value)} className="ai-input min-h-[68px] resize-y" /></label><button onClick={generate} disabled={working} className="primary-button mt-3 w-full">{working ? <><LoaderCircle size={15} className="animate-spin" /> Building brief…</> : <><Sparkles size={15} /> Generate strategic brief</>}</button>{error && <p role="alert" className="mt-3 text-xs leading-5 text-rose-600 dark:text-rose-300">{error}</p>}{result && <div className="mt-4 rounded-lg border border-violet-100 bg-white p-3.5 text-xs leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-violet-600 dark:text-violet-300">Live Gemini response</p><div className="whitespace-pre-wrap">{result}</div></div>}<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-300">Get a Gemini API key <ExternalLink size={11} /></a></div></Panel>
}

function DashboardSkeleton() {
  return <div aria-label="Analyzing domain" className="animate-pulse"><div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-3 h-9 w-72 rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[148px] rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" /><div className="mt-8 h-8 w-32 rounded bg-slate-100 dark:bg-slate-800" /><div className="mt-5 h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" /></div>)}</div><div className="mt-5 grid gap-5 xl:grid-cols-5"><div className="h-[320px] rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-3" /><div className="h-[320px] rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-2" /></div></div>
}

async function exportOverviewPdf(data: SeoData) {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ unit: 'pt', format: 'a4' })
  const metrics = data.metrics
  document.setFillColor(98, 85, 246)
  document.rect(0, 0, 595, 110, 'F')
  document.setTextColor(255, 255, 255)
  document.setFontSize(24)
  document.text('RankPulse SEO opportunity report', 42, 54)
  document.setFontSize(12)
  document.text(`${data.domain} · Deterministic demo projection`, 42, 78)
  document.setTextColor(25, 35, 55)
  document.setFontSize(17)
  document.text('Overview', 42, 145)
  const reportLines = [
    `Domain authority: ${metrics.authority.value}`,
    `Estimated organic traffic: ${formatNumber(metrics.traffic.value)} per month`,
    `Projected ranking keywords: ${formatNumber(metrics.keywords.value)}`,
    `Estimated backlinks: ${formatNumber(metrics.backlinks.value)}`,
    `Referring domains: ${formatNumber(metrics.referringDomains.value)}`,
    `Estimated traffic value: ${formatCurrency(metrics.trafficValue.value)} per month`,
    `Technical health score: ${data.health}/100`,
  ]
  document.setFontSize(11)
  reportLines.forEach((line, index) => document.text(line, 48, 178 + index * 26))
  document.setFontSize(10)
  document.setTextColor(100, 116, 139)
  document.text('Important: This report contains locally generated, deterministic demo projections. Validate with first-party analytics and a crawl before acting.', 42, 405, { maxWidth: 510 })
  document.save(`rankpulse-${data.domain.replace(/[^a-z0-9]+/g, '-')}-report.pdf`)
}
