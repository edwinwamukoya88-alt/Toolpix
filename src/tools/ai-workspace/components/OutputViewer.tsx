"use client"

import React, { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import type { FeatureDef } from "../types"

interface OutputViewerProps {
  output: string
  htmlOutput?: string
  showOutput: boolean
  feature: FeatureDef | undefined
  outputRef: React.RefObject<HTMLDivElement | null>
}

export default memo(function OutputViewer({ output, htmlOutput, showOutput, feature, outputRef }: OutputViewerProps) {
  if (!showOutput) return null

  return (
    <div ref={outputRef} className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {feature?.name || "Document"}
        </span>
      </div>
      <div className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/20 bg-gradient-to-r from-primary/[0.04] to-primary/[0.02] px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Kenya Institute of Curriculum Development
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
            Competency Based Curriculum &mdash; CBC Document
          </p>
        </div>
        <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8 max-w-none ai-output text-sm leading-[1.75] text-foreground/85 [&_*]:break-words">
          {htmlOutput ? (
            <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1({ children }) {
                  return <h1 className="text-xl font-bold text-foreground mt-8 mb-4 pb-3 border-b border-border/15">{children}</h1>
                },
                h2({ children }) {
                  return <h2 className="text-lg font-bold text-foreground mt-6 mb-3">{children}</h2>
                },
                h3({ children }) {
                  return <h3 className="text-base font-semibold text-foreground/90 mt-5 mb-2">{children}</h3>
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-4 rounded-xl border border-border/15 -mx-1 sm:mx-0 shadow-sm">
                      <table className="w-full border-collapse text-xs sm:text-sm">{children}</table>
                    </div>
                  )
                },
                th({ children }) {
                  return <th className="border-b border-border/15 bg-muted/30 px-3 sm:px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap text-xs sm:text-sm">{children}</th>
                },
                td({ children }) {
                  return <td className="border-b border-border/10 px-3 sm:px-4 py-2.5 text-foreground/80 text-xs sm:text-sm">{children}</td>
                },
                pre({ children }) {
                  return (
                    <pre className="overflow-x-auto rounded-xl bg-muted/30 p-4 sm:p-5 text-xs leading-relaxed font-mono border border-border/10 -mx-1 sm:mx-0 shadow-sm">
                      {children}
                    </pre>
                  )
                },
                ul({ children }) {
                  return <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 my-3 text-foreground/80">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-5 sm:pl-6 space-y-1.5 my-3 text-foreground/80">{children}</ol>
                },
                blockquote({ children }) {
                  return <blockquote className="border-l-[3px] border-primary/30 pl-4 sm:pl-5 italic text-muted-foreground/80 my-4 bg-primary/[0.02] py-2 pr-3 rounded-r-xl">{children}</blockquote>
                },
                img({ src, alt }) {
                  return (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={alt || ""}
                        className="rounded-xl max-w-full h-auto my-4 border border-border/10 shadow-sm"
                        loading="lazy"
                      />
                    </>
                  )
                },
                p({ children }) {
                  return <p className="mb-4 last:mb-0 leading-[1.75] text-foreground/85">{children}</p>
                },
                strong({ children }) {
                  return <strong className="font-semibold text-foreground/90">{children}</strong>
                },
                code({ children, className }) {
                  const isInline = !className
                  if (isInline) {
                    return <code className="rounded-md bg-muted/40 px-1.5 py-0.5 text-xs sm:text-sm font-mono text-foreground/80 border border-border/10">{children}</code>
                  }
                  return <code className="block">{children}</code>
                },
                hr() {
                  return <hr className="my-6 border-border/15" />
                },
              }}
            >
              {output}
            </ReactMarkdown>
          )}
        </div>
        <div className="border-t border-border/15 px-4 sm:px-5 py-2.5 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/40">Generated by Zilita</span>
          <span className="text-[10px] text-muted-foreground/40">KICD &middot; CBC</span>
        </div>
      </div>
    </div>
  )
})
