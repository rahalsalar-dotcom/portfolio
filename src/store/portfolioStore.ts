import { create } from 'zustand'
import { defaultContent } from '../data/defaultContent'
import { emptyLocalizedText, isLanguage } from '../i18n'
import { saveLocalImage, saveLocalImageBlob } from '../lib/localImages'
import { firebaseEnabled } from '../lib/runtimeConfig'
import type { Category, GalleryRow, Language, LocalizedText, Project, SiteContent, Skill, SocialLink, Stat } from '../types'

const STORAGE_KEY = 'nova-portfolio-content'
const LANGUAGE_KEY = 'nova-portfolio-language'

type PortfolioState = {
  content: SiteContent
  language: Language
  initialized: boolean
  setLanguage: (language: Language) => void
  loadContent: () => Promise<void>
  saveContent: (content: SiteContent) => Promise<void>
  uploadImage: (file: File) => Promise<string>
}

function readLanguage(): Language {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY)
  return isLanguage(savedLanguage) ? savedLanguage : 'en'
}

function readLocalContent(): SiteContent | null {
  const rawContent = window.localStorage.getItem(STORAGE_KEY)

  if (!rawContent) {
    return null
  }

  try {
    return normalizeContent(JSON.parse(rawContent))
  } catch (error) {
    console.warn('Saved local portfolio content is invalid.', error)
    return null
  }
}

function saveLocalContent(content: SiteContent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  } catch (error) {
    console.warn('Local content save failed. Images may be too large for localStorage.', error)
    throw error
  }
}

function isEmbeddedImage(src: string): boolean {
  return src.startsWith('data:image/')
}

async function persistEmbeddedImage(src: string, name: string): Promise<string> {
  if (!isEmbeddedImage(src)) {
    return src
  }

  const response = await fetch(src)
  const blob = await response.blob()
  return await saveLocalImageBlob(blob, name)
}

async function persistEmbeddedImages(content: SiteContent): Promise<SiteContent> {
  const profileImage = await persistEmbeddedImage(content.profileImage, 'profile-image')
  const projects = await Promise.all(
    content.projects.map(async (project) => ({
      ...project,
      image: await persistEmbeddedImage(project.image, `${project.id}-image`),
    })),
  )

  if (profileImage === content.profileImage && projects.every((project, index) => project.image === content.projects[index].image)) {
    return content
  }

  return { ...content, profileImage, projects }
}

async function loadRemoteContentIfConfigured(): Promise<SiteContent | null> {
  if (!firebaseEnabled) {
    return null
  }

  const { loadRemoteContent } = await import('../lib/firebase')
  const content = await loadRemoteContent()
  return content ? normalizeContent(content) : null
}

async function saveRemoteContentIfConfigured(content: SiteContent): Promise<void> {
  if (!firebaseEnabled) {
    return
  }

  const { saveRemoteContent } = await import('../lib/firebase')
  await saveRemoteContent(content)
}

async function uploadRemoteImageIfConfigured(file: File): Promise<string | null> {
  if (!firebaseEnabled) {
    return null
  }

  const { uploadRemoteImage } = await import('../lib/firebase')
  return await uploadRemoteImage(file)
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function toString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function toStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback
  }

  const values = value.filter((item): item is string => typeof item === 'string')
  return values.length ? values : fallback
}

function toLocalizedText(value: unknown, fallback: LocalizedText): LocalizedText {
  if (typeof value === 'string') {
    return emptyLocalizedText(value)
  }

  const record = toRecord(value)

  return {
    en: toString(record.en, fallback.en),
    ar: toString(record.ar, fallback.ar),
    ku: toString(record.ku, fallback.ku),
  }
}

function slugify(value: string): string {
  const lowerValue = value.trim().toLowerCase()
  const knownCategories: Record<string, string> = {
    photoshop: 'photoshop',
    blender: 'blender',
    '3d art': '3d-art',
    thumbnails: 'thumbnails',
    logos: 'logos',
  }

  return knownCategories[lowerValue] ?? lowerValue.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function normalizeCategories(value: unknown): Category[] {
  if (!Array.isArray(value)) {
    return defaultContent.categories
  }

  const categories = value
    .map((item, index): Category | null => {
      if (typeof item === 'string') {
        return { id: slugify(item), label: emptyLocalizedText(item) }
      }

      const record = toRecord(item)
      const fallback = defaultContent.categories[index] ?? defaultContent.categories[0]
      const label = toLocalizedText(record.label, fallback.label)
      const id = toString(record.id, slugify(label.en))

      return id ? { id, label } : null
    })
    .filter((category): category is Category => Boolean(category))

  return categories.length ? categories : defaultContent.categories
}

function normalizeStats(value: unknown): Stat[] {
  if (!Array.isArray(value)) {
    return defaultContent.stats
  }

  const stats = value.map((item, index): Stat => {
    const record = toRecord(item)
    const fallback = defaultContent.stats[index] ?? defaultContent.stats[0]

    return {
      label: toLocalizedText(record.label, fallback.label),
      value: toNumber(record.value, fallback.value),
      suffix: toString(record.suffix, fallback.suffix),
    }
  })

  return stats.length ? stats : defaultContent.stats
}

function normalizeSkills(value: unknown): Skill[] {
  if (!Array.isArray(value)) {
    return defaultContent.skills
  }

  const skills = value.map((item, index): Skill => {
    const record = toRecord(item)
    const fallback = defaultContent.skills[index] ?? defaultContent.skills[0]

    return {
      name: toLocalizedText(record.name, fallback.name),
      detail: toLocalizedText(record.detail, fallback.detail),
      level: toNumber(record.level, fallback.level),
    }
  })

  return skills.length ? skills : defaultContent.skills
}

function normalizeProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    return defaultContent.projects
  }

  const projects = value.map((item, index): Project => {
    const record = toRecord(item)
    const fallback = defaultContent.projects[index] ?? defaultContent.projects[0]
    const legacyCategory = toString(record.category, fallback.category)

    return {
      id: toString(record.id, fallback.id),
      title: toLocalizedText(record.title, fallback.title),
      category: legacyCategory.includes(' ') || /^[A-Z]/.test(legacyCategory) ? slugify(legacyCategory) : legacyCategory,
      description: toLocalizedText(record.description, fallback.description),
      image: toString(record.image, fallback.image),
      tools: toStringArray(record.tools, fallback.tools),
    }
  })

  return projects.length ? projects : defaultContent.projects
}

function normalizeSocials(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) {
    return defaultContent.socials
  }

  const socials = value.map((item, index): SocialLink => {
    const record = toRecord(item)
    const fallback = defaultContent.socials[index] ?? defaultContent.socials[0]

    return {
      id: toString(record.id, fallback.id),
      label: toLocalizedText(record.label, fallback.label),
      handle: toString(record.handle, fallback.handle),
      url: toString(record.url, fallback.url),
      icon: toString(record.icon, fallback.icon),
    }
  })

  return socials.length ? socials : defaultContent.socials
}

function normalizeGalleryLayout(value: unknown): GalleryRow[] {
  if (!Array.isArray(value)) {
    return []
  }

  const rows = value
    .map((item): GalleryRow | null => {
      const record = toRecord(item)

      if (!record.id) {
        return null
      }

      const projectIds = Array.isArray(record.projectIds) ? record.projectIds.filter((pid): pid is string => typeof pid === 'string') : []

      return { id: String(record.id), projectIds }
    })
    .filter((row): row is GalleryRow => Boolean(row))

  return rows
}

function normalizeContent(value: unknown): SiteContent {
  const record = toRecord(value)
  const contact = toRecord(record.contact)

  return {
    designerName: toLocalizedText(record.designerName, defaultContent.designerName),
    role: toLocalizedText(record.role, defaultContent.role),
    intro: toLocalizedText(record.intro, defaultContent.intro),
    profileImage: toString(record.profileImage, defaultContent.profileImage),
    aboutTitle: toLocalizedText(record.aboutTitle, defaultContent.aboutTitle),
    aboutText: toLocalizedText(record.aboutText, defaultContent.aboutText),
    categories: normalizeCategories(record.categories),
    stats: normalizeStats(record.stats),
    skills: normalizeSkills(record.skills),
    projects: normalizeProjects(record.projects),
    galleryLayout: normalizeGalleryLayout(record.galleryLayout),
    socials: normalizeSocials(record.socials),
    contact: {
      email: toString(contact.email, defaultContent.contact.email),
      whatsapp: toString(contact.whatsapp, defaultContent.contact.whatsapp),
      discord: toString(contact.discord, defaultContent.contact.discord),
    },
  }
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  content: defaultContent,
  language: readLanguage(),
  initialized: false,
  setLanguage: (language) => {
    window.localStorage.setItem(LANGUAGE_KEY, language)
    set({ language })
  },
  loadContent: async () => {
    if (get().initialized) {
      return
    }

    const localContent = readLocalContent()
    const remoteContent = await loadRemoteContentIfConfigured()
    const loadedContent = remoteContent ?? localContent ?? defaultContent
    const migratedContent = await persistEmbeddedImages(loadedContent)

    if (migratedContent !== loadedContent) {
      saveLocalContent(migratedContent)
      await saveRemoteContentIfConfigured(migratedContent)
    }

    set({
      content: migratedContent,
      initialized: true,
    })
  },
  saveContent: async (content) => {
    const persistentContent = await persistEmbeddedImages(content)
    set({ content: persistentContent })
    saveLocalContent(persistentContent)
    await saveRemoteContentIfConfigured(persistentContent)
  },
  uploadImage: async (file) => {
    const remoteUrl = await uploadRemoteImageIfConfigured(file)
    return remoteUrl ?? (await saveLocalImage(file))
  },
}))
