-- AlterTable: Add enhanced visitor intelligence fields to AnalyticsEvent
ALTER TABLE "AnalyticsEvent" ADD COLUMN "screen" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsEvent" ADD COLUMN "viewport" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsEvent" ADD COLUMN "language" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsEvent" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsEvent" ADD COLUMN "utmSource" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsEvent" ADD COLUMN "utmMedium" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsEvent" ADD COLUMN "utmCampaign" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsEvent" ADD COLUMN "utmContent" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsEvent" ADD COLUMN "utmTerm" TEXT NOT NULL DEFAULT '';

-- AlterTable: Add enhanced visitor intelligence fields to AnalyticsSession
ALTER TABLE "AnalyticsSession" ADD COLUMN "screen" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "viewport" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "language" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "utmSource" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "utmMedium" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "utmCampaign" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "utmContent" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "utmTerm" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsSession" ADD COLUMN "landingPage" TEXT NOT NULL DEFAULT '';

-- AlterTable: Add enhanced visitor intelligence fields to AnalyticsVisitor
ALTER TABLE "AnalyticsVisitor" ADD COLUMN "screen" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsVisitor" ADD COLUMN "language" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsVisitor" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsVisitor" ADD COLUMN "utmSource" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsVisitor" ADD COLUMN "utmMedium" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsVisitor" ADD COLUMN "utmCampaign" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AnalyticsVisitor" ADD COLUMN "returning" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: Funnel tracking
CREATE TABLE "AnalyticsFunnel" (
    "id" TEXT NOT NULL,
    "funnelName" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL DEFAULT '',
    "sessionId" TEXT NOT NULL DEFAULT '',
    "stepsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "dropoffStep" INTEGER NOT NULL DEFAULT 0,
    "properties" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsFunnel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsFunnel_funnelName_idx" ON "AnalyticsFunnel"("funnelName");
CREATE INDEX "AnalyticsFunnel_visitorId_idx" ON "AnalyticsFunnel"("visitorId");
CREATE INDEX "AnalyticsFunnel_createdAt_idx" ON "AnalyticsFunnel"("createdAt");
CREATE INDEX "AnalyticsFunnel_funnelName_createdAt_idx" ON "AnalyticsFunnel"("funnelName", "createdAt");

-- Performance indexes for new query patterns
CREATE INDEX "AnalyticsEvent_utmSource_idx" ON "AnalyticsEvent"("utmSource");
CREATE INDEX "AnalyticsEvent_screen_idx" ON "AnalyticsEvent"("screen");
CREATE INDEX "AnalyticsEvent_language_idx" ON "AnalyticsEvent"("language");
