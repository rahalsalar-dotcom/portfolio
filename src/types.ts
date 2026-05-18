export type Language = 'en' | 'ar' | 'ku'

export type LocalizedText = Record<Language, string>

export type Category = {
  id: string
  label: LocalizedText
}

export type Stat = {
  label: LocalizedText
  value: number
  suffix: string
}

export type Skill = {
  name: LocalizedText
  detail: LocalizedText
  level: number
}

export type Project = {
  id: string
  title: LocalizedText
  category: string
  description: LocalizedText
  image: string
  tools: string[]
}

export type SocialLink = {
  id: string
  label: LocalizedText
  handle: string
  url: string
  icon: string
}

export type ContactInfo = {
  email: string
  whatsapp: string
  discord: string
}

export type GalleryRow = {
  id: string
  projectIds: string[]
}

export type SiteContent = {
  designerName: LocalizedText
  role: LocalizedText
  intro: LocalizedText
  profileImage: string
  aboutTitle: LocalizedText
  aboutText: LocalizedText
  categories: Category[]
  stats: Stat[]
  skills: Skill[]
  projects: Project[]
  galleryLayout: GalleryRow[]
  socials: SocialLink[]
  contact: ContactInfo
}
