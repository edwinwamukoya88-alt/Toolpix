export interface Tool {
  slug: string
  name: string
  description: string
  icon: string
  category: string
  badge: string
  comingSoon?: boolean
}

export const tools: Tool[] = [
  // 1. PRODUCTIVITY (HIGHEST PRIORITY)
  { slug: "ai-workspace", name: "AI Assistant", description: "Write, create, and generate with AI-powered tools — humanizer, detector, CBC lesson plans, card designer, and more in one assistant.", icon: "Sparkles", category: "Productivity", badge: "New" },
  { slug: "planner", name: "Task Planner", description: "Organize tasks, reminders, calendars, and productivity workflows in a powerful privacy-first planner.", icon: "CheckSquare", category: "Productivity", badge: "Free" },
  { slug: "pomodoro", name: "Pomodoro Timer", description: "Stay focused with customizable timers", icon: "Timer", category: "Productivity", badge: "Free" },
  { slug: "notes", name: "Notes App", description: "Write and organize notes with local storage", icon: "StickyNote", category: "Productivity", badge: "Free" },
  { slug: "day-planner", name: "Day Planner", description: "Plan your day hour by hour", icon: "Calendar", category: "Productivity", badge: "Free" },
  { slug: "habit-tracker", name: "Habit Tracker", description: "Build daily streaks and track habits", icon: "Target", category: "Productivity", badge: "Free" },
  { slug: "stopwatch", name: "Stopwatch", description: "Track time with lap recording", icon: "Clock", category: "Productivity", badge: "Fast" },
  { slug: "kanban", name: "Kanban Board", description: "Organize tasks with drag-and-drop boards", icon: "Columns3", category: "Productivity", badge: "Free" },

  // 2. EDUCATION & CBC TOOLS (HIGH PRIORITY NICHE)
  { slug: "grade-calculator", name: "CBC Grade Calculator", description: "Calculate scores and competency levels (EE/ME/AE/BE) per KICD", icon: "Percent", category: "Education & CBC Tools", badge: "Free" },
  { slug: "revision-planner", name: "CBC Learning & Revision Planner", description: "Plan skill-based practice, projects, and competency reinforcement with structured curriculum mapping", icon: "CalendarDays", category: "Education & CBC Tools", badge: "Free" },
  { slug: "lesson-plan-generator", name: "CBC Lesson Planner", description: "Generate full KICD-compliant lesson plans with competencies and PCIs", icon: "BookOpen", category: "Education & CBC Tools", badge: "Free" },
  { slug: "exam-generator", name: "CBC Assessment Tool", description: "Generate performance-based assessments — projects, tasks, observations", icon: "FileSpreadsheet", category: "Education & CBC Tools", badge: "Free" },
  { slug: "teacher-comment-generator", name: "CBC Teacher Comment Generator", description: "Generate competency-based feedback aligned to CBC levels", icon: "MessageSquare", category: "Education & CBC Tools", badge: "Free" },
  { slug: "scheme-of-work-generator", name: "CBC Scheme of Work Generator", description: "Create KICD schemes of work with inquiry questions and competencies", icon: "ClipboardList", category: "Education & CBC Tools", badge: "Free" },

  // 3. SECURITY & TEXT TOOLS
  { slug: "password-generator", name: "Password Generator", description: "Generate strong, secure passwords", icon: "Key", category: "Security & Text", badge: "Secure" },
  { slug: "text-cleaner", name: "Text Cleaner", description: "Remove extra spaces and duplicate lines", icon: "Eraser", category: "Security & Text", badge: "Fast" },
  { slug: "base64", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings", icon: "FileCode", category: "Security & Text", badge: "Fast" },
  { slug: "url-encoder", name: "URL Encoder/Decoder", description: "Encode and decode URLs safely", icon: "Link2", category: "Security & Text", badge: "Fast" },
  { slug: "random-generator", name: "Random Generator", description: "Generate random UUIDs, numbers, names", icon: "Shuffle", category: "Security & Text", badge: "Free" },

  // 4. QR & CONNECTIVITY TOOLS
  { slug: "qr-generator", name: "QR Code Generator", description: "Generate QR codes from text or URLs", icon: "QrCode", category: "QR & Connectivity", badge: "Free" },
  { slug: "qr-scanner", name: "QR Scanner", description: "Scan QR codes using your camera", icon: "Scan", category: "QR & Connectivity", badge: "Secure" },
  { slug: "qr-extractor", name: "QR to Link Extractor", description: "Decode QR codes from images", icon: "ImageDown", category: "QR & Connectivity", badge: "Secure" },
  { slug: "url-shortener", name: "URL Shortener", description: "Generate short URLs locally", icon: "Link", category: "QR & Connectivity", badge: "Fast" },

  // 5. FILE CONVERSION TOOLS
  { slug: "pdf-merger", name: "PDF Merger", description: "Combine multiple PDF files into a single document with drag-and-drop reordering", icon: "FileSymlink", category: "File Conversion", badge: "Secure" },
  { slug: "pdf-splitter", name: "PDF Splitter", description: "Extract selected pages or split a PDF into multiple smaller documents", icon: "Scissors", category: "File Conversion", badge: "Secure" },
  { slug: "pdf-rotator", name: "PDF Rotator", description: "Rotate individual pages or entire documents by 90°, 180°, or 270°", icon: "RotateCw", category: "File Conversion", badge: "Secure" },
  { slug: "pdf-compressor", name: "PDF Compressor", description: "Reduce PDF file size while maintaining readable quality with adjustable compression levels", icon: "FileDown", category: "File Conversion", badge: "Secure" },
  { slug: "protect-pdf", name: "Protect PDF", description: "Encrypt PDFs with a password to prevent unauthorized access and restrict printing or copying", icon: "Lock", category: "File Conversion", badge: "Secure" },
  { slug: "unlock-pdf", name: "Unlock PDF", description: "Remove password protection from PDFs that you are authorized to unlock", icon: "Unlock", category: "File Conversion", badge: "Secure" },
  { slug: "sign-pdf", name: "Sign PDF", description: "Digitally sign PDFs using typed text, uploaded signatures, or freehand drawing", icon: "Pen", category: "File Conversion", badge: "Secure" },
  { slug: "pdf-converter", name: "PDF Converter", description: "Convert files to and from PDF format", icon: "File", category: "File Conversion", badge: "Secure" },
  { slug: "image-converter", name: "Image Converter", description: "Convert images between popular formats", icon: "ImagePlus", category: "File Conversion", badge: "Secure" },
  { slug: "document-converter", name: "Document Converter", description: "Convert documents between formats", icon: "FileText", category: "File Conversion", badge: "Secure" },
  { slug: "audio-converter", name: "Audio Converter", description: "Convert audio files between formats", icon: "Music", category: "File Conversion", badge: "Secure" },
  { slug: "file-compressor", name: "File Compressor", description: "Compress and archive files", icon: "FileArchive", category: "File Conversion", badge: "Free" },

  // 6. DEVELOPER TOOLS
  { slug: "json-formatter", name: "JSON Formatter & Validator", description: "Format, validate, and beautify JSON", icon: "Braces", category: "Developer Tools", badge: "Fast" },
  { slug: "regex-tester", name: "Regex Tester", description: "Test regular expressions with live matching", icon: "Regex", category: "Developer Tools", badge: "Free" },
  { slug: "markdown-preview", name: "Markdown Preview", description: "Write markdown and preview in real-time", icon: "FileText", category: "Developer Tools", badge: "Free" },
  { slug: "unit-converter", name: "Unit Converter", description: "Convert length, weight, temperature, and more", icon: "Ruler", category: "Developer Tools", badge: "Free" },

  // 7. DESIGN & CREATIVE TOOLS (LOW PRIORITY)
  { slug: "color-picker", name: "Color Picker Pro", description: "Pick, convert, and copy colors in HEX, RGB, HSL", icon: "Palette", category: "Design & Creative", badge: "Free" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Generate placeholder text for your designs", icon: "TextQuote", category: "Design & Creative", badge: "Free" },
  { slug: "favicon-generator", name: "Favicon Generator", description: "Generate favicons from text or emoji", icon: "Image", category: "Design & Creative", badge: "Free" },
  { slug: "image-placeholder", name: "Image Placeholder", description: "Create custom sized placeholder images", icon: "Frame", category: "Design & Creative", badge: "Free" },
  { slug: "design-cards-studio", name: "Design Cards Studio", description: "Create business cards, wedding invites, event cards, social media posts, and certificates", icon: "CreditCard", category: "Design & Creative", badge: "Free" },

  // 8. ESSENTIAL CALCULATORS
  { slug: "currency-converter", name: "Currency Converter", description: "Convert between world currencies with live rates and conversion history", icon: "DollarSign", category: "Essential Calculators", badge: "Fast" },
  { slug: "loan-calculator", name: "Loan / EMI Calculator", description: "Calculate loan payments, EMI, and full amortization schedule", icon: "Landmark", category: "Essential Calculators", badge: "Free" },
  { slug: "compound-interest", name: "Compound Interest Calculator", description: "See how your money grows with compound interest over time", icon: "TrendingUp", category: "Essential Calculators", badge: "Free" },
  { slug: "mortgage-calculator", name: "Mortgage Calculator", description: "Estimate monthly mortgage payments including taxes and insurance", icon: "Home", category: "Essential Calculators", badge: "Free" },
  { slug: "investment-calculator", name: "Investment Calculator", description: "Project investment growth with regular contributions over time", icon: "BarChart3", category: "Essential Calculators", badge: "Free" },
  { slug: "profit-calculator", name: "Profit Calculator", description: "Analyze profit margins, markup, ROI, and break-even estimates", icon: "TrendingUp", category: "Essential Calculators", badge: "Free" },
  { slug: "income-tax-calculator", name: "Income Tax Calculator", description: "Estimate your tax payable, effective rate, and take-home pay", icon: "Receipt", category: "Essential Calculators", badge: "Free" },
  { slug: "savings-goal-calculator", name: "Savings Goal Calculator", description: "Plan how long it takes to reach your savings target", icon: "Target", category: "Essential Calculators", badge: "Free" },
  { slug: "retirement-calculator", name: "Retirement Calculator", description: "Plan your retirement savings and estimate monthly retirement income", icon: "Heart", category: "Essential Calculators", badge: "Free" },
  { slug: "bmi-calculator", name: "BMI Calculator", description: "Calculate your BMI, WHO category, and healthy weight range", icon: "Weight", category: "Essential Calculators", badge: "Fast" },
  { slug: "blog-generator", name: "Blog Generator", description: "Generate SEO-optimized MDX blog posts instantly from a title", icon: "FileText", category: "Productivity", badge: "Free" },

  // 9. NETWORK MONITORING TOOLS
  { slug: "speed-test", name: "Internet Speed Test", description: "Test download speed, upload speed, ping, and jitter with an animated speed gauge and detailed charts.", icon: "Gauge", category: "Network Monitoring", badge: "Free" },
  { slug: "whats-my-ip", name: "What's My IP", description: "Discover your public IPv4, IPv6, ISP, location, browser info, and more with one click.", icon: "Globe", category: "Network Monitoring", badge: "Free" },
  { slug: "ip-location", name: "IP Location Lookup", description: "Look up any IP address to find its country, city, region, ISP, and interactive map location.", icon: "MapPin", category: "Network Monitoring", badge: "Free" },
  { slug: "ping-test", name: "Ping Test", description: "Ping any domain or IP address to measure latency, packet loss, and network reliability.", icon: "Activity", category: "Network Monitoring", badge: "Free" },
  { slug: "dns-lookup", name: "DNS Lookup", description: "Look up DNS records including A, AAAA, MX, TXT, NS, CNAME, SOA, and PTR records.", icon: "Server", category: "Network Monitoring", badge: "Free" },

  // 10. MULTIMEDIA TOOLS
  { slug: "video-compressor", name: "Video Compressor", description: "Compress MP4, MOV, and WebM videos with quality presets and resolution options.", icon: "Film", category: "Multimedia", badge: "Free" },
  { slug: "video-converter", name: "Video Converter", description: "Convert videos between MP4, MOV, AVI, MKV, and WebM formats.", icon: "Clapperboard", category: "Multimedia", badge: "Free" },
  { slug: "video-trimmer", name: "Video Trimmer", description: "Trim and cut your videos with a timeline and frame preview.", icon: "Scissors", category: "Multimedia", badge: "Free" },
  { slug: "extract-audio", name: "Extract Audio", description: "Extract MP3, WAV, or AAC audio from any video file.", icon: "Music", category: "Multimedia", badge: "Free" },
  { slug: "video-to-gif", name: "Video to GIF", description: "Convert video clips into optimized animated GIFs with custom FPS and size.", icon: "Image", category: "Multimedia", badge: "Free" },
  { slug: "screen-recorder", name: "Screen Recorder", description: "Record your screen, window, or browser tab with optional microphone audio.", icon: "Camera", category: "Multimedia", badge: "Free" },
  { slug: "merge-videos", name: "Merge Videos", description: "Join multiple video files together in your chosen order and export as MP4.", icon: "Layers", category: "Multimedia", badge: "Free" },
  { slug: "video-resizer", name: "Resize & Crop Video", description: "Resize and crop videos to popular aspect ratios like 1080p, 720p, Instagram, TikTok.", icon: "Crop", category: "Multimedia", badge: "Free" },
  { slug: "subtitle-burner", name: "Subtitle Burner", description: "Burn SRT or VTT subtitles permanently into your video with custom styling.", icon: "Subtitles", category: "Multimedia", badge: "Free" },
  { slug: "video-thumbnail-generator", name: "Thumbnail Generator", description: "Capture any frame from a video and export as PNG, JPEG, or WebP.", icon: "ImagePlus", category: "Multimedia", badge: "Free" },
]

export const categories = [
  "AI Assistant",
  "Productivity",
  "Education & CBC Tools",
  "Security & Text",
  "QR & Connectivity",
  "File Conversion",
  "Developer Tools",
  "Design & Creative",
  "Essential Calculators",
  "Network Monitoring",
  "Multimedia",
]

export const categoryIcons: Record<string, string> = {
  "AI Assistant": "Sparkles",
  Productivity: "Zap",
  "Education & CBC Tools": "GraduationCap",
  "Security & Text": "Shield",
  "QR & Connectivity": "QrCode",
  "File Conversion": "FileUp",
  "Developer Tools": "Code",
  "Design & Creative": "Palette",
  "Essential Calculators": "Calculator",
  "Network Monitoring": "Activity",
  Multimedia: "Film",
}
