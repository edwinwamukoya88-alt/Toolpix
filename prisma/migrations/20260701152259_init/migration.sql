-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "heroTitle" TEXT NOT NULL DEFAULT 'Smart Tools for Productivity & CBC Education',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Free, privacy-first utilities for students, teachers, and professionals.',
    "ctaPrimary" TEXT NOT NULL DEFAULT 'Explore Tools',
    "ctaPrimaryLink" TEXT NOT NULL DEFAULT '/tools',
    "ctaSecondary" TEXT NOT NULL DEFAULT 'Read Blog',
    "ctaSecondaryLink" TEXT NOT NULL DEFAULT '/blog',
    "defaultTitle" TEXT NOT NULL DEFAULT 'ToolForge — Smart Tools for Productivity & Education',
    "defaultDescription" TEXT NOT NULL DEFAULT 'Free online tools for students, teachers, and professionals. Privacy-first, no sign-up required.',
    "keywords" TEXT NOT NULL DEFAULT 'productivity tools, cbc tools, education tools, free online tools',
    "ogImage" TEXT NOT NULL DEFAULT '/og-image.png',
    "logo" TEXT NOT NULL DEFAULT '/logo.png',
    "favicon" TEXT NOT NULL DEFAULT '/favicon.ico',
    "twitterUrl" TEXT NOT NULL DEFAULT 'https://twitter.com/toolforge',
    "githubUrl" TEXT NOT NULL DEFAULT 'https://github.com/edwinwamukoya88-alt',
    "linkedinUrl" TEXT NOT NULL DEFAULT 'https://linkedin.com',
    "footerText" TEXT NOT NULL DEFAULT '© 2026 ToolForge. All rights reserved.'
);

-- CreateTable
CREATE TABLE "ToolConfig" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "new" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlogDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Uncategorized',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "author" TEXT NOT NULL DEFAULT 'ToolForge Team',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLogin" DATETIME,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SponsoredAd" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "link" TEXT NOT NULL,
    "slot" TEXT NOT NULL DEFAULT 'hero',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
