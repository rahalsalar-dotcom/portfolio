import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent, type ImgHTMLAttributes } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { ThreeBackground } from './components/ThreeBackground'
import { useImageSource } from './hooks/useImageSource'
import { emptyLocalizedText, languageMeta, languages, localize, ui } from './i18n'
import { adminPassword, firebaseEnabled } from './lib/runtimeConfig'
import { usePortfolioStore } from './store/portfolioStore'
import type { Category, ContactInfo, Language, LocalizedText, Project, SiteContent, SocialLink } from './types'

type ProjectDraft = Omit<Project, 'id'>
type LocalizedContentKey = 'designerName' | 'role' | 'intro' | 'aboutTitle' | 'aboutText'

function cloneContent(content: SiteContent): SiteContent {
  return structuredClone(content)
}

function createEmptyProject(category: string): ProjectDraft {
  return {
    title: emptyLocalizedText(),
    category,
    description: emptyLocalizedText(),
    image: '',
    tools: ['Photoshop'],
  }
}

function setLocalizedText(text: LocalizedText, language: Language, value: string): LocalizedText {
  return { ...text, [language]: value }
}

function getCategoryLabel(categories: Category[], categoryId: string, language: Language): string {
  return localize(categories.find((category) => category.id === categoryId)?.label ?? categoryId, language)
}

function createCategoryId(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || `category-${Date.now()}`
}

function SmartImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const resolvedSrc = useImageSource(src)

  return <img src={resolvedSrc || undefined} alt={alt} {...props} />
}

function App() {
  const initialized = usePortfolioStore((state) => state.initialized)
  const language = usePortfolioStore((state) => state.language)
  const loadContent = usePortfolioStore((state) => state.loadContent)

  useEffect(() => {
    document.documentElement.lang = language === 'ku' ? 'ckb' : language
    document.documentElement.dir = languageMeta[language].dir
  }, [language])

  useEffect(() => {
    void loadContent()
  }, [loadContent])

  return <BrowserRouter>{initialized ? <AnimatedRoutes /> : <LoadingScreen language={language} />}</BrowserRouter>
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PortfolioSite />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  )
}

function LoadingScreen({ language }: { language: Language }) {
  const t = ui[language]

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#04000d] text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="loader-ring" />
        <div>
          <p className="text-xs uppercase tracking-[0.55em] text-cyan-200">{t.booting}</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl">{t.interface}</h1>
        </div>
      </div>
    </motion.div>
  )
}

function PortfolioSite() {
  const content = usePortfolioStore((state) => state.content)
  const language = usePortfolioStore((state) => state.language)
  const setLanguage = usePortfolioStore((state) => state.setLanguage)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const t = ui[language]

  useEffect(() => {
    const designerName = localize(content.designerName, language)
    const role = localize(content.role, language)
    document.title = `${designerName} | ${role}`
    document.querySelector('meta[name="description"]')?.setAttribute('content', localize(content.intro, language))
  }, [content, language])

  const activeCategory = activeCategoryId ? content.categories.find((c) => c.id === activeCategoryId) ?? null : null

  return (
    <motion.div
      dir={languageMeta[language].dir}
      className="min-h-screen overflow-hidden text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ThreeBackground />
      <CursorGlow />
      <div className="noise-overlay" />
      <Navigation content={content} language={language} onLanguageChange={setLanguage} />
      <main className="relative z-10">
        <HeroSection content={content} language={language} />
        <AboutSection content={content} language={language} />
        <PortfolioSection content={content} language={language} onCategoryOpen={setActiveCategoryId} />
        <SocialSection content={content} language={language} />
        <ContactSection content={content} language={language} />
      </main>
      <Footer designerName={localize(content.designerName, language)} footerText={t.footer} />
      <ProjectPreview project={activeProject} content={content} language={language} onClose={() => setActiveProject(null)} />
      <CategoryDetail category={activeCategory} content={content} language={language} onClose={() => setActiveCategoryId(null)} onProjectOpen={setActiveProject} />
    </motion.div>
  )
}

function CursorGlow() {
  const [position, setPosition] = useState({ x: -400, y: -400 })

  useEffect(() => {
    const move = (event: PointerEvent) => {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <motion.div
      className="cursor-glow"
      animate={{ x: position.x - 180, y: position.y - 180 }}
      transition={{ type: 'spring', stiffness: 65, damping: 24, mass: 0.35 }}
    />
  )
}

function LanguageSwitcher({ language, onLanguageChange }: { language: Language; onLanguageChange: (language: Language) => void }) {
  return (
    <div className="language-switcher" aria-label="Language switcher">
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={item === language}
          onClick={() => onLanguageChange(item)}
          className={item === language ? 'language-pill language-pill-active' : 'language-pill'}
        >
          <span>{languageMeta[item].short}</span>
          <span className="hidden sm:inline">{languageMeta[item].label}</span>
        </button>
      ))}
    </div>
  )
}

function Navigation({
  content,
  language,
  onLanguageChange,
}: {
  content: SiteContent
  language: Language
  onLanguageChange: (language: Language) => void
}) {
  const t = ui[language]
  const navLinks = [
    { label: t.home, href: '#home' },
    { label: t.about, href: '#about' },
    { label: t.work, href: '#work' },
    { label: t.social, href: '#social' },
    { label: t.contact, href: '#contact' },
  ]

  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/10 bg-[#080014]/70 px-4 py-3 shadow-[0_0_45px_rgba(34,211,238,0.12)] backdrop-blur-2xl sm:px-6">
        <a href="#home" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-sm font-black text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            N
          </span>
          <span className="hidden text-sm font-bold uppercase tracking-[0.24em] text-white sm:block">
            {localize(content.designerName, language)}
          </span>
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-pill">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
          <a href="#contact" className="glow-button hidden sm:inline-flex">
            {t.startProject}
          </a>
        </div>
      </nav>
    </header>
  )
}

function HeroSection({ content, language }: { content: SiteContent; language: Language }) {
  const t = ui[language]
  const designerName = localize(content.designerName, language)

  return (
    <section id="home" className="section-shell grid min-h-screen items-center gap-12 pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-cyan-100">
          {t.heroBadge}
        </div>
        <h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.08em] text-white sm:text-7xl lg:text-8xl">
          <span className="text-gradient">{designerName}</span>
          <span className="block text-white/90">{localize(content.role, language)}</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">{localize(content.intro, language)}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#work" className="glow-button justify-center">
            {t.viewPortfolio}
          </a>
          <a href="#contact" className="outline-button justify-center">
            {t.contactDesigner}
          </a>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {content.stats.map((stat) => (
            <div key={localize(stat.label, language)} className="glass-panel p-5">
              <div className="text-3xl font-black text-white">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-1 text-sm text-slate-400">{localize(stat.label, language)}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="relative mx-auto w-full max-w-[520px]"
        initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.12 }}
      >
        <div className="hero-orbit" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_0_80px_rgba(168,85,247,0.24)] backdrop-blur-xl">
          <SmartImage
            src={content.profileImage}
            alt={`${designerName} profile`}
            className="aspect-[4/5] w-full rounded-[1.45rem] object-cover"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">{t.currentFocus}</p>
            <p className="mt-2 text-lg font-bold text-white">{t.currentFocusText}</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / 1300, 1)
      setCount(Math.round(value * progress))

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      }
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [value])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

function AboutSection({ content, language }: { content: SiteContent; language: Language }) {
  const t = ui[language]

  return (
    <section id="about" className="section-shell py-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div className="sticky top-28 h-fit" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="section-kicker">{t.about}</p>
          <h2 className="section-title">{localize(content.aboutTitle, language)}</h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">{localize(content.aboutText, language)}</p>
        </motion.div>
        <div className="grid gap-5">
          {content.skills.map((skill) => (
            <motion.article
              key={localize(skill.name, language)}
              className="neon-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-white">{localize(skill.name, language)}</h3>
                  <p className="mt-2 text-slate-400">{localize(skill.detail, language)}</p>
                </div>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-100">
                  {skill.level}%
                </span>
              </div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-purple-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9 }}
                />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PortfolioSection({
  content,
  language,
  onCategoryOpen,
}: {
  content: SiteContent
  language: Language
  onCategoryOpen: (categoryId: string) => void
}) {
  const t = ui[language]
  const categories = content.categories.filter((category) => content.projects.some((project) => project.category === category.id))

  return (
    <section id="work" className="section-shell py-24">
      <div className="mb-10">
        <p className="section-kicker">{t.portfolioGallery}</p>
        <h2 className="section-title">{t.portfolioTitle}</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {categories.map((category) => {
          const categoryProjects = content.projects.filter((project) => project.category === category.id)
          const latestProject = categoryProjects[categoryProjects.length - 1]

          return (
            <motion.button
              type="button"
              key={category.id}
              layout
              onClick={() => onCategoryOpen(category.id)}
              className="group relative flex h-64 w-full items-end overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 text-start shadow-[0_0_40px_rgba(34,211,238,0.08)]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              whileHover={{ y: -4 }}
            >
              {latestProject && (
                <SmartImage
                  src={latestProject.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
              <div className="relative z-10 p-6">
                <h3 className="text-3xl font-black tracking-[-0.04em] text-white">{localize(category.label, language)}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  {categoryProjects.length} {categoryProjects.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

function CategoryDetail({
  category,
  content,
  language,
  onClose,
  onProjectOpen,
}: {
  category: Category | null
  content: SiteContent
  language: Language
  onClose: () => void
  onProjectOpen: (project: Project) => void
}) {
  const t = ui[language]

  if (!category) {
    return null
  }

  const categoryProjects = content.projects.filter((project) => project.category === category.id)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/95 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8" onClick={(event) => event.stopPropagation()}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl">{localize(category.label, language)}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {categoryProjects.length} {categoryProjects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="glow-button">
              {t.close}
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {categoryProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.article className="group" whileHover={{ y: -4 }}>
                  <button type="button" onClick={() => onProjectOpen(project)} className="block w-full text-start">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                      <SmartImage
                        src={project.image}
                        alt={localize(project.title, language)}
                        className="w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-2xl font-black tracking-[-0.04em] text-white">{localize(project.title, language)}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-300">{localize(project.description, language)}</p>
                      </div>
                    </div>
                  </button>
                </motion.article>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function ProjectPreview({
  project,
  content,
  language,
  onClose,
}: {
  project: Project | null
  content: SiteContent
  language: Language
  onClose: () => void
}) {
  const t = ui[language]

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#080014] shadow-[0_0_90px_rgba(168,85,247,0.28)]"
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              {t.close}
            </button>
            <SmartImage src={project.image} alt={localize(project.title, language)} className="max-h-[80vh] w-full object-contain bg-black/40" decoding="async" />
            <div className="p-6 sm:p-8">
              <p className="section-kicker">{getCategoryLabel(content.categories, project.category, language)}</p>
              <h3 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white sm:text-5xl">{localize(project.title, language)}</h3>
              <p className="mt-4 max-w-3xl text-slate-300">{localize(project.description, language)}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tools.map((tool) => (
                  <span key={tool} className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function SocialSection({ content, language }: { content: SiteContent; language: Language }) {
  const t = ui[language]

  return (
    <section id="social" className="section-shell py-24">
      <div className="mb-10 max-w-3xl">
        <p className="section-kicker">{t.social}</p>
        <h2 className="section-title">{t.socialTitle}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {content.socials.map((social) => (
          <motion.a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className="social-card"
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-500 text-sm font-black text-black shadow-[0_0_30px_rgba(34,211,238,0.25)]">
              {social.icon}
            </span>
            <span className="mt-5 block text-xl font-black text-white">{localize(social.label, language)}</span>
            <span className="mt-1 block text-sm text-slate-400">{social.handle}</span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

function ContactSection({ content, language }: { content: SiteContent; language: Language }) {
  const t = ui[language]
  const whatsappHref = `https://wa.me/${content.contact.whatsapp.replace(/\D/g, '')}`

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? 'Portfolio visitor')
    const message = String(data.get('message') ?? '')
    const subject = encodeURIComponent(`${t.mailSubject} ${name}`)
    const body = encodeURIComponent(message)
    window.location.href = `mailto:${content.contact.email}?subject=${subject}&body=${body}`
    form.reset()
  }

  return (
    <section id="contact" className="section-shell py-24">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-6 sm:p-8">
          <p className="section-kicker">{t.contact}</p>
          <h2 className="section-title">{t.contactTitle}</h2>
          <div className="mt-8 grid gap-4 text-slate-300">
            <a href={`mailto:${content.contact.email}`} className="contact-row">
              {t.email} <span>{content.contact.email}</span>
            </a>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="contact-row">
              {t.whatsapp} <span>{content.contact.whatsapp}</span>
            </a>
            <div className="contact-row">
              {t.discord} <span>{content.contact.discord}</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="glass-panel grid gap-4 p-6 sm:p-8">
          <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
            {t.name}
            <input name="name" required className="field" placeholder={t.yourName} />
          </label>
          <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
            {t.email}
            <input name="email" type="email" required className="field" placeholder="you@email.com" />
          </label>
          <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
            {t.projectBrief}
            <textarea name="message" required rows={6} className="field resize-none" placeholder={t.projectPlaceholder} />
          </label>
          <button type="submit" className="glow-button justify-center">
            {t.sendMessage}
          </button>
        </form>
      </div>
    </section>
  )
}

function Footer({ designerName, footerText }: { designerName: string; footerText: string }) {
  return (
    <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500">
      <p>
        {designerName} {footerText}
      </p>
    </footer>
  )
}

function AdminDashboard() {
  const language = usePortfolioStore((state) => state.language)
  const setLanguage = usePortfolioStore((state) => state.setLanguage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => window.sessionStorage.getItem('nova-admin') === 'active')

  useEffect(() => {
    document.title = ui[language].adminDashboard
  }, [language])

  const handleLogin = () => {
    window.sessionStorage.setItem('nova-admin', 'active')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    window.sessionStorage.removeItem('nova-admin')
    setIsAuthenticated(false)
  }

  return (
    <motion.div
      dir={languageMeta[language].dir}
      className="min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ThreeBackground />
      <div className="noise-overlay" />
      {isAuthenticated ? (
        <AdminEditor language={language} onLanguageChange={setLanguage} onLogout={handleLogout} />
      ) : (
        <AdminLogin language={language} onLanguageChange={setLanguage} onLogin={handleLogin} />
      )}
    </motion.div>
  )
}

function AdminLogin({
  language,
  onLanguageChange,
  onLogin,
}: {
  language: Language
  onLanguageChange: (language: Language) => void
  onLogin: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const t = ui[language]

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password === adminPassword) {
      onLogin()
      return
    }

    setError(t.wrongPassword)
  }

  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-4 py-20">
      <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md p-7 sm:p-9">
        <div className="mb-6 flex justify-start">
          <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
        </div>
        <p className="section-kicker">{t.secureRoute}</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">{t.adminLogin}</h1>
        <p className="mt-3 text-sm text-slate-400">{t.adminLoginText}</p>
        <label className="mt-7 grid gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
          {t.password}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder={t.enterPassword}
          />
        </label>
        {error ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
        {adminPassword === 'admin123' ? (
          <p className="mt-4 rounded-xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-sm text-yellow-100">{t.defaultPassword}</p>
        ) : null}
        <button type="submit" className="glow-button mt-6 w-full justify-center">
          {t.login}
        </button>
        <Link to="/" className="mt-4 inline-flex text-sm font-bold text-cyan-200 hover:text-white">
          {t.backToWebsite}
        </Link>
      </form>
    </main>
  )
}

function AdminEditor({
  language,
  onLanguageChange,
  onLogout,
}: {
  language: Language
  onLanguageChange: (language: Language) => void
  onLogout: () => void
}) {
  const content = usePortfolioStore((state) => state.content)
  const saveContent = usePortfolioStore((state) => state.saveContent)
  const uploadImage = usePortfolioStore((state) => state.uploadImage)
  const [draft, setDraft] = useState(() => cloneContent(content))
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [newProject, setNewProject] = useState(() => createEmptyProject(content.categories[0]?.id ?? 'photoshop'))
  const [statusKey, setStatusKey] = useState('statusIdle')
  const t = ui[language]

  const updateDraft = <Key extends keyof SiteContent,>(key: Key, value: SiteContent[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const updateLocalizedDraft = (key: LocalizedContentKey, value: string) => {
    setDraft((current) => ({ ...current, [key]: setLocalizedText(current[key], language, value) }))
  }

  const updateContact = (field: keyof ContactInfo, value: string) => {
    setDraft((current) => ({ ...current, contact: { ...current.contact, [field]: value } }))
  }

  const updateCategoryLabel = (id: string, value: string) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === id ? { ...category, label: setLocalizedText(category.label, language, value) } : category,
      ),
    }))
  }

  const updateSocial = (id: string, field: keyof Pick<SocialLink, 'handle' | 'url'>, value: string) => {
    setDraft((current) => ({
      ...current,
      socials: current.socials.map((social) => (social.id === id ? { ...social, [field]: value } : social)),
    }))
  }

  const updateSocialLabel = (id: string, value: string) => {
    setDraft((current) => ({
      ...current,
      socials: current.socials.map((social) =>
        social.id === id ? { ...social, label: setLocalizedText(social.label, language, value) } : social,
      ),
    }))
  }

  const updateProject = (id: string, patch: Partial<Project>) => {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project) => (project.id === id ? { ...project, ...patch } : project)),
    }))
  }

  const uploadProfileImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setStatusKey('statusUploadingProfile')
    updateDraft('profileImage', await uploadImage(file))
    setStatusKey('statusProfileReady')
  }

  const handleProjectFile = async (file: File) => {
    setStatusKey('statusUploadingProject')
    const image = await uploadImage(file)
    setNewProject((current) => ({ ...current, image }))
    setStatusKey('statusProjectReady')
  }

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      await handleProjectFile(file)
    }
  }

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (file) {
      await handleProjectFile(file)
    }
  }

  const uploadExistingProjectImage = async (projectId: string, file: File) => {
    setStatusKey('statusUploadingProject')
    const image = await uploadImage(file)
    updateProject(projectId, { image })
    setStatusKey('statusExistingProjectReady')
  }

  const handleExistingProjectFileInput = async (projectId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      await uploadExistingProjectImage(projectId, file)
      event.currentTarget.value = ''
    }
  }

  const handleExistingProjectDrop = async (projectId: string, event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (file) {
      await uploadExistingProjectImage(projectId, file)
    }
  }

  const addCategory = () => {
    const label = newCategoryLabel.trim()
    const id = createCategoryId(newCategoryId || label)

    if (!label || draft.categories.some((category) => category.id === id)) {
      return
    }

    const categoryLabel = setLocalizedText(emptyLocalizedText(label), language, label)
    updateDraft('categories', [...draft.categories, { id, label: categoryLabel }])
    setNewCategoryId('')
    setNewCategoryLabel('')
    setNewProject((current) => ({ ...current, category: id }))
  }

  const addProject = () => {
    if (!localize(newProject.title, language).trim() || !newProject.image.trim()) {
      setStatusKey('statusProjectRequired')
      return
    }

    const project: Project = {
      ...newProject,
      id: `project-${Date.now()}`,
      tools: newProject.tools.length ? newProject.tools : ['Photoshop'],
    }

    updateDraft('projects', [project, ...draft.projects])
    setNewProject(createEmptyProject(draft.categories[0]?.id ?? 'photoshop'))
    setStatusKey('statusProjectAdded')
  }

  const deleteProject = (id: string) => {
    updateDraft(
      'projects',
      draft.projects.filter((project) => project.id !== id),
    )
  }

  const saveDraft = async () => {
    setStatusKey('statusSaving')
    await saveContent(draft)
    setStatusKey(firebaseEnabled ? 'statusSavedFirebase' : 'statusSavedLocal')
  }

  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null)

  const reorderProjectInCategory = (categoryId: string, projectId: string, targetIndex: number) => {
    const categoryProjects = draft.projects.filter((p) => p.category === categoryId)
    const currentIndex = categoryProjects.findIndex((p) => p.id === projectId)
    if (currentIndex === -1 || currentIndex === targetIndex) return

    const [moved] = categoryProjects.splice(currentIndex, 1)
    categoryProjects.splice(targetIndex, 0, moved)

    const otherProjects = draft.projects.filter((p) => p.category !== categoryId)
    updateDraft('projects', [...otherProjects, ...categoryProjects])
  }

  return (
    <main className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex-row lg:items-center">
          <div>
            <p className="section-kicker">{t.adminDashboard}</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">{t.editPortfolio}</h1>
            <p className="mt-3 text-sm text-slate-400">{t[statusKey] ?? t.statusIdle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
            <Link to="/" className="outline-button">
              {t.viewSite}
            </Link>
            <button type="button" onClick={saveDraft} className="glow-button">
              {t.save}
            </button>
            <button type="button" onClick={onLogout} className="outline-button border-red-300/30 text-red-100">
              {t.logout}
            </button>
          </div>
        </header>

        <div className="admin-grid">
          <section className="admin-panel">
            <h2 className="admin-title">{t.heroAbout}</h2>
            <label className="admin-label">
              {t.designerName}
              <input className="field" value={localize(draft.designerName, language)} onChange={(event) => updateLocalizedDraft('designerName', event.target.value)} />
            </label>
            <label className="admin-label">
              {t.role}
              <input className="field" value={localize(draft.role, language)} onChange={(event) => updateLocalizedDraft('role', event.target.value)} />
            </label>
            <label className="admin-label">
              {t.intro}
              <textarea className="field resize-none" rows={4} value={localize(draft.intro, language)} onChange={(event) => updateLocalizedDraft('intro', event.target.value)} />
            </label>
            <label className="admin-label">
              {t.profileImageUrl}
              <input className="field" value={draft.profileImage} onChange={(event) => updateDraft('profileImage', event.target.value)} />
            </label>
            <label className="drop-zone cursor-pointer">
              {t.uploadProfileImage}
              <input type="file" accept="image/*" className="hidden" onChange={uploadProfileImage} />
            </label>
            <label className="admin-label">
              {t.aboutTitle}
              <input className="field" value={localize(draft.aboutTitle, language)} onChange={(event) => updateLocalizedDraft('aboutTitle', event.target.value)} />
            </label>
            <label className="admin-label">
              {t.aboutText}
              <textarea className="field resize-none" rows={5} value={localize(draft.aboutText, language)} onChange={(event) => updateLocalizedDraft('aboutText', event.target.value)} />
            </label>
          </section>

          <section className="admin-panel">
            <h2 className="admin-title">{t.categoriesNewProject}</h2>
            <div className="grid gap-3">
              {draft.categories.map((category) => (
                <label key={category.id} className="admin-label rounded-2xl border border-white/10 bg-black/20 p-3">
                  {category.id}
                  <input className="field" value={localize(category.label, language)} onChange={(event) => updateCategoryLabel(category.id, event.target.value)} />
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-[0.8fr_1fr_auto]">
              <input className="field" value={newCategoryId} onChange={(event) => setNewCategoryId(event.target.value)} placeholder={t.categoryId} />
              <input className="field" value={newCategoryLabel} onChange={(event) => setNewCategoryLabel(event.target.value)} placeholder={t.addCategory} />
              <button type="button" onClick={addCategory} className="outline-button shrink-0">
                {t.add}
              </button>
            </div>
            <label className="admin-label mt-6">
              {t.title}
              <input
                className="field"
                value={localize(newProject.title, language)}
                onChange={(event) => setNewProject((current) => ({ ...current, title: setLocalizedText(current.title, language, event.target.value) }))}
              />
            </label>
            <label className="admin-label">
              {t.category}
              <select className="field" value={newProject.category} onChange={(event) => setNewProject((current) => ({ ...current, category: event.target.value }))}>
                {draft.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {localize(category.label, language)}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-label">
              {t.imageUrl}
              <input className="field" value={newProject.image} onChange={(event) => setNewProject((current) => ({ ...current, image: event.target.value }))} />
            </label>
            <label className="drop-zone cursor-pointer" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
              {t.uploadProjectImage}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </label>
            <label className="admin-label">
              {t.description}
              <textarea
                className="field resize-none"
                rows={4}
                value={localize(newProject.description, language)}
                onChange={(event) => setNewProject((current) => ({ ...current, description: setLocalizedText(current.description, language, event.target.value) }))}
              />
            </label>
            <label className="admin-label">
              {t.tools}
              <input
                className="field"
                value={newProject.tools.join(', ')}
                onChange={(event) =>
                  setNewProject((current) => ({
                    ...current,
                    tools: event.target.value
                      .split(',')
                      .map((tool) => tool.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </label>
            <button type="button" onClick={addProject} className="glow-button mt-4 w-full justify-center">
              {t.addProject}
            </button>
          </section>

          <section className="admin-panel lg:col-span-2">
            <h2 className="admin-title">{t.socialLinksContact}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {draft.socials.map((social) => (
                <div key={social.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <input className="field mb-2" value={localize(social.label, language)} onChange={(event) => updateSocialLabel(social.id, event.target.value)} />
                  <input className="field mb-2" value={social.handle} onChange={(event) => updateSocial(social.id, 'handle', event.target.value)} />
                  <input className="field" value={social.url} onChange={(event) => updateSocial(social.id, 'url', event.target.value)} />
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <label className="admin-label">
                {t.email}
                <input className="field" value={draft.contact.email} onChange={(event) => updateContact('email', event.target.value)} />
              </label>
              <label className="admin-label">
                {t.whatsapp}
                <input className="field" value={draft.contact.whatsapp} onChange={(event) => updateContact('whatsapp', event.target.value)} />
              </label>
              <label className="admin-label">
                {t.discord}
                <input className="field" value={draft.contact.discord} onChange={(event) => updateContact('discord', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="admin-panel lg:col-span-2">
            <h2 className="admin-title">{t.existingProjects}</h2>
            <div className="mb-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">{t.addProject}</p>
              <div className="grid gap-3">
                <input
                  className="field"
                  value={localize(newProject.title, language)}
                  placeholder={t.title}
                  onChange={(event) => setNewProject((current) => ({ ...current, title: setLocalizedText(current.title, language, event.target.value) }))}
                />
                <select className="field" value={newProject.category} onChange={(event) => setNewProject((current) => ({ ...current, category: event.target.value }))}>
                  {draft.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {localize(category.label, language)}
                    </option>
                  ))}
                </select>
                <label className="drop-zone cursor-pointer" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
                  {t.uploadProjectImage}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                </label>
                <input className="field" value={newProject.image} placeholder={t.imageUrl} onChange={(event) => setNewProject((current) => ({ ...current, image: event.target.value }))} />
                <textarea className="field resize-none" rows={3} value={localize(newProject.description, language)} placeholder={t.description} onChange={(event) => setNewProject((current) => ({ ...current, description: setLocalizedText(current.description, language, event.target.value) }))} />
                <input className="field" value={newProject.tools.join(', ')} placeholder={t.tools} onChange={(event) => setNewProject((current) => ({ ...current, tools: event.target.value.split(',').map((tool) => tool.trim()).filter(Boolean) }))} />
              </div>
              <button type="button" onClick={addProject} className="glow-button mt-3 w-full justify-center">
                {t.addProject}
              </button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {draft.projects.map((project) => (
                <article key={project.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <SmartImage src={project.image} alt={localize(project.title, language)} className="mb-4 h-48 w-full rounded-2xl object-cover" loading="lazy" decoding="async" />
                  <div className="grid gap-3">
                    <input
                      className="field"
                      value={localize(project.title, language)}
                      onChange={(event) => updateProject(project.id, { title: setLocalizedText(project.title, language, event.target.value) })}
                    />
                    <select className="field" value={project.category} onChange={(event) => updateProject(project.id, { category: event.target.value })}>
                      {draft.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {localize(category.label, language)}
                        </option>
                      ))}
                    </select>
                    <input className="field" value={project.image} onChange={(event) => updateProject(project.id, { image: event.target.value })} />
                    <label
                      className="drop-zone cursor-pointer"
                      onDrop={(event) => handleExistingProjectDrop(project.id, event)}
                      onDragOver={(event) => event.preventDefault()}
                    >
                      {t.uploadProjectImage}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleExistingProjectFileInput(project.id, event)}
                      />
                    </label>
                    <textarea
                      className="field resize-none"
                      rows={3}
                      value={localize(project.description, language)}
                      onChange={(event) => updateProject(project.id, { description: setLocalizedText(project.description, language, event.target.value) })}
                    />
                    <input
                      className="field"
                      value={project.tools.join(', ')}
                      onChange={(event) =>
                        updateProject(project.id, {
                          tools: event.target.value
                            .split(',')
                            .map((tool) => tool.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                    <button type="button" onClick={() => deleteProject(project.id)} className="outline-button border-red-300/30 text-red-100">
                      {t.deleteProject}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-panel">
            <h2 className="admin-title">{t.categoryReorderTitle}</h2>
            <p className="mb-4 text-sm text-slate-400">{t.categoryReorderHint}</p>

            <div className="grid gap-6">
              {draft.categories.map((category) => {
                const categoryProjects = draft.projects.filter((project) => project.category === category.id)

                return (
                  <div key={category.id}>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">{localize(category.label, language)}</h3>

                    {categoryProjects.length === 0 && <p className="text-sm text-slate-600">{t.categoryEmpty}</p>}

                    <div className="grid gap-2">
                      {categoryProjects.map((project, index) => (
                        <div
                          key={project.id}
                          draggable
                          onDragStart={() => {
                            setDraggedCategoryId(category.id)
                            setDraggedProjectId(project.id)
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (draggedCategoryId === category.id && draggedProjectId && draggedProjectId !== project.id) {
                              const targetIndex = categoryProjects.findIndex((p) => p.id === project.id)
                              reorderProjectInCategory(category.id, draggedProjectId, targetIndex)
                            }
                            setDraggedCategoryId(null)
                            setDraggedProjectId(null)
                          }}
                          onDragEnd={() => {
                            setDraggedCategoryId(null)
                            setDraggedProjectId(null)
                          }}
                          className={`flex cursor-grab items-center gap-3 rounded-xl border p-3 transition-colors active:cursor-grabbing ${draggedProjectId === project.id ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-black/30 hover:border-white/30'}`}
                        >
                          <span className="text-xs text-slate-600">{index + 1}</span>
                          <SmartImage src={project.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{localize(project.title, language)}</p>
                            <p className="truncate text-xs text-slate-500">{project.tools.join(', ')}</p>
                          </div>
                          <span className="text-xs text-slate-600">{t.categoryReorderDragHint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
