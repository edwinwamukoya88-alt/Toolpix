"use client"

import { useState } from "react"
import { ImageDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function QrExtractor() {
  const [imageUrl, setImageUrl] = useState("")
  const [result, setResult] = useState("")

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setResult("QR image loaded. Full decoding requires a QR library like jsQR.")
    toast.success("Image loaded")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <Button variant="outline" className="relative">
            <ImageDown className="h-4 w-4 mr-2" /> Upload QR Image
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImage} />
          </Button>

          {imageUrl && (
            <div className="flex flex-col items-center gap-4">
              <img src={imageUrl} alt="QR" className="max-w-[200px] rounded-lg border" />
              {result && (
                <div className="p-4 rounded-lg bg-muted text-sm w-full">
                  <p className="text-muted-foreground">{result}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
