"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, Download, Lock, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { protectPdf } from "@/lib/pdf/engine"
import { downloadBytes } from "@/lib/pdf/download"

export default function ProtectModule({
  files,
  onBack,
}: {
  files: File[]
  onBack: () => void
}) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [processing, setProcessing] = useState(false)

  const handleProtect = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No PDF file loaded")
      return
    }
    if (!password) {
      toast.error("Please enter a password")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setProcessing(true)
    try {
      const bytes = await files[0].arrayBuffer()
      const baseName = files[0].name.replace(/\.pdf$/i, "")
      const result = await protectPdf(bytes, password)
      downloadBytes(result, `${baseName}_protected.pdf`)
      toast.success("PDF encrypted with AES-256-GCM")
    } catch {
      toast.error("Failed to encrypt PDF")
    } finally {
      setProcessing(false)
    }
  }, [files, password, confirmPassword])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Protect PDF</h3>
          <p className="text-sm text-muted-foreground">
            Encrypt your PDF with a password
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
            <Info className="h-4 w-4 text-primary/60 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              Uses AES-256-GCM encryption. The protected PDF can only be unlocked
              with this tool using the same password.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Password <span className="text-destructive">*</span>
            </label>
            <Input
              type="password"
              placeholder="Enter a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </label>
            <Input
              type="password"
              placeholder="Re-enter the password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleProtect}
            disabled={processing || !password || password !== confirmPassword}
          >
            {processing ? "Encrypting..." : (
              <><Lock className="h-4 w-4 mr-2" /> Encrypt & Download</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
