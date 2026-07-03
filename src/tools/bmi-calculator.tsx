"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, InfoBox, Bar } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { parseNum, fmt, fmtCompact } from "@/lib/calculator/format"
import { Weight, Ruler, ArrowLeftRight, AlertTriangle, Heart, Activity, Info } from "lucide-react"
import { useMemo, useState } from "react"

export default function BMICalculator() {
  const [isMetric, setIsMetric] = useState(true)
  const [height, setHeight] = useState("175")
  const [weight, setWeight] = useState("70")
  const [feet, setFeet] = useState("5")
  const [inches, setInches] = useState("9")
  const [weightLbs, setWeightLbs] = useState("154")

  const calc = useMemo(() => {
    let hMeters: number
    let wKg: number
    let displayWeight: string

    if (isMetric) {
      const hCm = parseNum(height)
      hMeters = hCm / 100
      wKg = parseNum(weight)
      displayWeight = `${fmt(wKg)} kg`
    } else {
      const totalInches = parseNum(feet) * 12 + parseNum(inches)
      hMeters = totalInches * 0.0254
      wKg = parseNum(weightLbs) * 0.453592
      displayWeight = `${fmt(parseNum(weightLbs))} lbs`
    }

    const bmi = hMeters > 0 ? wKg / (hMeters * hMeters) : 0

    const minHealthyKg = 18.5 * hMeters * hMeters
    const maxHealthyKg = 24.9 * hMeters * hMeters
    const minHealthy = isMetric ? `${fmt(minHealthyKg)} kg` : `${fmt(minHealthyKg * 2.205)} lbs`
    const maxHealthy = isMetric ? `${fmt(maxHealthyKg)} kg` : `${fmt(maxHealthyKg * 2.205)} lbs`

    let categoryLabel: string
    let categoryColor: string
    let categoryBg: string
    let healthInfo: string
    let infoVariant: "info" | "warning" | "success" | "error"

    if (bmi < 18.5) {
      categoryLabel = "Underweight"
      categoryColor = "text-blue-600 dark:text-blue-400"
      categoryBg = "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300"
      healthInfo = "A BMI below 18.5 may indicate underweight. Consider speaking with a healthcare provider about healthy ways to gain weight."
      infoVariant = "warning"
    } else if (bmi < 25) {
      categoryLabel = "Normal"
      categoryColor = "text-green-600 dark:text-green-400"
      categoryBg = "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300"
      healthInfo = "Great job! Maintaining a healthy weight reduces the risk of chronic diseases. Keep it up with a balanced diet and regular exercise."
      infoVariant = "success"
    } else if (bmi < 30) {
      categoryLabel = "Overweight"
      categoryColor = "text-amber-600 dark:text-amber-400"
      categoryBg = "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300"
      healthInfo = "A BMI in the overweight range may increase health risks. Consider incorporating more physical activity and a balanced diet."
      infoVariant = "warning"
    } else if (bmi < 35) {
      categoryLabel = "Obese Class I"
      categoryColor = "text-orange-600 dark:text-orange-400"
      categoryBg = "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300"
      healthInfo = "Obesity increases the risk of heart disease, diabetes, and other conditions. Consult a healthcare provider for a personalized plan."
      infoVariant = "warning"
    } else if (bmi < 40) {
      categoryLabel = "Obese Class II"
      categoryColor = "text-red-600 dark:text-red-400"
      categoryBg = "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
      healthInfo = "This level of obesity carries significant health risks. Please consult a healthcare provider for guidance and support."
      infoVariant = "error"
    } else {
      categoryLabel = "Obese Class III"
      categoryColor = "text-red-700 dark:text-red-300"
      categoryBg = "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-200"
      healthInfo = "Severe obesity requires medical attention. Please consult a healthcare provider to discuss treatment options."
      infoVariant = "error"
    }

    const markerPct = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))

    return {
      bmi,
      categoryLabel,
      categoryColor,
      categoryBg,
      healthInfo,
      infoVariant,
      markerPct,
      minHealthy,
      maxHealthy,
      displayWeight,
    }
  }, [isMetric, height, weight, feet, inches, weightLbs])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader title="BMI Calculator" description="Calculate your Body Mass Index" />

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setIsMetric(!isMetric)} className="gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          {isMetric ? "Switch to Imperial" : "Switch to Metric"}
        </Button>
      </div>

      <CalculatorCard>
        {isMetric ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput label="Height (cm)" value={height} onChange={setHeight} icon={<Ruler className="h-4 w-4" />} step="1" min="0" />
            <NumberInput label="Weight (kg)" value={weight} onChange={setWeight} icon={<Weight className="h-4 w-4" />} step="0.5" min="0" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Height (ft)" value={feet} onChange={setFeet} icon={<Ruler className="h-4 w-4" />} step="1" min="0" />
              <NumberInput label="Height (in)" value={inches} onChange={setInches} step="1" min="0" />
            </div>
            <NumberInput label="Weight (lbs)" value={weightLbs} onChange={setWeightLbs} icon={<Weight className="h-4 w-4" />} step="1" min="0" />
          </div>
        )}
      </CalculatorCard>

      <Card>
        <CardContent className="p-5 text-center space-y-3">
          <div className={`text-5xl sm:text-6xl font-bold tabular-nums tracking-tight ${calc.categoryColor}`}>
            {Number.isFinite(calc.bmi) ? calc.bmi.toFixed(1) : "0.0"}
          </div>
          <p className="text-sm font-medium text-muted-foreground">BMI</p>
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${calc.categoryBg}`}>
            {calc.categoryLabel}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard label="Weight" value={calc.displayWeight} accent="neutral" icon={<Weight className="h-5 w-5" />} />
        <ResultCard label="Healthy BMI Range" value="18.5 – 24.9" accent="green" icon={<Activity className="h-5 w-5" />} subtitle={`${calc.minHealthy} – ${calc.maxHealthy}`} />
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-semibold">BMI Scale</h3>
          <div className="relative pt-2">
            <div
              className="relative h-3 w-full rounded-full overflow-hidden"
              style={{ background: "linear-gradient(to right, #3b82f6, #06b6d4, #22c55e, #eab308, #f97316, #ef4444)" }}
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background shadow-lg transition-all duration-500 z-10"
                style={{ left: `calc(${calc.markerPct}% - 7px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 px-0.5">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <InfoBox variant={calc.infoVariant}>
        <Heart className="h-4 w-4 shrink-0" />
        {calc.healthInfo}
      </InfoBox>

      <ActionBar
        onReset={() => {
          setIsMetric(true)
          setHeight("175")
          setWeight("70")
          setFeet("5")
          setInches("9")
          setWeightLbs("154")
        }}
        result={`BMI: ${Number.isFinite(calc.bmi) ? calc.bmi.toFixed(1) : "0.0"} (${calc.categoryLabel})`}
      />

      <InfoBox variant="info">
        <Info className="h-4 w-4 shrink-0" />
        BMI is a screening tool, not a diagnostic tool. Consult a healthcare provider for a complete health assessment.
      </InfoBox>
    </div>
  )
}
