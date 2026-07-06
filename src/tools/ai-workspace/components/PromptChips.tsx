"use client"

interface PromptChip {
  id: string
  icon: string
  label: string
  prompt: string
  featureId: string
}

const CHIPS: PromptChip[] = [
  {
    id: "lesson-plan",
    icon: "📘",
    label: "Lesson Plan",
    featureId: "lesson-planner",
    prompt: "Generate a detailed KICD-compliant CBC lesson plan that includes: learning outcomes, introduction, lesson development (step by step), learning resources, assessment methods, and summary. Focus on making it practical for a classroom setting with: ",
  },
  {
    id: "assessment",
    icon: "📝",
    label: "Assessment",
    featureId: "assessment",
    prompt: "Design a competency-based assessment that includes: learning outcomes being assessed, assessment tasks/rubrics, scoring guidelines, and feedback strategies. The assessment should align with CBC expectations for: ",
  },
  {
    id: "comments",
    icon: "💬",
    label: "Teacher Comments",
    featureId: "comment-generator",
    prompt: "Write professional CBC report card comments that address: learner's strengths, areas for improvement, and recommendations for parents. Use encouraging and constructive language for a student who: ",
  },
  {
    id: "scheme",
    icon: "📚",
    label: "Scheme of Work",
    featureId: "scheme-of-work",
    prompt: "Create a termly scheme of work that includes: week-by-week breakdown, learning outcomes, teaching activities, resources needed, and assessment methods. Cover the following topics for: ",
  },
  {
    id: "revision",
    icon: "🎯",
    label: "Revision Plan",
    featureId: "revision-planner",
    prompt: "Create a structured revision plan that includes: topic breakdown, time allocation per topic, revision techniques, practice exercises, and self-assessment checkpoints. The plan should help learners master: ",
  },
  {
    id: "worksheet",
    icon: "📄",
    label: "Worksheet",
    featureId: "lesson-planner",
    prompt: "Generate a practice worksheet with: clear instructions, a variety of question types (multiple choice, short answer, problem solving), space for working, and an answer key. The worksheet should assess understanding of: ",
  },
  {
    id: "activities",
    icon: "🧩",
    label: "Learning Activities",
    featureId: "lesson-planner",
    prompt: "Design engaging and interactive learning activities that: address different learning styles, promote learner participation, use available local resources, and include differentiation for diverse learners. The activities should teach: ",
  },
  {
    id: "rubric",
    icon: "📊",
    label: "Rubric",
    featureId: "assessment",
    prompt: "Create a detailed scoring rubric that includes: assessment criteria at multiple performance levels (Exceeding, Meeting, Approaching, Below Expectations), clear descriptors for each level, and a scoring guide. The rubric should evaluate: ",
  },
]

interface PromptChipsProps {
  onSelect: (prompt: string, featureId?: string) => void
}

export default function PromptChips({ onSelect }: PromptChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onSelect(chip.prompt, chip.featureId)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/60 px-3.5 py-2 text-xs font-medium text-foreground/80 hover:bg-card hover:border-border/70 transition-all active:scale-[0.97]"
        >
          <span className="text-sm">{chip.icon}</span>
          {chip.label}
        </button>
      ))}
    </div>
  )
}
