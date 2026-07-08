"use client"

import { X, History, Star, Trash2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { getFeature } from "../data"
import type { HistoryItem } from "../types"

interface HistoryDrawerProps {
  history: HistoryItem[]
  open: boolean
  onClose: () => void
  onRestore: (item: HistoryItem) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export default function HistoryDrawer({
  history,
  open,
  onClose,
  onRestore,
  onDelete,
  onToggleFavorite,
}: HistoryDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl bg-background border-t border-border/40 shadow-2xl safe-bottom"
            role="dialog"
            aria-modal="true"
            aria-label="History"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" aria-hidden="true" />
            </div>

            <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">History</h2>
                {history.length > 0 && (
                  <span className="text-xs text-muted-foreground/50">({history.length})</span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Close history"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-2 max-h-[calc(85vh-5rem)]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted/30 p-3 mb-3">
                    <History className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No history yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                    Generated content will appear here
                  </p>
                </div>
              ) : (
                history.map((item) => {
                  const feat = getFeature(item.feature)
                  const FIcon = feat?.icon || Sparkles
                  return (
                    <div
                      key={item.id}
                      className="group rounded-xl border border-border/30 p-3 space-y-2 hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.99]"
                      onClick={() => onRestore(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRestore(item)}
                      aria-label={`Restore ${feat?.name || "item"} from history`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FIcon className={cn("h-3.5 w-3.5 shrink-0", feat?.color || "text-muted-foreground")} />
                          <span className="text-xs font-medium truncate">{feat?.name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id) }}
                            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label={item.favorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star className={cn("h-3.5 w-3.5", item.favorite ? "text-amber-400 fill-amber-400" : "text-muted-foreground")} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Delete history item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.input}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground/50">
                          {new Date(item.timestamp).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {item.favorite && (
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400/50" aria-label="Favorite" />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
