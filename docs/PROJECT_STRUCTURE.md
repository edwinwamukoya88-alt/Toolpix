# Project Structure

```
smart tools kit/
│
├── prisma/                          # Database layer
│   ├── schema.prisma                # Prisma schema (6 models)
│   ├── seed.ts                      # Seed script (admin user, site settings, tool configs)
│   └── migrations/
│       └── 20260701152259_init/     # Initial migration
│           └── migration.sql
│
├── public/                          # Static assets
│
├── content/                         # Blog MDX files
│
├── src/                             # Application source
│   │
│   ├── auth.ts                      # Auth.js v5 configuration (Google OAuth, JWT)
│   │
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (fonts, header, footer, analytics, ads)
│   │   ├── page.tsx                 # Landing page (hero, categories, popular tools, blog)
│   │   ├── globals.css              # Global styles + Tailwind
│   │   ├── error.tsx                # Global error boundary
│   │   ├── not-found.tsx            # 404 page
│   │   ├── sitemap.ts               # Dynamic XML sitemap
│   │   ├── favicon.ico
│   │   │
│   │   ├── about/page.tsx
│   │   ├── access-denied/page.tsx
│   │   ├── advertise/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── help/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   │
│   │   ├── blog/                    # Blog section
│   │   │   ├── page.tsx             # Blog listing
│   │   │   ├── blog-home-client.tsx  # Client-side blog listing
│   │   │   └── [slug]/
│   │   │       ├── page.tsx         # Blog article server component
│   │   │       └── blog-article-client.tsx  # Blog article client component
│   │   │
│   │   ├── tools/                   # Tools section
│   │   │   ├── page.tsx             # Tools directory listing
│   │   │   └── [slug]/
│   │   │       ├── page.tsx         # Tool page server component
│   │   │       └── tool-client.tsx  # Tool page client wrapper (dynamic imports, ads)
│   │   │
│   │   ├── admin/                   # Admin panel
│   │   │   ├── layout.tsx           # Admin layout (sidebar, header, auth guard)
│   │   │   ├── page.tsx             # Dashboard (stats, quick actions, system health)
│   │   │   ├── actions.ts           # Server actions
│   │   │   │
│   │   │   ├── ads/page.tsx         # Sponsored ad management
│   │   │   ├── ai/page.tsx          # AI Content Studio (9 tools, simulated)
│   │   │   ├── analytics/page.tsx   # Analytics dashboard (8 tabs)
│   │   │   ├── settings/page.tsx    # Site settings
│   │   │   ├── system/page.tsx      # System health checks
│   │   │   ├── users/page.tsx       # Admin user management
│   │   │   │
│   │   │   ├── blog/                # Blog management
│   │   │   │   ├── actions.ts       # Server actions
│   │   │   │   ├── page.tsx         # Blog list (published + drafts)
│   │   │   │   ├── new/page.tsx     # New blog post
│   │   │   │   └── [id]/edit/page.tsx  # Edit blog post
│   │   │   │
│   │   │   └── tools/               # Tool management
│   │   │       ├── page.tsx         # Tools list with toggles
│   │   │       └── [id]/page.tsx    # Tool detail + analytics
│   │   │
│   │   └── api/                     # API routes
│   │       ├── test/route.ts        # Health check
│   │       ├── auth/[...nextauth]/route.ts  # Auth.js handler
│   │       ├── og/route.tsx          # OG image generation (Edge)
│   │       │
│   │       ├── analytics/            # Analytics API
│   │       │   ├── route.ts          # GA4 debug/fetch
│   │       │   ├── realtime/route.ts # GA4 real-time
│   │       │   ├── ga4/route.ts      # GA4 parametrized queries
│   │       │   └── search-console/route.ts  # Search Console data
│   │       │
│   │       ├── publish-blog/         # Blog publishing API
│   │       │   ├── route.ts          # GitHub publish
│   │       │   └── debug/route.ts    # Publish debug
│   │       │
│   │       └── admin/                # Admin API
│   │           ├── users/route.ts     # Admin user CRUD
│   │           ├── check-auth/route.ts  # Auth validation
│   │           ├── settings/route.ts  # Site settings
│   │           ├── tools/route.ts     # Tool config
│   │           ├── dashboard/route.ts # Dashboard stats
│   │           ├── blogs/route.ts     # Blog list
│   │           ├── blog-drafts/       # Blog drafts
│   │           │   ├── route.ts
│   │           │   └── [id]/route.ts
│   │           └── ads/               # Sponsored ads
│   │               ├── route.ts
│   │               └── [id]/route.ts
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # Shadcn-style primitives
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   └── tabs.tsx
│   │   │
│   │   ├── header.tsx                # Public site header
│   │   ├── footer.tsx                # Public site footer
│   │   ├── tool-card.tsx             # Tool card component
│   │   ├── search-bar.tsx            # Search bar with debounce
│   │   ├── chart-container.tsx       # Chart wrapper (recharts)
│   │   ├── GoogleAnalytics.tsx       # GA4 route tracker
│   │   └── toast-provider.tsx        # Sonner toast provider
│   │
│   │   ├── ads/                      # Advertising components
│   │   │   ├── AdSlot.tsx            # Ad slot renderer
│   │   │   ├── ad-banner.tsx         # Banner ad component
│   │   │   └── cookie-consent.tsx    # Cookie consent banner
│   │   │
│   │   ├── blog/                     # Blog components
│   │   │   ├── blog-card.tsx
│   │   │   ├── blog-cover-image.tsx
│   │   │   ├── blog-search.tsx
│   │   │   ├── category-filter.tsx
│   │   │   ├── featured-post.tsx
│   │   │   ├── related-articles.tsx
│   │   │   ├── related-tools.tsx
│   │   │   ├── share-buttons.tsx
│   │   │   └── table-of-contents.tsx
│   │   │
│   │   ├── admin/                    # Admin components
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminBreadcrumbs.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── DataSourceIndicator.tsx
│   │   │   ├── DashboardNavigation.tsx
│   │   │   ├── DashboardOverviewCards.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── TrafficChart.tsx
│   │   │   ├── AcquisitionDonut.tsx
│   │   │   ├── CategoryBarChart.tsx
│   │   │   ├── ConversionFunnel.tsx
│   │   │   ├── ToolFunnel.tsx
│   │   │   ├── ToolPerformanceTable.tsx
│   │   │   ├── ToolUsageChart.tsx
│   │   │   ├── BlogAnalyticsSection.tsx
│   │   │   ├── BlogPerformanceTable.tsx
│   │   │   ├── TrendingContent.tsx
│   │   │   ├── SEODashboard.tsx
│   │   │   ├── SEOInspector.tsx
│   │   │   ├── SearchConsoleInsights.tsx
│   │   │   ├── UserBehaviourHeatmap.tsx
│   │   │   ├── RecentActivityFeed.tsx
│   │   │   ├── LiveActivity.tsx
│   │   │   ├── AIInsightsPanel.tsx
│   │   │   ├── RealtimeWidget.tsx
│   │   │   ├── ProductAnalyticsCard.tsx
│   │   │   └── BlogEditor.tsx
│   │   │
│   │   ├── planner/                  # Lesson Planner wizard
│   │   │   ├── step-setup.tsx
│   │   │   ├── step-curriculum.tsx
│   │   │   ├── step-competencies.tsx
│   │   │   ├── step-activities.tsx
│   │   │   ├── step-assessment.tsx
│   │   │   ├── step-preview.tsx
│   │   │   ├── multi-select.tsx
│   │   │   ├── searchable-multi-select.tsx
│   │   │   ├── biblical-reflection.tsx
│   │   │   ├── compliance-meter.tsx
│   │   │   ├── live-preview.tsx
│   │   │   └── custom-field-input.tsx
│   │   │
│   │   ├── pomodoro/                 # Pomodoro timer components
│   │   │   ├── animated-counter.tsx
│   │   │   ├── circular-progress.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── gamification-card.tsx
│   │   │   ├── heatmap-preview.tsx
│   │   │   ├── insight-card.tsx
│   │   │   ├── insights-dashboard.tsx
│   │   │   ├── loading-skeleton.tsx
│   │   │   ├── sparkline-chart.tsx
│   │   │   ├── weekly-monthly-chart.tsx
│   │   │   └── ai-insights-panel.tsx
│   │   │
│   │   └── zenith/                   # Zenith focus mode
│   │       ├── timer.tsx
│   │       ├── hero.tsx
│   │       ├── task-organizer.tsx
│   │       ├── ambient-sounds.tsx
│   │       ├── quote-display.tsx
│   │       ├── analytics.tsx
│   │       └── smart-insights.tsx
│   │
│   ├── contexts/                     # React context providers
│   │   ├── analytics-context.tsx     # Analytics dashboard state
│   │   └── biblical-theme-context.tsx  # Theme toggling (biblical/calm mode)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-local-storage.ts      # Generic localStorage hook
│   │   └── use-mounted.ts            # Hydration-safe mount detection
│   │
│   ├── lib/                          # Libraries & utilities
│   │   ├── utils.ts                  # cn(), generateId(), debounce(), formatDate()
│   │   ├── db.ts                     # Prisma singleton client
│   │   ├── env.ts                    # GitHub environment variable validation
│   │   ├── roles.ts                  # Admin role checking
│   │   ├── auth-guard.ts             # requireAuth(), requireApiAuth()
│   │   │
│   │   ├── tools-data.ts             # Static tool definitions (40+ tools, 8 categories)
│   │   ├── tools-cms.ts              # Tool config CRUD (API + localStorage)
│   │   │
│   │   ├── blog-types.ts             # Blog type definitions
│   │   ├── blog.ts                   # MDX filesystem blog reader
│   │   ├── blog-cms.ts               # Blog draft CRUD (API + localStorage)
│   │   ├── blog-cover-generator.ts   # Cover image config generation
│   │   │
│   │   ├── settings-types.ts         # Site settings types
│   │   ├── settings.ts              # Settings CRUD (API + localStorage)
│   │   │
│   │   ├── user-management.ts        # Admin user CRUD (API + localStorage)
│   │   │
│   │   ├── analytics.ts             # Client-side event tracking
│   │   ├── ga.ts                    # GA4 gtag wrapper
│   │   ├── analytics-service.ts     # Multi-source analytics aggregation
│   │   ├── analytics-utils.ts       # Types + mock data generators
│   │   ├── first-party-analytics.ts # IndexedDB-based tracking
│   │   ├── ga4-mock.ts              # GA4 response type mocks
│   │   ├── alerts.ts                # Analytics alert engine
│   │   │
│   │   ├── pomodoro-analytics.ts    # Pomodoro session analytics
│   │   │
│   │   ├── planner-types.ts         # Lesson planner types
│   │   ├── planner-data.ts          # CBC curriculum data (grades, strands, outcomes)
│   │   ├── planner-utils.ts         # Lesson plan formatting, PDF, compliance scoring
│   │   │
│   │   ├── ai-score.ts              # AI visibility scoring
│   │   ├── ai-badge.ts              # AI badge labels
│   │   ├── ai-links.ts              # Keyword-to-tool link graph
│   │   ├── ai-meta.ts               # AI metadata generation
│   │   ├── ai-signals.ts            # AI signal descriptors
│   │   ├── seo-cleanup.ts           # Pre-publish validation & auto-fix
│   │   ├── universal-rewriter.ts    # Content enhancement for AI visibility
│   │   ├── universal-seo-tracker.ts # Client-side page performance tracking
│   │   ├── universal-trends.ts      # Trending content generation
│   │   │
│   │   ├── github-publisher.ts      # GitHub Contents API integration
│   │   ├── export-utils.ts          # CSV/Excel/PDF export
│   │   └── seo-cleanup.ts           # SEO content cleanup
│   │
│   └── tools/                        # Tool components (41 files)
│       ├── todo-list.tsx              # Task Planner entry
│       ├── pomodoro.tsx               # Pomodoro Timer
│       ├── notes-app.tsx              # Notes App
│       ├── day-planner.tsx            # Day Planner
│       ├── habit-tracker.tsx          # Habit Tracker
│       ├── stopwatch.tsx              # Stopwatch
│       ├── kanban-board.tsx           # Kanban Board
│       ├── grade-calculator.tsx       # CBC Grade Calculator
│       ├── revision-planner.tsx       # Revision Planner
│       ├── lesson-plan-generator.tsx  # Lesson Plan Generator
│       ├── exam-generator.tsx         # Exam Generator
│       ├── teacher-comment-generator.tsx # Teacher Comment Generator
│       ├── scheme-of-work-generator.tsx  # Scheme of Work Generator
│       ├── password-generator.tsx     # Password Generator
│       ├── text-cleaner.tsx           # Text Cleaner
│       ├── base64.tsx                 # Base64 Encoder/Decoder
│       ├── url-encoder.tsx            # URL Encoder/Decoder
│       ├── random-generator.tsx       # Random Generator
│       ├── qr-generator.tsx           # QR Code Generator
│       ├── qr-scanner.tsx             # QR Code Scanner
│       ├── qr-extractor.tsx           # QR Code Extractor
│       ├── url-shortener.tsx          # URL Shortener
│       ├── pdf-converter.tsx          # PDF Converter
│       ├── image-converter.tsx        # Image Converter
│       ├── document-converter.tsx     # Document Converter
│       ├── audio-converter.tsx        # Audio Converter
│       ├── file-compressor.tsx        # File Compressor
│       ├── json-formatter.tsx         # JSON Formatter
│       ├── regex-tester.tsx           # Regex Tester
│       ├── markdown-preview.tsx       # Markdown Preview
│       ├── unit-converter.tsx         # Unit Converter
│       ├── color-picker.tsx           # Color Picker
│       ├── lorem-ipsum.tsx            # Lorem Ipsum Generator
│       ├── favicon-generator.tsx      # Favicon Generator
│       ├── image-placeholder.tsx      # Image Placeholder
│       ├── currency-converter.tsx     # Currency Converter
│       ├── loan-calculator.tsx        # Loan Calculator
│       ├── profit-calculator.tsx      # Profit Calculator
│       ├── blog-generator.tsx         # Blog Generator
│       │
│       ├── design-cards-studio/        # Design Cards Studio
│       │   ├── DesignCardsStudio.tsx
│       │   └── components/
│       │       ├── CardForm.tsx
│       │       ├── CardPreview.tsx
│       │       ├── ExportPanel.tsx
│       │       ├── TemplateSelector.tsx
│       │       ├── cardTypes.ts
│       │       ├── templates.ts
│       │       └── utils.ts
│       │
│       └── todo/                       # Task Planner subsystem
│           ├── types.ts                # Type definitions
│           ├── utils.ts                # Utility functions
│           ├── store.ts                # Zustand store with persist
│           ├── TaskPlanner.tsx          # Main component
│           ├── TaskForm.tsx             # Task create/edit form
│           ├── TaskFilters.tsx          # Search/filter/sort
│           ├── TaskCard.tsx            # Task card
│           ├── TaskDashboard.tsx       # Stats dashboard
│           ├── TaskCalendar.tsx         # Calendar view
│           ├── FocusMode.tsx           # Distraction-free view
│           └── ReminderSystem.tsx       # Notification reminders
│
├── content/                            # Blog MDX files (published posts)
│
├── next.config.js                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
├── postcss.config.mjs                  # PostCSS configuration
├── tsconfig.json                       # TypeScript configuration
├── eslint.config.mjs                   # ESLint configuration
├── prisma.config.ts                    # Prisma configuration
├── components.json                     # shadcn/ui configuration
├── vercel.json                         # Vercel deployment config
├── package.json                        # Dependencies & scripts
├── AGENTS.md                           # AI coding agent instructions
└── CLAUDE.md                           # AI coding agent instructions
```
