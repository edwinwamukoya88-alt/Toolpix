export type CardType = "business" | "wedding" | "event" | "social" | "certificate"

export interface BusinessFormData {
  name: string
  jobTitle: string
  company: string
  email: string
  phone: string
  website: string
  address: string
}

export interface WeddingFormData {
  coupleNames: string
  weddingDate: string
  venue: string
  message: string
  rsvpContact: string
}

export interface EventFormData {
  eventName: string
  dateTime: string
  location: string
  description: string
}

export interface SocialFormData {
  title: string
  message: string
  ctaText: string
}

export interface CertificateFormData {
  recipientName: string
  achievementTitle: string
  issuerName: string
  date: string
}

export type FormData = BusinessFormData | WeddingFormData | EventFormData | SocialFormData | CertificateFormData

export interface FieldConfig {
  name: string
  label: string
  placeholder: string
  type: "text" | "textarea" | "date" | "tel" | "email"
}

export interface CardTypeConfig {
  type: CardType
  label: string
  icon: string
  description: string
  aspectRatio: string
  previewWidth: number
  previewHeight: number
  fields: FieldConfig[]
  defaultData: FormData
  smartLayout: {
    nameSize: string
    titleSize: string
    detailSize: string
    spacing: string
  }
}

export const defaultBusinessData: BusinessFormData = {
  name: "John Doe",
  jobTitle: "Product Designer",
  company: "Acme Inc.",
  email: "john@acme.com",
  phone: "+1 555-0123",
  website: "acme.com",
  address: "",
}

export const defaultWeddingData: WeddingFormData = {
  coupleNames: "Sarah & Michael",
  weddingDate: "2026-09-15",
  venue: "The Grand Garden Estate",
  message: "Together with their families, we invite you to celebrate our wedding day.",
  rsvpContact: "sarah@email.com",
}

export const defaultEventData: EventFormData = {
  eventName: "Summer Launch Party",
  dateTime: "2026-07-20 19:00",
  location: "Skyline Rooftop, Downtown",
  description: "Join us for an unforgettable evening of music, networking, and celebration.",
}

export const defaultSocialData: SocialFormData = {
  title: "Big News!",
  message: "We are thrilled to announce the launch of our new product. Thank you to everyone who made this possible.",
  ctaText: "Learn More",
}

export const defaultCertificateData: CertificateFormData = {
  recipientName: "Jane Smith",
  achievementTitle: "Outstanding Achievement in Web Development",
  issuerName: "Tech Academy",
  date: "2026-06-22",
}

export const cardTypeConfigs: Record<CardType, CardTypeConfig> = {
  business: {
    type: "business", label: "Business Card", icon: "Briefcase", description: "Professional business card with contact details",
    aspectRatio: "1.586", previewWidth: 540, previewHeight: 340,
    fields: [
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text" },
      { name: "jobTitle", label: "Job Title", placeholder: "Product Designer", type: "text" },
      { name: "company", label: "Company Name", placeholder: "Acme Inc.", type: "text" },
      { name: "email", label: "Email", placeholder: "john@acme.com", type: "email" },
      { name: "phone", label: "Phone", placeholder: "+1 555-0123", type: "tel" },
      { name: "website", label: "Website", placeholder: "acme.com", type: "text" },
      { name: "address", label: "Address (optional)", placeholder: "123 Main St", type: "text" },
    ],
    defaultData: defaultBusinessData,
    smartLayout: { nameSize: "text-xl", titleSize: "text-sm", detailSize: "text-xs", spacing: "gap-1" },
  },
  wedding: {
    type: "wedding", label: "Wedding Invitation", icon: "Heart", description: "Elegant wedding invitation card",
    aspectRatio: "0.667", previewWidth: 400, previewHeight: 600,
    fields: [
      { name: "coupleNames", label: "Couple Names", placeholder: "Sarah & Michael", type: "text" },
      { name: "weddingDate", label: "Wedding Date", placeholder: "2026-09-15", type: "date" },
      { name: "venue", label: "Venue", placeholder: "The Grand Garden Estate", type: "text" },
      { name: "message", label: "Invitation Message", placeholder: "Together with their families...", type: "textarea" },
      { name: "rsvpContact", label: "RSVP Contact", placeholder: "sarah@email.com", type: "text" },
    ],
    defaultData: defaultWeddingData,
    smartLayout: { nameSize: "text-2xl", titleSize: "text-base", detailSize: "text-sm", spacing: "gap-2" },
  },
  event: {
    type: "event", label: "Event Card", icon: "Calendar", description: "Eye-catching event announcement",
    aspectRatio: "0.707", previewWidth: 440, previewHeight: 620,
    fields: [
      { name: "eventName", label: "Event Name", placeholder: "Summer Launch Party", type: "text" },
      { name: "dateTime", label: "Date & Time", placeholder: "2026-07-20 19:00", type: "text" },
      { name: "location", label: "Location", placeholder: "Skyline Rooftop", type: "text" },
      { name: "description", label: "Description", placeholder: "Join us for...", type: "textarea" },
    ],
    defaultData: defaultEventData,
    smartLayout: { nameSize: "text-2xl", titleSize: "text-sm", detailSize: "text-xs", spacing: "gap-1.5" },
  },
  social: {
    type: "social", label: "Social Media Card", icon: "Share2", description: "Shareable social media announcement",
    aspectRatio: "1", previewWidth: 500, previewHeight: 500,
    fields: [
      { name: "title", label: "Headline", placeholder: "Big News!", type: "text" },
      { name: "message", label: "Message", placeholder: "We are thrilled to announce...", type: "textarea" },
      { name: "ctaText", label: "Call to Action", placeholder: "Learn More", type: "text" },
    ],
    defaultData: defaultSocialData,
    smartLayout: { nameSize: "text-3xl", titleSize: "text-base", detailSize: "text-sm", spacing: "gap-2" },
  },
  certificate: {
    type: "certificate", label: "Certificate", icon: "Award", description: "Professional achievement certificate",
    aspectRatio: "1.414", previewWidth: 540, previewHeight: 380,
    fields: [
      { name: "recipientName", label: "Recipient Name", placeholder: "Jane Smith", type: "text" },
      { name: "achievementTitle", label: "Achievement Title", placeholder: "Outstanding Achievement", type: "text" },
      { name: "issuerName", label: "Issuer Name", placeholder: "Tech Academy", type: "text" },
      { name: "date", label: "Date", placeholder: "2026-06-22", type: "date" },
    ],
    defaultData: defaultCertificateData,
    smartLayout: { nameSize: "text-2xl", titleSize: "text-sm", detailSize: "text-xs", spacing: "gap-1" },
  },
}

export const cardTypeOptions: { value: CardType; label: string; icon: string }[] = [
  { value: "business", label: "Business Card", icon: "💼" },
  { value: "wedding", label: "Wedding Invitation", icon: "💍" },
  { value: "event", label: "Event Card", icon: "📅" },
  { value: "social", label: "Social Media Card", icon: "📱" },
  { value: "certificate", label: "Certificate", icon: "🏆" },
]

export const initialFormData: Record<CardType, FormData> = {
  business: { ...defaultBusinessData },
  wedding: { ...defaultWeddingData },
  event: { ...defaultEventData },
  social: { ...defaultSocialData },
  certificate: { ...defaultCertificateData },
}

export const industryOptions = [
  { value: "tech", label: "Tech", icon: "💻" },
  { value: "corporate", label: "Corporate", icon: "🏢" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "wedding", label: "Wedding", icon: "💍" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "finance", label: "Finance", icon: "💰" },
]

export const iconOptions = [
  { value: "none", label: "None", icon: "—" },
  { value: "star", label: "Star", icon: "★" },
  { value: "diamond", label: "Diamond", icon: "◆" },
  { value: "crown", label: "Crown", icon: "♛" },
  { value: "heart", label: "Heart", icon: "♥" },
  { value: "leaf", label: "Leaf", icon: "☘" },
  { value: "bolt", label: "Bolt", icon: "⚡" },
]
