-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "sessionId" TEXT NOT NULL DEFAULT '',
    "visitorId" TEXT NOT NULL DEFAULT '',
    "path" TEXT NOT NULL DEFAULT '',
    "referrer" TEXT NOT NULL DEFAULT '',
    "device" TEXT NOT NULL DEFAULT 'unknown',
    "browser" TEXT NOT NULL DEFAULT 'unknown',
    "os" TEXT NOT NULL DEFAULT 'unknown',
    "country" TEXT NOT NULL DEFAULT '',
    "properties" TEXT NOT NULL DEFAULT '{}',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "value" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AnalyticsSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL DEFAULT '',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "toolEvents" INTEGER NOT NULL DEFAULT 0,
    "aiRequests" INTEGER NOT NULL DEFAULT 0,
    "blogEvents" INTEGER NOT NULL DEFAULT 0,
    "device" TEXT NOT NULL DEFAULT 'unknown',
    "browser" TEXT NOT NULL DEFAULT 'unknown',
    "os" TEXT NOT NULL DEFAULT 'unknown',
    "country" TEXT NOT NULL DEFAULT '',
    "referrer" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "AnalyticsVisitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "firstVisitAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisitAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "totalToolEvents" INTEGER NOT NULL DEFAULT 0,
    "totalAIRequests" INTEGER NOT NULL DEFAULT 0,
    "totalBlogViews" INTEGER NOT NULL DEFAULT 0,
    "device" TEXT NOT NULL DEFAULT 'unknown',
    "browser" TEXT NOT NULL DEFAULT 'unknown',
    "country" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "AnalyticsDailyMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "toolOpens" INTEGER NOT NULL DEFAULT 0,
    "toolCompletions" INTEGER NOT NULL DEFAULT 0,
    "aiRequests" INTEGER NOT NULL DEFAULT 0,
    "aiTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "aiEstimatedCost" REAL NOT NULL DEFAULT 0,
    "blogViews" INTEGER NOT NULL DEFAULT 0,
    "blogReads" INTEGER NOT NULL DEFAULT 0,
    "newVisitors" INTEGER NOT NULL DEFAULT 0,
    "bounceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AnalyticsHourlyMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "toolOpens" INTEGER NOT NULL DEFAULT 0,
    "aiRequests" INTEGER NOT NULL DEFAULT 0,
    "blogViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL DEFAULT '',
    "visitorId" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "model" TEXT NOT NULL DEFAULT '',
    "feature" TEXT NOT NULL DEFAULT '',
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" REAL NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT NOT NULL DEFAULT '',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "rateLimited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_path_idx" ON "AnalyticsEvent"("path");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorId_idx" ON "AnalyticsEvent"("visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_createdAt_idx" ON "AnalyticsEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_path_createdAt_idx" ON "AnalyticsEvent"("path", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSession_sessionId_key" ON "AnalyticsSession"("sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsSession_visitorId_idx" ON "AnalyticsSession"("visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsSession_startTime_idx" ON "AnalyticsSession"("startTime");

-- CreateIndex
CREATE INDEX "AnalyticsSession_lastActivityAt_idx" ON "AnalyticsSession"("lastActivityAt");

-- CreateIndex
CREATE INDEX "AnalyticsSession_visitorId_startTime_idx" ON "AnalyticsSession"("visitorId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsVisitor_visitorId_key" ON "AnalyticsVisitor"("visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsVisitor_lastVisitAt_idx" ON "AnalyticsVisitor"("lastVisitAt");

-- CreateIndex
CREATE INDEX "AnalyticsVisitor_firstVisitAt_idx" ON "AnalyticsVisitor"("firstVisitAt");

-- CreateIndex
CREATE INDEX "AnalyticsDailyMetric_date_idx" ON "AnalyticsDailyMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsDailyMetric_date_key" ON "AnalyticsDailyMetric"("date");

-- CreateIndex
CREATE INDEX "AnalyticsHourlyMetric_date_idx" ON "AnalyticsHourlyMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsHourlyMetric_date_hour_key" ON "AnalyticsHourlyMetric"("date", "hour");

-- CreateIndex
CREATE INDEX "AIUsageLog_feature_idx" ON "AIUsageLog"("feature");

-- CreateIndex
CREATE INDEX "AIUsageLog_createdAt_idx" ON "AIUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIUsageLog_sessionId_idx" ON "AIUsageLog"("sessionId");

-- CreateIndex
CREATE INDEX "AIUsageLog_feature_createdAt_idx" ON "AIUsageLog"("feature", "createdAt");
