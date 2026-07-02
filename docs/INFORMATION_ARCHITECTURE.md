# Information Architecture

## Complete Website Hierarchy

```
/                               ─ Home (Landing page with hero, categories, popular tools, blog preview)
├── /about                      ─ About ToolForge (mission, features, CTA)
├── /access-denied              ─ Admin access denied page
├── /advertise                  ─ Advertising & pricing page (3 tiers, submission form)
├── /blog                       ─ Blog listing (search, category filter, featured post)
│   └── /blog/[slug]            ─ Blog article (MDX-rendered with TOC, related content)
├── /contact                    ─ Contact information (support & advertising emails)
├── /help                       ─ Help Center / FAQ (accordion with search)
├── /privacy                    ─ Privacy policy
├── /terms                      ─ Terms of service
├── /tools                      ─ Tools directory (search by name/category)
│   └── /tools/[slug]           ─ Individual tool page (dynamic lazy-loaded component)
├── /sitemap.xml                ─ Dynamic XML sitemap
├── /admin                      ─ Admin dashboard (auth-protected)
│   ├── /admin/ads              ─ Sponsored ads CRUD
│   ├── /admin/ai               ─ AI Content Studio (9 AI tools, simulated)
│   ├── /admin/analytics        ─ Full analytics dashboard (8 tabs)
│   ├── /admin/blog             ─ Blog management (published + drafts)
│   │   ├── /admin/blog/new     ─ New blog post editor
│   │   └── /admin/blog/[id]/edit ─ Edit existing draft
│   ├── /admin/settings         ─ Site-wide settings (homepage, SEO, branding, social, footer)
│   ├── /admin/system           ─ System health checks
│   ├── /admin/tools            ─ Tool management (visibility flags)
│   │   └── /admin/tools/[id]   ─ Tool detail & analytics
│   └── /admin/users            ─ Admin user management (invite, roles, status)
└── /api/*                      ─ API routes (see API documentation)
```

---

## Public Pages

| Route | Type | Purpose | Auth Required |
|-------|------|---------|--------------|
| `/` | Static SSG | Landing page with hero, category grid, popular tools, blog preview, CTAs | No |
| `/about` | Static | About page with mission statement and feature highlights | No |
| `/advertise` | Client | Advertising tiers (Budget $20-40/wk, Standard $40-70/wk, Premium $50-100/wk) with submission form | No |
| `/blog` | SSG + Client | Blog listing with search bar, category filters, featured post | No |
| `/blog/[slug]` | SSG | Blog article with cover image, TOC, share buttons, related content | No |
| `/contact` | Static | Support and advertising email contacts | No |
| `/help` | Client | FAQ accordion with real-time search across 3 categories (General, Tools, Privacy) | No |
| `/privacy` | Static | Privacy policy (no data collection, client-side processing, no tracking) | No |
| `/terms` | Static | Terms of service | No |
| `/tools` | Client | Directory of all 40+ tools with search and category filtering | No |
| `/tools/[slug]` | SSG | Individual tool with dynamic loading, analytics tracking, ads | No |

---

## Admin Pages

| Route | Type | Purpose | Role Required |
|-------|------|---------|---------------|
| `/admin` | Server | Dashboard with stats, quick actions, system health | admin, editor, viewer |
| `/admin/ads` | Client | Sponsored ad management (create, activate/deactivate, delete) | admin |
| `/admin/ai` | Client | AI Content Studio with 9 tools (blog generator, SEO, FAQ, etc.) | admin, editor |
| `/admin/analytics` | Client | Full analytics with 8 tabs (Overview, Traffic, Tools, Content, SEO, Users, Live, Insights) | admin, editor, viewer |
| `/admin/blog` | Client | Blog management with DataTable (published + drafts, search, filters) | admin, editor |
| `/admin/blog/new` | Client | Blog editor for new draft | admin, editor |
| `/admin/blog/[id]/edit` | Client | Blog editor for existing draft | admin, editor |
| `/admin/settings` | Client | Site settings (homepage content, SEO, branding, social links, footer) | admin |
| `/admin/system` | Client | System health dashboard with live checks | admin |
| `/admin/tools` | Client | Tool management with visibility toggles (enabled, featured, popular, new) | admin |
| `/admin/tools/[id]` | Client | Tool detail with analytics and settings | admin |
| `/admin/users` | Client | Admin user management (invite, role management, status, remove) | admin |

---

## API Hierarchy

```
/api/
├── /admin/
│   ├── /users                  ─ Admin user CRUD (GET, POST, PUT, DELETE)
│   ├── /check-auth             ─ Validate admin email, auto-create super admin (POST)
│   ├── /settings               ─ Site settings singleton (GET, PUT)
│   ├── /tools                  ─ Tool config flags (GET, PUT, POST)
│   ├── /dashboard              ─ Dashboard aggregate stats (GET)
│   ├── /blogs                  ─ Published blog list for admin (GET)
│   ├── /blog-drafts            ─ Blog draft collection (GET, POST)
│   │   └── /[id]               ─ Single blog draft (GET, PUT, DELETE)
│   └── /ads                    ─ Sponsored ads collection (GET, POST)
│       └── /[id]               ─ Single sponsored ad (PUT, DELETE)
├── /analytics/
│   ├── /                       ─ GA4 debug/fetch (GET)
│   ├── /realtime               ─ GA4 real-time active users (GET)
│   ├── /ga4                    ─ GA4 parametrized queries (GET)
│   └── /search-console         ─ Google Search Console data (GET)
├── /auth/
│   └── /[...nextauth]          ─ Auth.js handler (GET, POST)
├── /og                         ─ Dynamic OG image generation (GET, Edge)
├── /publish-blog               ─ GitHub blog publisher (POST)
│   └── /debug                  ─ GitHub publisher debug (GET)
└── /test                       ─ Health check (GET)
```

---

## Tool Hierarchy

```
Tools (40+)
├── Productivity (7)
│   ├── Task Planner (planner/todo)
│   ├── Pomodoro Timer
│   ├── Notes App
│   ├── Day Planner
│   ├── Habit Tracker
│   ├── Stopwatch
│   ├── Kanban Board
│   └── Blog Generator
├── Education & CBC Tools (6)
│   ├── CBC Grade Calculator
│   ├── CBC Learning & Revision Planner
│   ├── CBC Lesson Plan Generator
│   ├── Exam/Task Generator
│   ├── Teacher Comment Generator
│   └── Scheme of Work Generator
├── Security & Text (5)
│   ├── Password Generator
│   ├── Text Cleaner
│   ├── Base64 Encoder/Decoder
│   ├── URL Encoder/Decoder
│   └── Random Generator
├── QR & Connectivity (4)
│   ├── QR Code Generator
│   ├── QR Code Scanner
│   ├── QR Code Extractor
│   └── URL Shortener
├── File Conversion (5)
│   ├── PDF Converter
│   ├── Image Converter
│   ├── Document Converter
│   ├── Audio Converter
│   └── File Compressor
├── Developer Tools (4)
│   ├── JSON Formatter
│   ├── Regex Tester
│   ├── Markdown Preview
│   └── Unit Converter
├── Design & Creative (5)
│   ├── Color Picker
│   ├── Lorem Ipsum Generator
│   ├── Favicon Generator
│   ├── Image Placeholder Generator
│   └── Design Cards Studio
└── Finance Tools (4)
    ├── Currency Converter
    ├── Loan Calculator
    ├── Profit Calculator
    └── Expense Tracker
```

---

## Blog Hierarchy

```
Blog
├── Categories (9):
│   ├── Productivity
│   ├── CBC Education
│   ├── Technology
│   ├── Finance
│   ├── Design
│   ├── Business
│   ├── Security
│   ├── File Conversion
│   └── Uncategorized
├── Posts (stored as MDX in content/)
│   ├── Each post has:
│   │   ├── Title, slug, description
│   │   ├── Category, tags, author
│   │   ├── Cover image config
│   │   ├── AI visibility score + badge
│   │   ├── Internal links to tools
│   │   └── Related posts by category
│   └── Example posts:
│       ├── "Are You an Active or Passive Procrastinator?"
│       ├── "Build a Morning Routine That Boosts Productivity"
│       ├── "CBC Competency Assessment Guide"
│       └── 10+ more posts
```

---

## Navigation Structure

### Public Navigation (Header)
```
[Logo]  Home | Tools | Blog | About | Contact | Help
```

### Public Navigation (Footer)
```
Product:  Home | Tools | Blog | About | Contact | Help | Advertising
Legal:    Privacy Policy | Terms of Service
Connect:  Twitter | GitHub | LinkedIn
```

### Admin Navigation (Sidebar)
```
Dashboard | Blog | Tools | Ads | AI Studio | Analytics | Settings | Users | System
```

### Admin Navigation (Dashboard quick actions)
```
New Blog Post | Manage Blog | Manage Tools | Users | AI Studio | Settings | Analytics | System
```

---

## User Journeys

### 1. Casual Visitor → Tool User
1. Land on homepage
2. Browse categories or search for a tool
3. Click tool card → redirected to `/tools/[slug]`
4. Use tool in browser (no login required)
5. Export/download results (if applicable)

### 2. Teacher → Lesson Planning
1. Navigate to `/tools`
2. Click "Lesson Plan Generator" or search
3. Fill in 6-step wizard (Curriculum → Competencies → Activities → Assessment → Preview)
4. Export as PDF or copy to clipboard
5. Save plan to localStorage for later editing

### 3. Visitor → Blog Reader
1. Click "Read Guides" on homepage or navigate to `/blog`
2. Browse/search blog posts by category
3. Click article → read with TOC navigation
4. Explore related tools/articles at bottom
5. Share article via social media buttons

### 4. Admin → Content Publishing
1. Sign in with Google (admin email)
2. Navigate to `/admin/blog`
3. Click "New Article" → Blog Editor
4. Write content, set metadata, configure cover
5. Run SEO validation & auto-fix
6. Publish to GitHub (creates MDX file)
7. View published post at `/blog/[slug]`

### 5. Admin → Analytics Review
1. Navigate to `/admin/analytics`
2. View Overview tab (KPIs, traffic chart, acquisition)
3. Switch to Tools tab for per-tool performance
4. Switch to Content tab for blog analytics
5. Switch to SEO for Search Console data
6. Switch to Live for real-time activity
7. Export reports as CSV/Excel/PDF

---

## Content Hierarchy

### Site Settings (singleton)
```
SiteSettings
├── Homepage: heroTitle, heroSubtitle, CTA labels, CTA links
├── SEO: defaultTitle, defaultDescription, keywords, ogImage
├── Branding: logo, favicon
├── Social: twitterUrl, githubUrl, linkedinUrl
└── Footer: footerText
```

### Tool Config (per-tool)
```
ToolConfig
├── Basic: slug, enabled
├── Flags: featured, popular, new
└── Timestamps: createdAt, updatedAt
```

### Blog Post (MDX frontmatter + content)
```
BlogPost
├── Frontmatter: title, slug, description, date, category, tags, author
├── AI Layer: visibilityScore, aiBadge, internalLinks
├── Cover: gradient, icon, pattern, textColor
└── Content: MDX body with headings, lists, code, images
```

### Sponsored Ad
```
SponsoredAd
├── Content: title, description, image
├── Targeting: slot (hero/mid/footer), link
├── Status: active
└── Metrics: clicks, impressions
```
