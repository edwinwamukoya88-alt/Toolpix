"use client"

import { useCallback } from "react"
import { useWorkspace } from "./hooks/useWorkspace"
import Header from "./components/Header"
import CategoryTabs from "./components/CategoryTabs"
import FeatureChips from "./components/FeatureChips"
import PromptChips from "./components/PromptChips"
import PromptEditor from "./components/PromptEditor"
import QuickContext from "./components/QuickContext"
import OutputViewer from "./components/OutputViewer"
import HistoryDrawer from "./components/HistoryDrawer"
import BottomToolbar from "./components/BottomToolbar"
import { EDUCATION_FEATURES, WRITING_FEATURES, DESIGN_FEATURES } from "./data"

export default function AIWorkspace() {
  const ws = useWorkspace()

  const handleChipSelect = useCallback((prompt: string, featureId?: string) => {
    if (featureId && ws.catFeatures.some((f) => f.id === featureId)) {
      ws.handleFeatureSelect(featureId)
    }
    ws.setInput(prompt)
  }, [ws])

  const showQuickContext = ws.activeCategory === "education" && ws.feature?.settings != null && ws.feature.settings.some((f) => ["grade", "learningArea", "strand", "subStrand", "duration"].includes(f.key))

  const catFeaturesAll = ws.activeCategory === "education" ? EDUCATION_FEATURES : ws.activeCategory === "writing" ? WRITING_FEATURES : DESIGN_FEATURES

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <Header
        feature={ws.feature}
        onHistoryClick={() => ws.setHistoryOpen(true)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl p-3 sm:p-4 md:p-6 space-y-4">
          <CategoryTabs
            activeCategory={ws.activeCategory}
            onCategoryChange={ws.handleCategoryChange}
          />

          <FeatureChips
            features={catFeaturesAll}
            activeFeature={ws.activeFeature}
            onSelect={ws.handleFeatureSelect}
          />

          {ws.activeCategory === "education" && ws.activeFeature && (
            <PromptChips
              onSelect={(prompt, featureId) => handleChipSelect(prompt, featureId)}
            />
          )}

          {ws.feature && (
            <PromptEditor
              value={ws.input}
              onChange={ws.setInput}
              placeholder={ws.feature.promptPlaceholder}
              disabled={ws.isGenerating}
              usageRemaining={ws.usageRemaining}
              onGenerate={ws.handleGenerate}
              isGenerating={ws.isGenerating}
              hasFeature={!!ws.activeFeature}
              error={ws.error}
              featureName={ws.feature?.name}
            />
          )}

          {showQuickContext && (
            <QuickContext
              grade={ws.settings["grade"] || ""}
              learningArea={ws.settings["learningArea"] || ""}
              strand={ws.settings["strand"] || ""}
              subStrand={ws.settings["subStrand"] || ""}
              duration={ws.settings["duration"] || "40"}
              onGradeChange={(v) => ws.updateSetting("grade", v)}
              onLearningAreaChange={(v) => ws.updateSetting("learningArea", v)}
              onStrandChange={(v) => ws.updateSetting("strand", v)}
              onSubStrandChange={(v) => ws.updateSetting("subStrand", v)}
              onDurationChange={(v) => ws.updateSetting("duration", v)}
            />
          )}

          {!ws.feature && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">Select a feature to get started</p>
            </div>
          )}

          <OutputViewer
            output={ws.output}
            htmlOutput={ws.htmlOutput}
            showOutput={ws.showOutput}
            feature={ws.feature}
            outputRef={ws.outputRef}
          />
        </div>
      </main>

      <BottomToolbar
        show={ws.showOutput}
        onCopy={ws.handleCopy}
        onDownload={ws.handleDownload}
        onDownloadDocx={ws.handleDownloadDocx}
        onPrint={ws.handlePrint}
        wordCount={ws.wordCount}
        charCount={ws.charCount}
        copySuccess={ws.copySuccess}
      />

      <HistoryDrawer
        history={ws.history}
        open={ws.historyOpen}
        onClose={() => ws.setHistoryOpen(false)}
        onRestore={ws.restoreFromHistory}
        onDelete={ws.deleteHistoryItem}
        onToggleFavorite={ws.toggleFavorite}
      />
    </div>
  )
}
