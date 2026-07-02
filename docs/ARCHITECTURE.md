# ToolForge Architecture

## Executive Summary

ToolForge (project name: `toolpix`) is a privacy-first, client-side web application that provides 40+ free online tools for teachers, students, creators, developers, and businesses. Built with Next.js 16 (App Router) and React 19, it uses SQLite via Prisma ORM for data persistence, Auth.js v5 for Google OAuth authentication, and Tailwind CSS v4 for styling. The application is deployed on Vercel.

**Key principles:**
- Privacy-first: All tool processing happens client-side; no data leaves the user's device
- No login required for public tools; authentication only for admin panel
- Multi-source analytics: GA4 + Google Search Console + first-party IndexedDB tracking
- Blog content stored as MDX files with Prisma-backed draft management
- Tool visibility/feature flags managed via database with static fallback

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        A[Next.js App Router]
        B[React 19 Components]
        C[Client-side Tools]
        D[Zustand Stores]
        E[IndexedDB / localStorage]
    end

    subgraph "Vercel Edge"
        F[Next.js API Routes]
        G[OG Image Generation]
        F2[Auth.js Callbacks]
    end

    subgraph "Google APIs"
        H[GA4 Analytics]
        I[Search Console]
        J[Google OAuth]
    end

    subgraph "Database"
        K[SQLite / Prisma]
    end

    subgraph "GitHub"
        L[Blog MDX Repository]
    end

    A --> B
    B --> C
    B --> D
    C --> E
    A --> F
    F --> K
    F --> H
    F --> I
    A --> F2
    F2 --> J
    A --> G
    F --> L
```

---

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.2.9 |
| **UI Library** | React | 19.2.4 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | SQLite (via Prisma) | Prisma 7.8.0 + better-sqlite3 12.11.1 |
| **Auth** | Auth.js (NextAuth) | 5.0.0-beta.31 |
| **State Management** | Zustand | 5.0.14 |
| **Animation** | Framer Motion | 12.42.0 |
| **Icons** | Lucide React | 1.18.0 |
| **Charts** | Recharts | 3.8.1 |
| **Markdown** | react-markdown + remark-gfm | 10.1.0 |
| **PDF** | jsPDF + jspdf-autotable | 4.2.1 |
| **Notifications** | Sonner | 2.0.7 |
| **Deployment** | Vercel | - |
| **Linting** | ESLint 9 + eslint-config-next | 16.2.9 |
| **Package Manager** | npm | - |

---

## Folder Organization

```
smart tools kit/
├── prisma/              # Database schema, migrations, seed
├── public/              # Static assets
├── content/             # Blog MDX files
├── src/
│   ├── app/             # Next.js App Router pages & API routes
│   │   ├── admin/       # Admin panel pages
│   │   ├── api/         # API route handlers
│   │   ├── blog/        # Public blog pages
│   │   ├── tools/       # Tool listing & dynamic tool pages
│   │   └── ...          # Static pages (about, contact, privacy, etc.)
│   ├── components/      # React components
│   │   ├── ui/          # shadcn-style primitives
│   │   ├── admin/       # Admin dashboard components
│   │   ├── ads/         # Ad display components
│   │   ├── blog/        # Blog UI components
│   │   ├── planner/     # Lesson planner wizard components
│   │   ├── pomodoro/    # Pomodoro timer analytics components
│   │   └── zenith/      # Zenith focus mode components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries & business logic
│   └── tools/           # Individual tool components (40+)
│       └── todo/        # Task planner subsystem (Zustand)
├── docs/                # Architecture documentation
├── next.config.js       # Next.js configuration
├── eslint.config.mjs    # ESLint configuration
├── prisma.config.ts     # Prisma configuration
└── components.json      # shadcn/ui configuration
```

---

## Application Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        P1["app/ (Pages & Routes)"]
        P2["components/ (UI Components)"]
    end

    subgraph "State & Context Layer"
        S1["contexts/ (React Context)"]
        S2["hooks/ (Custom Hooks)"]
        S3["tools/todo/store.ts (Zustand)"]
    end

    subgraph "Business Logic Layer"
        B1["lib/ (Utilities & Services)"]
        B2["auth.ts (Authentication)"]
    end

    subgraph "Data Access Layer"
        D1["lib/db.ts (Prisma Client)"]
        D2["lib/blog.ts (Filesystem MDX)"]
        D3["lib/settings.ts (API + localStorage)"]
    end

    subgraph "Data Storage"
        DS1["SQLite Database (Prisma)"]
        DS2["content/ (MDX Files)"]
        DS3["localStorage / IndexedDB"]
        DS4["GA4 / Search Console APIs"]
    end

    P1 --> P2
    P2 --> S1
    P2 --> S2
    P2 --> S3
    P1 --> B1
    P1 --> B2
    B1 --> D1
    B1 --> D2
    B1 --> D3
    D1 --> DS1
    D2 --> DS2
    D3 --> DS3
    B1 --> DS4
```

### 1. Presentation Layer
- **Pages** (`src/app/`): 11 public pages, 10 admin pages, 19 API routes
- **Components** (`src/components/`): 91 React components across 9 subdirectories
- **Tools** (`src/tools/`): 41 tool components with dynamic lazy-loading

### 2. State & Context Layer
- **AnalyticsContext**: Central state for analytics dashboard data
- **BiblicalThemeContext**: Theme toggling (biblical mode, calm mode)
- **Zustand Store**: Task planner state with localStorage persistence
- **Custom Hooks**: `useLocalStorage`, `useMounted`

### 3. Business Logic Layer
- **Auth**: Google OAuth via Auth.js v5 with admin email validation
- **Analytics Service**: Multi-source data aggregation with caching
- **Blog CMS**: Draft CRUD + MDX filesystem publishing
- **SEO Tools**: Content optimization, AI scoring, link analysis
- **Planner Utils**: CBC lesson plan generation with KICD compliance

### 4. Data Access Layer
- **Prisma Client**: Singleton SQLite connection with Better-SQLite3 adapter
- **Blog Reader**: MDX filesystem parser using gray-matter
- **Settings/User/Tools CMS**: API-first with localStorage fallback
- **GitHub Publisher**: Blog deployment via GitHub Contents API

---

## Data Flow

### Tool Usage Flow
```mermaid
sequenceDiagram
    User->>Next.js: Navigate to /tools/[slug]
    Next.js->>Server: generateStaticParams (build-time)
    Next.js->>Client: Render tool-client.tsx
    Client->>Client: Load tool via dynamic()
    Client->>GA/IndexedDB: trackToolOpen(slug)
    User->>Tool Component: Interact
    Tool Component->>localStorage: Persist data
    Tool Component->>GA/IndexedDB: trackToolUse(slug, action)
    User->>Tool: Download/Export
    Tool->>Client: jsPDF / file generation
```

### Admin Panel Data Flow
```mermaid
sequenceDiagram
    Admin->>Next.js: /admin/*
    Next.js->>Auth.js: requireAuth() / requireApiAuth()
    Auth.js->>Google OAuth: Validate session JWT
    Auth.js->>roles.ts: isAdmin(email)
    Admin->>AdminPage: Render dashboard
    AdminPage->>API Route: GET /api/admin/dashboard
    API Route->>Prisma: Query SiteSetting, ToolConfig, BlogDraft, AdminUser
    API Route->>GA4 API: Fetch analytics
    API Route-->>AdminPage: Aggregate response
    AdminPage->>AnalyticsContext: Load + cache data
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    User->>/api/auth/signin: Sign in with Google
    Auth.js->>Google: Redirect to OAuth consent
    Google-->>Auth.js: Authorization code
    Auth.js->>Google: Exchange for tokens
    Auth.js->>signIn callback: Verify email
    signIn callback->>roles.ts: isAdmin(email)
    roles.ts-->>signIn: true/false
    signIn-->>Auth.js: Allow/Deny
    Auth.js-->>User: JWT session cookie
    User->>/admin/*: Request admin page
    auth-guard.ts->>auth(): Read session
    auth()->>Auth.js: Validate JWT
    auth-guard.ts->>roles.ts: checkAdminRole(email)
    roles.ts-->>auth-guard.ts: Role or null
    auth-guard.ts-->>User: Allow or redirect
```

**Key details:**
- Provider: Google OAuth only
- Session strategy: JWT (no database sessions)
- Admin check: `isAdmin()` compares against hardcoded `ADMIN_USERS` array in `roles.ts`
- Super admin: `edwinwamukoya88@gmail.com` (role protected from deletion/demotion)
- Auto-creation: First admin (`edwinwamukoya88@gmail.com`) auto-created on check-auth if missing

---

## Analytics Flow

```mermaid
graph LR
    subgraph "Client-Side"
        A[User Action] --> B[ga.ts / analytics.ts]
        B --> C[Google Analytics 4 (gtag)]
        B --> D[first-party-analytics.ts]
        D --> E[IndexedDB]
    end

    subgraph "Server-Side (Admin)"
        F[Admin Dashboard] --> G[analytics-context.tsx]
        G --> H[analytics-service.ts]
        H --> I[GET /api/analytics/*]
        I --> J[GA4 Data API]
        I --> K[Search Console API]
        H --> L[first-party-analytics.ts]
        L --> E
    end
```

**Three analytics sources:**
1. **GA4**: Events tracked via gtag (`G-W75ZWVJVFB`), queried via `@google-analytics/data`
2. **First-Party**: IndexedDB-based privacy-first tracking (tool usage, page views, sessions)
3. **Search Console**: SEO data via Google Webmasters API

**Alert system:** `alerts.ts` evaluates metric thresholds and generates push-style alerts.

---

## Admin System

The admin panel at `/admin/*` provides:

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/admin` | Overview stats, quick actions, system health |
| Blog | `/admin/blog` | List/manage published posts + drafts |
| Blog Editor | `/admin/blog/new` | Create new blog post |
| Blog Editor | `/admin/blog/[id]/edit` | Edit existing draft |
| Tools | `/admin/tools` | Manage tool visibility flags |
| Tool Detail | `/admin/tools/[id]` | Tool-specific settings + analytics |
| Ads | `/admin/ads` | Sponsored ad management |
| AI Studio | `/admin/ai` | AI content tools (simulated) |
| Analytics | `/admin/analytics` | Full analytics dashboard (8 tabs) |
| Settings | `/admin/settings` | Site-wide branding & SEO settings |
| Users | `/admin/users` | Admin user management |
| System | `/admin/system` | System health checks |

**Access control:**
- `requireAuth()` (server) / `requireApiAuth()` (API) validates session
- Roles: `admin`, `editor`, `viewer`

---

## Tool System

```mermaid
graph TB
    subgraph "Tool Configuration"
        A[tools-data.ts<br/>Static definitions]
        B[tools-cms.ts<br/>DB + localStorage fallback]
        C[ToolConfig<br/>Prisma Model]
    end

    subgraph "Tool Pages"
        D["/tools<br/>Listing page"]
        E["/tools/[slug]<br/>Dynamic tool page"]
    end

    subgraph "Tool Loading"
        F["tool-client.tsx<br/>dynamic() imports"]
        G["src/tools/*<br/>41 tool components"]
    end

    subgraph "Tool Types"
        H[Productivity<br/>7 tools]
        I[Education<br/>6 tools]
        J[Security/Text<br/>5 tools]
        K[QR & Connectivity<br/>4 tools]
        L[File Conversion<br/>5 tools]
        M[Developer<br/>4 tools]
        N[Design/Creative<br/>5 tools]
        O[Finance<br/>4 tools]
    end

    A --> B
    B --> C
    D --> A
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    G --> M
    G --> N
    G --> O
```

---

## Blog/CMS System

```mermaid
graph TB
    subgraph "Content Storage"
        A["content/*.mdx<br/>Published posts"]
        B["BlogDraft Table<br/>Draft/Scheduled posts"]
    end

    subgraph "Content Management"
        C["blog.ts<br/>Read MDX filesystem"]
        D["blog-cms.ts<br/>Draft CRUD + localStorage"]
        E["BlogEditor.tsx<br/>WYSIWYG-like editor"]
    end

    subgraph "Publishing"
        F["github-publisher.ts<br/>GitHub Contents API"]
        G["/api/publish-blog<br/>Publish endpoint"]
    end

    subgraph "Display"
        H["/blog<br/>Listing page"]
        I["/blog/[slug]<br/>Article page"]
        J["/api/og<br/>OG images"]
    end

    A --> C
    B --> D
    D --> E
    E --> F
    F --> G
    G --> A
    C --> H
    C --> I
    I --> J

    subgraph "SEO/AI Layer"
        K["ai-score.ts<br/>Visibility scoring"]
        L["seo-cleanup.ts<br/>Pre-publish validation"]
        M["universal-rewriter.ts<br/>Content enhancement"]
        N["ai-links.ts<br/>Internal link graph"]
    end

    C --> K
    E --> L
    E --> M
    C --> N
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Vercel (Production)"
        A["Next.js Build"]
        B["Prisma Generate"]
        C["Static Pages (SSG): /, /about, /tools, etc."]
        D["Dynamic Pages (SSR): /admin/*, /api/*"]
        E["Edge Functions: /api/og"]
        E2["Server Functions: /api/*"]
    end

    subgraph "Data Layer"
        F["SQLite (dev.db)"]
        G["MDX Files (content/)"]
    end

    subgraph "External Services"
        H["Google OAuth"]
        I["Google Analytics 4"]
        J["Google Search Console"]
        K["GitHub API"]
        L["Google AdSense"]
    end

    subgraph "Build Pipeline"
        M["npm run build"]
        N["prisma generate"]
        O["next build"]
        N --> O
        M --> N
        O --> A
    end

    A --> C
    A --> D
    A --> E
    A --> E2
    E2 --> F
    D --> K
    E2 --> I
    E2 --> J
    D --> H
    C --> L
```

---

## Prisma Architecture

```mermaid
erDiagram
    SiteSetting {
        int id PK "always 1"
        string heroTitle
        string heroSubtitle
        string ctaPrimary
        string ctaPrimaryLink
        string ctaSecondary
        string ctaSecondaryLink
        string defaultTitle
        string defaultDescription
        string keywords
        string ogImage
        string logo
        string favicon
        string twitterUrl
        string githubUrl
        string linkedinUrl
        string footerText
    }

    ToolConfig {
        string slug PK
        boolean enabled
        boolean featured
        boolean popular
        boolean new
        datetime createdAt
        datetime updatedAt
    }

    BlogDraft {
        string id PK
        string title
        string slug
        string description
        string content
        string category
        string tags "JSON string"
        string author
        boolean featured
        string coverImage
        string status "draft|published|scheduled"
        datetime scheduledDate "nullable"
        datetime createdAt
        datetime updatedAt
    }

    AdminUser {
        string email PK
        string role "admin|editor|viewer"
        string status "active|disabled|invited"
        datetime lastLogin "nullable"
        datetime invitedAt
    }

    SponsoredAd {
        string id PK
        string title
        string description
        string image "nullable"
        string link
        string slot "hero|mid|footer"
        boolean active
        int clicks
        int impressions
        datetime createdAt
    }

    ActivityLog {
        string id PK
        string userId "nullable"
        string action
        string details "nullable"
        datetime createdAt
    }
```

**No explicit relations between models.** All 6 models are standalone. Foreign key logic is handled at the application layer.

---

## Component Architecture

```mermaid
graph TB
    subgraph "Root Layout"
        L["layout.tsx"]
        H["header.tsx"]
        F["footer.tsx"]
        GA["GoogleAnalytics.tsx"]
        TP["toast-provider.tsx"]
        CC["cookie-consent.tsx"]
        BT["biblical-theme-context"]
    end

    subgraph "UI Primitives"
        B["button"]
        C["card"]
        BD["badge"]
        I["input"]
        S["select"]
        SEP["separator"]
        T["tabs"]
        D["dialog"]
        SA["scroll-area"]
    end

    subgraph "Admin Components"
        AS["AdminSidebar"]
        AH["AdminHeader"]
        AB["AdminBreadcrumbs"]
        DT["DataTable"]
        PH["PageHeader"]
        SB["StatusBadge"]
        KO["KpiCard"]
        TC["TrafficChart"]
        ST["StatCard"]
    end

    subgraph "Tool Components"
        TC2["tool-card.tsx"]
        SB2["search-bar.tsx"]
    end

    subgraph "Blog Components"
        BC["blog-card"]
        BCI["blog-cover-image"]
        FP["featured-post"]
        BS["blog-search"]
        CF["category-filter"]
        RA["related-articles"]
        RT["related-tools"]
        SB3["share-buttons"]
        TOC["table-of-contents"]
    end

    L --> H
    L --> F
    L --> GA
    L --> TP
    L --> CC
    L --> BT
    AS --> B
    AS --> BD
    DT --> B
    DT --> BD
```

---

## Build Process

```mermaid
graph LR
    A[Source Code] --> B[TypeScript Compiler]
    B --> C[Next.js Build]
    D[Prisma Schema] --> E[Prisma Generate]
    E --> C
    C --> F[Static Export]
    C --> G[Server Functions]
    C --> H[Edge Functions]
    F --> I[.next/]
    G --> I
    H --> I
    I --> J[Vercel Deploy]
```

**Build command:** `prisma generate && next build`

**Output:**
- Static pages (SSG): Pre-rendered at build time
- Dynamic pages (SSR): Rendered on request
- API routes: Deployed as serverless functions
- Edge routes (`/api/og`): Deployed at edge

---

## Next.js Architecture

| Feature | Implementation |
|---------|---------------|
| **Router** | App Router (file-system based) |
| **Rendering** | Mixed: SSG (tools, blog), SSR (admin), Static (public pages) |
| **Data Fetching** | Server Components + API Routes + Server Actions |
| **Dynamic Imports** | `next/dynamic` for tool components |
| **Metadata** | `generateMetadata()` + static `metadata` exports |
| **Sitemap** | Dynamic `/sitemap.xml` via `sitemap.ts` |
| **Font Optimization** | `next/font/google` (Geist, Geist Mono) |
| **Image Optimization** | `next/image` (limited usage; most images use `<img>` for external sources) |
| **Strict Mode** | Enabled (`reactStrictMode: true`) |
| **TypeScript** | Strict mode enabled |
| **Path Aliases** | `@/*` maps to `./src/*` |
