import type { CardType } from "./cardTypes"

export interface DesignSettings {
  bgStyle: "solid" | "gradient"
  bgColor: string
  gradientStart: string
  gradientEnd: string
  textColor: string
  accentColor: string
  fontFamily: string
  fontWeight: string
  letterSpacing: string
  textAlign: "left" | "center" | "right"
  borderRadius: "none" | "small" | "medium" | "premium"
  borderStyle: "none" | "thin" | "double" | "luxury"
  shadowLevel: "none" | "light" | "medium" | "deep"
  paperTexture: boolean
  spacing: "compact" | "normal" | "spacious"
  iconStyle: string
  logoPosition: "none" | "top-left" | "center"
  showWatermark: boolean
  industry: string
}

export interface Template {
  id: string
  name: string
  description: string
  design: Partial<DesignSettings>
}

export const defaultDesign: DesignSettings = {
  bgStyle: "solid",
  bgColor: "#ffffff",
  gradientStart: "#3b82f6",
  gradientEnd: "#8b5cf6",
  textColor: "#1e293b",
  accentColor: "#3b82f6",
  fontFamily: "sans",
  fontWeight: "normal",
  letterSpacing: "normal",
  textAlign: "center",
  borderRadius: "small",
  borderStyle: "none",
  shadowLevel: "medium",
  paperTexture: false,
  spacing: "normal",
  iconStyle: "none",
  logoPosition: "none",
  showWatermark: false,
  industry: "corporate",
}

export const businessTemplates: Template[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean typography with generous whitespace",
    design: { bgStyle: "solid", bgColor: "#ffffff", textColor: "#0f172a", accentColor: "#3b82f6", fontFamily: "sans", fontWeight: "normal", letterSpacing: "normal", textAlign: "left", borderRadius: "small", borderStyle: "none", shadowLevel: "medium", paperTexture: false, spacing: "spacious", iconStyle: "none", logoPosition: "top-left", industry: "tech" },
  },
  {
    id: "corporate-pro",
    name: "Corporate Pro",
    description: "Structured grid with blue gradients",
    design: { bgStyle: "gradient", gradientStart: "#1e3a5f", gradientEnd: "#0f172a", textColor: "#f1f5f9", accentColor: "#60a5fa", fontFamily: "sans", fontWeight: "medium", letterSpacing: "normal", textAlign: "left", borderRadius: "small", borderStyle: "thin", shadowLevel: "medium", paperTexture: false, spacing: "normal", iconStyle: "diamond", logoPosition: "top-left", industry: "corporate" },
  },
  {
    id: "luxury-black",
    name: "Luxury Black",
    description: "Dark background with gold accents",
    design: { bgStyle: "solid", bgColor: "#09090b", textColor: "#fafafa", accentColor: "#d97706", fontFamily: "serif", fontWeight: "normal", letterSpacing: "wide", textAlign: "center", borderRadius: "premium", borderStyle: "luxury", shadowLevel: "deep", paperTexture: true, spacing: "spacious", iconStyle: "crown", logoPosition: "center", industry: "corporate" },
  },
  {
    id: "creative-gradient",
    name: "Creative Gradient",
    description: "Modern color blends for creative pros",
    design: { bgStyle: "gradient", gradientStart: "#6366f1", gradientEnd: "#ec4899", textColor: "#ffffff", accentColor: "#facc15", fontFamily: "sans", fontWeight: "bold", letterSpacing: "tight", textAlign: "center", borderRadius: "medium", borderStyle: "none", shadowLevel: "medium", paperTexture: false, spacing: "normal", iconStyle: "bolt", logoPosition: "center", industry: "creative" },
  },
]

export const weddingTemplates: Template[] = [
  {
    id: "elegant-gold",
    name: "Elegant Gold Floral",
    description: "Warm ivory with gold accents",
    design: { bgStyle: "solid", bgColor: "#fefce8", textColor: "#713f12", accentColor: "#d97706", fontFamily: "serif", fontWeight: "normal", letterSpacing: "wide", textAlign: "center", borderRadius: "premium", borderStyle: "luxury", shadowLevel: "medium", paperTexture: true, spacing: "spacious", iconStyle: "heart", logoPosition: "center", industry: "wedding" },
  },
  {
    id: "minimal-white",
    name: "Minimal White Luxury",
    description: "Clean white with subtle elegance",
    design: { bgStyle: "solid", bgColor: "#ffffff", textColor: "#292524", accentColor: "#a8a29e", fontFamily: "serif", fontWeight: "light", letterSpacing: "wider", textAlign: "center", borderRadius: "medium", borderStyle: "thin", shadowLevel: "light", paperTexture: true, spacing: "spacious", iconStyle: "heart", logoPosition: "none", industry: "wedding" },
  },
  {
    id: "romantic-pastel",
    name: "Romantic Pastel",
    description: "Soft pink gradient tones",
    design: { bgStyle: "gradient", gradientStart: "#fce7f3", gradientEnd: "#fbcfe8", textColor: "#831843", accentColor: "#be185d", fontFamily: "serif", fontWeight: "normal", letterSpacing: "normal", textAlign: "center", borderRadius: "premium", borderStyle: "none", shadowLevel: "medium", paperTexture: false, spacing: "normal", iconStyle: "heart", logoPosition: "center", industry: "wedding" },
  },
]

export const eventTemplates: Template[] = [
  {
    id: "neon-party",
    name: "Neon Party",
    description: "Vibrant neon gradient for night events",
    design: { bgStyle: "gradient", gradientStart: "#831843", gradientEnd: "#1e1b4b", textColor: "#ffffff", accentColor: "#facc15", fontFamily: "sans", fontWeight: "bold", letterSpacing: "tight", textAlign: "center", borderRadius: "small", borderStyle: "none", shadowLevel: "deep", paperTexture: false, spacing: "normal", iconStyle: "bolt", logoPosition: "center", industry: "creative" },
  },
  {
    id: "corporate-clean",
    name: "Corporate Clean",
    description: "Professional white event layout",
    design: { bgStyle: "solid", bgColor: "#ffffff", textColor: "#0f172a", accentColor: "#2563eb", fontFamily: "sans", fontWeight: "medium", letterSpacing: "normal", textAlign: "center", borderRadius: "small", borderStyle: "thin", shadowLevel: "light", paperTexture: false, spacing: "normal", iconStyle: "none", logoPosition: "top-left", industry: "corporate" },
  },
  {
    id: "festival-colorful",
    name: "Festival Colorful",
    description: "Vibrant multi-color gradient",
    design: { bgStyle: "gradient", gradientStart: "#f97316", gradientEnd: "#ec4899", textColor: "#ffffff", accentColor: "#ffffff", fontFamily: "sans", fontWeight: "bold", letterSpacing: "normal", textAlign: "center", borderRadius: "medium", borderStyle: "none", shadowLevel: "medium", paperTexture: false, spacing: "spacious", iconStyle: "star", logoPosition: "center", industry: "creative" },
  },
]

export const socialTemplates: Template[] = [
  {
    id: "bold-announcement",
    name: "Bold Announcement",
    description: "Dark dramatic social card",
    design: { bgStyle: "solid", bgColor: "#0f172a", textColor: "#f8fafc", accentColor: "#3b82f6", fontFamily: "sans", fontWeight: "bold", letterSpacing: "tight", textAlign: "center", borderRadius: "medium", borderStyle: "none", shadowLevel: "medium", paperTexture: false, spacing: "normal", iconStyle: "star", logoPosition: "center", industry: "tech" },
  },
  {
    id: "bright-celebration",
    name: "Bright Celebration",
    description: "Vibrant blue-purple gradient",
    design: { bgStyle: "gradient", gradientStart: "#3b82f6", gradientEnd: "#8b5cf6", textColor: "#ffffff", accentColor: "#facc15", fontFamily: "sans", fontWeight: "bold", letterSpacing: "normal", textAlign: "center", borderRadius: "medium", borderStyle: "none", shadowLevel: "medium", paperTexture: false, spacing: "spacious", iconStyle: "star", logoPosition: "center", industry: "tech" },
  },
  {
    id: "minimal-social",
    name: "Minimal Social",
    description: "Clean white with indigo accent",
    design: { bgStyle: "solid", bgColor: "#ffffff", textColor: "#1e293b", accentColor: "#6366f1", fontFamily: "sans", fontWeight: "normal", letterSpacing: "normal", textAlign: "left", borderRadius: "small", borderStyle: "thin", shadowLevel: "light", paperTexture: false, spacing: "compact", iconStyle: "none", logoPosition: "top-left", industry: "tech" },
  },
]

export const certificateTemplates: Template[] = [
  {
    id: "formal-gold",
    name: "Formal Gold Seal",
    description: "Classic certificate with gold trim",
    design: { bgStyle: "solid", bgColor: "#fef3c7", textColor: "#451a03", accentColor: "#b45309", fontFamily: "serif", fontWeight: "normal", letterSpacing: "wide", textAlign: "center", borderRadius: "premium", borderStyle: "luxury", shadowLevel: "medium", paperTexture: true, spacing: "spacious", iconStyle: "crown", logoPosition: "center", industry: "education" },
  },
  {
    id: "academic-blue",
    name: "Academic Blue",
    description: "Blue-accented academic certificate",
    design: { bgStyle: "solid", bgColor: "#eff6ff", textColor: "#1e3a5f", accentColor: "#2563eb", fontFamily: "serif", fontWeight: "medium", letterSpacing: "normal", textAlign: "center", borderRadius: "small", borderStyle: "double", shadowLevel: "medium", paperTexture: true, spacing: "spacious", iconStyle: "star", logoPosition: "center", industry: "education" },
  },
  {
    id: "modern-clean",
    name: "Modern Clean Award",
    description: "Dark modern award design",
    design: { bgStyle: "gradient", gradientStart: "#1e293b", gradientEnd: "#334155", textColor: "#f1f5f9", accentColor: "#facc15", fontFamily: "sans", fontWeight: "bold", letterSpacing: "normal", textAlign: "center", borderRadius: "medium", borderStyle: "none", shadowLevel: "medium", paperTexture: false, spacing: "normal", iconStyle: "crown", logoPosition: "center", industry: "tech" },
  },
]

export const templatesByType: Record<CardType, Template[]> = {
  business: businessTemplates,
  wedding: weddingTemplates,
  event: eventTemplates,
  social: socialTemplates,
  certificate: certificateTemplates,
}

export const fontOptions = [
  { value: "sans", label: "Inter", description: "Modern default" },
  { value: "serif", label: "Playfair Display", description: "Luxury / Wedding" },
  { value: "montserrat", label: "Montserrat", description: "Corporate" },
  { value: "poppins", label: "Poppins", description: "Friendly SaaS" },
]

export const fontWeightOptions = [
  { value: "light", label: "Light" },
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "bold", label: "Bold" },
]

export const letterSpacingOptions = [
  { value: "tight", label: "Tight" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "wider", label: "Wider" },
]

export const borderRadiusOptions = [
  { value: "none", label: "None" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "premium", label: "Premium Rounded" },
]

export const borderStyleOptions = [
  { value: "none", label: "None" },
  { value: "thin", label: "Thin" },
  { value: "double", label: "Double" },
  { value: "luxury", label: "Luxury Gold" },
]

export const shadowOptions = [
  { value: "none", label: "None" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "deep", label: "Deep" },
]

export const spacingOptions = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "spacious", label: "Spacious" },
]

export const alignOptions = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
]

export const logoPositionOptions = [
  { value: "none", label: "Hidden" },
  { value: "top-left", label: "Top Left" },
  { value: "center", label: "Center" },
]

export const bgStyleOptions = [
  { value: "solid", label: "Solid Color" },
  { value: "gradient", label: "Gradient" },
]
