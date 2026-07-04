"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, Download, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { unlockPdf } from "@/lib/pdf/engine"
import { downloadBytes } from "@/lib/pdf/download"

export default function UnlockModule({
  files,
  onBack,
}: {
  files: File[]
  onBack: () => void
}) {
  const [password, setPassword] = useState("")
  const [processing, setProcessing] = useState(false)

  const handleUnlock = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No PDF file loaded")
      return
    }
    if (!password) {
      toast.error("Please enter the PDF password")
      return
    }

    setProcessing(true)
    try {
      const bytes = await files[0].arrayBuffer()
      const baseName = files[0].name.replace(/\.pdf$/i, "")
      const result = await unlockPdf(bytes, password)
      downloadBytes(result, `${baseName}_unlocked.pdf`)
      toast.success("PDF unlocked successfully")
    } catch {
      toast.error("Incorrect password or PDF is not encrypted")
    } finally {
      setProcessing(false)
    }
  }, [files, password])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Unlock PDF</h3>
          <p className="text-sm text-muted-foreground">
            Remove password protection from a PDF
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              PDF Password
            </label>
            <Input
              type="password"
              placeholder="Enter the password to unlock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleUnlock}
            disabled={processing || !password}
          >
            {processing ? "Unlocking..." : (
              <><Unlock className="h-4 w-4 mr-2" /> Unlock & Download</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
