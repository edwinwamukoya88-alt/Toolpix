"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import {
  BookOpen, Copy, Printer, FileDown, Plus, X, Search, ChevronDown, RefreshCw, Check, Trash2, Sparkles
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

// ====== CBC DATA BANKS ======

const GRADES = ["PP1", "PP2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"]

const DURATIONS = ["30", "35", "40", "45", "50", "60", "80", "90", "120"]

const LESSON_NUMBERS = Array.from({ length: 30 }, (_, i) => String(i + 1))

const LEARNING_AREAS_BY_GRADE: Record<string, string[]> = {
  PP1: ["Language Activities", "Mathematical Activities", "Environmental Activities", "Psychomotor and Creative Activities", "Religious Education Activities"],
  PP2: ["Language Activities", "Mathematical Activities", "Environmental Activities", "Psychomotor and Creative Activities", "Religious Education Activities"],
  "Grade 1": ["Literacy", "Kiswahili", "English", "Mathematics", "Environmental Activities", "Hygiene and Nutrition", "Religious Education", "Movement and Creative Activities"],
  "Grade 2": ["Literacy", "Kiswahili", "English", "Mathematics", "Environmental Activities", "Hygiene and Nutrition", "Religious Education", "Movement and Creative Activities"],
  "Grade 3": ["Literacy", "Kiswahili", "English", "Mathematics", "Environmental Activities", "Hygiene and Nutrition", "Religious Education", "Movement and Creative Activities"],
  "Grade 4": ["English", "Kiswahili", "Mathematics", "Science and Technology", "Social Studies", "Religious Education", "Creative Arts", "Physical and Health Education", "Agriculture"],
  "Grade 5": ["English", "Kiswahili", "Mathematics", "Science and Technology", "Social Studies", "Religious Education", "Creative Arts", "Physical and Health Education", "Agriculture"],
  "Grade 6": ["English", "Kiswahili", "Mathematics", "Science and Technology", "Social Studies", "Religious Education", "Creative Arts", "Physical and Health Education", "Agriculture"],
  "Grade 7": ["English", "Kiswahili", "Mathematics", "Integrated Science", "Social Studies", "Religious Education", "Creative Arts and Sports", "Health Education", "Pre-Technical and Career Studies", "Agriculture and Nutrition"],
  "Grade 8": ["English", "Kiswahili", "Mathematics", "Integrated Science", "Social Studies", "Religious Education", "Creative Arts and Sports", "Health Education", "Pre-Technical and Career Studies", "Agriculture and Nutrition"],
  "Grade 9": ["English", "Kiswahili", "Mathematics", "Integrated Science", "Social Studies", "Religious Education", "Creative Arts and Sports", "Health Education", "Pre-Technical and Career Studies", "Agriculture and Nutrition"],
}

const STRANDS_BY_AREA: Record<string, string[]> = {
  Mathematics: ["Numbers", "Measurement", "Geometry", "Algebra", "Data Handling", "Patterns and Sequences"],
  English: ["Listening and Speaking", "Reading", "Writing", "Grammar", "Comprehension"],
  Kiswahili: ["Kusikiliza na Kuzungumza", "Kusoma", "Kuandika", "Sarufi", "Msamiati"],
  "Science and Technology": ["Living Things", "Environment", "Energy", "Force and Motion", "Materials", "Technology"],
  "Integrated Science": ["Scientific Investigation", "Living Things and Environment", "Energy and Motion", "Matter and Materials", "Health and Safety"],
  "Social Studies": ["People and Relationships", "Resources and Economic Activities", "Political Systems and Governance", "Peace and Conflict Resolution", "Environment and Natural Resources"],
  "Religious Education": ["Creation", "Faith and Beliefs", "Moral Values", "Worship and Rituals", "Community Life"],
  "Creative Arts": ["Visual Arts", "Music", "Drama and Theatre", "Dance", "Craft"],
  "Creative Arts and Sports": ["Visual Arts", "Music", "Drama and Theatre", "Dance and Movement", "Sports and Games"],
  "Physical and Health Education": ["Locomotor Skills", "Non-locomotor Skills", "Manipulative Skills", "Health and Hygiene", "Safety"],
  Agriculture: ["Soil", "Plants", "Animals", "Farm Tools", "Food Production"],
  "Agriculture and Nutrition": ["Soil and Water Conservation", "Crop Production", "Animal Production", "Food and Nutrition", "Entrepreneurship"],
  "Environmental Activities": ["Environment", "Weather", "Plants", "Animals", "Water"],
  "Hygiene and Nutrition": ["Personal Hygiene", "Food and Nutrition", "Safety", "Community Health"],
  Literacy: ["Listening", "Speaking", "Reading", "Writing", "Language Structure"],
  "Language Activities": ["Listening", "Speaking", "Pre-reading", "Pre-writing", "Language Skills"],
  "Mathematical Activities": ["Number Work", "Measurement", "Geometry", "Patterns", "Data"],
  "Psychomotor and Creative Activities": ["Gross Motor Skills", "Fine Motor Skills", "Creative Play", "Art and Craft", "Music and Movement"],
  "Religious Education Activities": ["God and Me", "My Family", "My Community", "Celebrations", "Nature"],
  "Movement and Creative Activities": ["Locomotor Skills", "Non-locomotor Skills", "Creative Expression", "Games", "Swimming"],
  "Pre-Technical and Career Studies": ["Technical Skills", "Career Awareness", "Entrepreneurship", "Technology", "Safety"],
  "Health Education": ["Personal Health", "Nutrition", "Disease Prevention", "Reproductive Health", "Substance Abuse"],
}

const SUBSTRANDS: Record<string, string[]> = {
  Numbers: ["Number Concepts", "Counting", "Place Value", "Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Decimals", "Percentages", "Integers", "Ratios and Proportions"],
  Measurement: ["Length", "Mass", "Capacity", "Time", "Money", "Perimeter", "Area", "Volume", "Temperature"],
  Geometry: ["Basic Shapes", "2D Shapes", "3D Shapes", "Position and Direction", "Symmetry", "Angles", "Lines", "Tessellation"],
  Algebra: ["Patterns", "Sequences", "Algebraic Expressions", "Equations", "Inequalities"],
  "Data Handling": ["Data Collection", "Data Representation", "Data Interpretation", "Probability"],
  "Patterns and Sequences": ["Number Patterns", "Shape Patterns", "Growing Patterns", "Repeating Patterns"],
  "Listening and Speaking": ["Pronunciation", "Oral Narratives", "Conversations", "Dictation", "Public Speaking"],
  Reading: ["Phonics", "Fluency", "Vocabulary", "Comprehension", "Reading Aloud"],
  Writing: ["Handwriting", "Spelling", "Sentence Construction", "Paragraph Writing", "Creative Writing", "Letter Writing"],
  Grammar: ["Nouns", "Verbs", "Adjectives", "Adverbs", "Tenses", "Sentence Structure", "Punctuation"],
  Comprehension: ["Literal Comprehension", "Inferential Comprehension", "Critical Comprehension", "Summarizing"],
  "Kusikiliza na Kuzungumza": ["Matamshi", "Simulizi", "Mazungumzo", "Imla", "Hotuba"],
  Kusoma: ["Foniki", "Usawa wa Kusoma", "Msamiati", "Ufahamu", "Kusoma kwa Sauti"],
  Kuandika: ["Mwandiko", "Tahajia", "Uundaji wa Sentensi", "Insha", "Barua"],
  Sarufi: ["Nomino", "Vitenzi", "Vivumishi", "Vielezi", "Nyakati", "Muundo wa Sentensi"],
  Msamiati: ["Msamiati wa Msingi", "Msamiati wa Mazingira", "Msamiati wa Shule", "Msamiati wa Nyumbani"],
  "Living Things": ["Plants", "Animals", "Human Body", "Life Cycles", "Habitats", "Classification"],
  Environment: ["Weather", "Soil", "Water", "Air", "Pollution", "Conservation"],
  Energy: ["Forms of Energy", "Light", "Sound", "Heat", "Electricity", "Renewable Energy"],
  "Force and Motion": ["Push and Pull", "Gravity", "Friction", "Magnetism", "Simple Machines"],
  Materials: ["Properties of Materials", "States of Matter", "Changes in Materials", "Uses of Materials"],
  Technology: ["Simple Tools", "Computers", "Communication Technology", "Transport Technology"],
  "Scientific Investigation": ["Observation", "Measurement", "Experimentation", "Data Recording", "Conclusion"],
  "Living Things and Environment": ["Cells", "Tissues and Organs", "Ecosystems", "Biodiversity", "Human Body Systems"],
  "Energy and Motion": ["Forms of Energy", "Energy Transfer", "Speed and Velocity", "Newton's Laws of Motion", "Work and Power"],
  "Matter and Materials": ["Atoms and Elements", "Compounds and Mixtures", "Chemical Reactions", "Acids and Bases"],
  "Health and Safety": ["First Aid", "Disease Prevention", "Nutrition", "Personal Safety"],
  "People and Relationships": ["Family", "Community", "Culture", "Conflict Resolution"],
  "Resources and Economic Activities": ["Natural Resources", "Agriculture", "Trade", "Tourism"],
  "Political Systems and Governance": ["Government", "Leadership", "Constitution", "Civic Rights"],
  "Peace and Conflict Resolution": ["Conflict Management", "Peacebuilding", "Human Rights"],
  "Environment and Natural Resources": ["Weather and Climate", "Vegetation", "Wildlife", "Conservation"],
  Creation: ["The Universe", "Human Beings", "Animals and Plants", "Environment"],
  "Faith and Beliefs": ["Belief in God", "Prayer and Worship", "Holy Books", "Religious Practices"],
  "Moral Values": ["Honesty", "Kindness", "Respect", "Responsibility", "Forgiveness"],
  "Worship and Rituals": ["Prayer", "Songs and Hymns", "Sacred Places", "Religious Festivals"],
  "Community Life": ["Family Relationships", "Community Service", "Sharing", "Helping Others"],
  "Visual Arts": ["Drawing", "Painting", "Printmaking", "Sculpture", "Design"],
  Music: ["Singing", "Rhythm", "Musical Instruments", "Melody", "Composition"],
  "Drama and Theatre": ["Role Play", "Puppetry", "Improvisation", "Storytelling"],
  Dance: ["Body Movement", "Traditional Dance", "Creative Dance", "Dance Patterns"],
  "Dance and Movement": ["Body Control", "Creative Dance", "Cultural Dance", "Dance Composition"],
  Craft: ["Paper Craft", "Clay Work", "Weaving", "Beadwork", "Woodwork"],
  "Sports and Games": ["Athletics", "Ball Games", "Gymnastics", "Swimming", "Traditional Games"],
  "Locomotor Skills": ["Walking", "Running", "Jumping", "Hopping", "Skipping", "Galloping"],
  "Non-locomotor Skills": ["Bending", "Stretching", "Twisting", "Balancing", "Pushing", "Pulling"],
  "Manipulative Skills": ["Throwing", "Catching", "Kicking", "Striking", "Dribbling"],
  "Health and Hygiene": ["Hand Washing", "Oral Hygiene", "Cleanliness", "Healthy Eating"],
  Safety: ["Road Safety", "Home Safety", "School Safety", "Fire Safety", "First Aid"],
  Soil: ["Soil Types", "Soil Properties", "Soil Conservation", "Soil Preparation"],
  Plants: ["Plant Parts", "Plant Growth", "Plant Protection", "Crops", "Gardening"],
  Animals: ["Domestic Animals", "Wild Animals", "Animal Care", "Animal Products"],
  "Farm Tools": ["Simple Tools", "Tool Safety", "Tool Maintenance"],
  "Food Production": ["Food Crops", "Food Preservation", "Food Processing", "Food Storage"],
  "Soil and Water Conservation": ["Soil Erosion", "Water Harvesting", "Irrigation", "Conservation Methods"],
  "Crop Production": ["Crop Types", "Planting", "Crop Care", "Harvesting", "Storage"],
  "Animal Production": ["Animal Breeds", "Animal Feeding", "Animal Health", "Housing"],
  "Food and Nutrition": ["Nutrients", "Balanced Diet", "Food Groups", "Meal Planning", "Food Hygiene", "Healthy Eating", "Food Safety", "Meal Times"],
  Entrepreneurship: ["Business Ideas", "Saving", "Budgeting", "Marketing"],
  Weather: ["Weather Conditions", "Weather Symbols", "Weather Instruments", "Seasons"],
  Water: ["Sources of Water", "Uses of Water", "Water Conservation", "Water Treatment"],
  "Personal Hygiene": ["Body Care", "Dental Care", "Hand Washing", "Toilet Use"],
  "Community Health": ["Disease Prevention", "Immunization", "Community Cleanliness"],
  "Language Skills": ["Listening Skills", "Speaking Skills", "Vocabulary", "Communication"],
  "Number Work": ["Counting", "Number Recognition", "Number Writing", "Comparing Numbers", "Shapes"],
  "Pre-reading": ["Visual Discrimination", "Auditory Discrimination", "Letter Recognition", "Phonics"],
  "Pre-writing": ["Tracing", "Maze", "Pattern Writing", "Hand Grip"],
  "Gross Motor Skills": ["Running", "Jumping", "Climbing", "Balancing"],
  "Fine Motor Skills": ["Cutting", "Coloring", "Threading", "Modeling"],
  "Creative Play": ["Pretend Play", "Dramatic Play", "Construction Play"],
  "Art and Craft": ["Drawing", "Painting", "Modeling", "Collage"],
  "Music and Movement": ["Rhythm", "Singing", "Dance", "Action Songs"],
  "God and Me": ["God's Creation", "Myself", "My Senses", "My Feelings"],
  "My Family": ["Family Members", "Family Roles", "Family Values"],
  "My Community": ["Community Helpers", "Places in Community", "Cultural Practices"],
  Celebrations: ["Birthdays", "Religious Celebrations", "National Holidays"],
  Nature: ["Plants and Animals", "Weather", "Water", "Environment Care"],
  "Technical Skills": ["Basic Tools", "Measurement", "Drawing", "Modeling", "Material Handling", "Tool Use"],
  "Career Awareness": ["Career Exploration", "Skills for Work", "Work Ethics"],
  "Personal Health": ["Hygiene", "Physical Fitness", "Mental Health", "Healthy Lifestyle"],
  Nutrition: ["Food Groups", "Balanced Diet", "Meal Planning", "Food Safety"],
  "Disease Prevention": ["Common Diseases", "Immunization", "Healthy Practices"],
  "Reproductive Health": ["Adolescence", "Body Changes", "Personal Care"],
  "Substance Abuse": ["Drug Awareness", "Peer Pressure", "Healthy Choices"],
}

const OUTCOMES_BY_SUBSTRAND: Record<string, string[]> = {
  // Mathematics - Number Concepts
  "Number Concepts": [
    "Learners identify and count objects up to 100",
    "Learners read and write numbers in symbols and words",
    "Learners compare and order numbers using place value",
    "Learners represent numbers using concrete objects and pictures",
  ],
  Counting: [
    "Learners count forward and backward from any number",
    "Learners skip count in 2s, 5s, and 10s",
    "Learners estimate quantities and verify by counting",
  ],
  "Place Value": [
    "Learners identify place value of digits up to hundreds",
    "Learners decompose numbers into tens and ones",
    "Learners compose numbers using place value",
  ],
  Addition: [
    "Learners solve simple addition problems using objects",
    "Learners add numbers without regrouping up to 100",
    "Learners apply addition in real-life situations involving money",
  ],
  Subtraction: [
    "Learners solve subtraction problems using concrete objects",
    "Learners subtract numbers without regrouping up to 100",
    "Learners apply subtraction in real-life contexts",
  ],
  Multiplication: [
    "Learners understand multiplication as repeated addition",
    "Learners multiply single-digit numbers using skip counting",
    "Learners solve multiplication word problems",
  ],
  Division: [
    "Learners understand division as equal sharing",
    "Learners divide numbers using concrete objects",
    "Learners solve simple division word problems",
  ],
  Fractions: [
    "Learners identify halves, thirds, and quarters of objects",
    "Learners represent fractions using diagrams",
    "Learners compare simple fractions in real-life contexts",
  ],
  Decimals: [
    "Learners identify decimal notation in money and measurement",
    "Learners add and subtract decimals in money contexts",
  ],
  Percentages: [
    "Learners describe percentage as part of a hundred",
    "Learners calculate simple percentages in real-life contexts",
  ],
  Length: [
    "Learners measure length using non-standard units",
    "Learners measure length in metres and centimetres",
    "Learners estimate and compare lengths of objects",
  ],
  Mass: [
    "Learners compare mass using a balance scale",
    "Learners measure mass in kilograms and grams",
    "Learners estimate mass of common objects",
  ],
  Capacity: [
    "Learners compare capacity of containers",
    "Learners measure capacity in litres",
    "Learners estimate capacity in everyday contexts",
  ],
  Time: [
    "Learners tell time in hours and half-hours",
    "Learners read a calendar and identify days, weeks, months",
    "Learners sequence events using time vocabulary",
  ],
  Money: [
    "Learners identify Kenyan currency notes and coins",
    "Learners count money in shillings and cents",
    "Learners solve problems involving buying and selling",
  ],
  // English - Listening and Speaking
  Pronunciation: [
    "Learners pronounce sounds and words correctly",
    "Learners identify letter sounds and blend them to form words",
  ],
  Conversations: [
    "Learners initiate and sustain simple conversations",
    "Learners use appropriate greetings and polite language",
    "Learners express ideas clearly in group discussions",
  ],
  "Oral Narratives": [
    "Learners retell simple stories with sequence",
    "Learners create and tell original stories",
    "Learners identify main ideas in oral narratives",
  ],
  // Comprehension
  "Literal Comprehension": [
    "Learners answer factual questions about a text",
    "Learners identify main ideas explicitly stated in a passage",
    "Learners recall details from a story or article",
  ],
  "Inferential Comprehension": [
    "Learners make predictions based on textual clues",
    "Learners draw conclusions from a text",
    "Learners infer character feelings and motives",
  ],
  // Writing
  "Sentence Construction": [
    "Learners construct grammatically correct sentences",
    "Learners use proper punctuation in sentences",
    "Learners expand simple sentences using adjectives",
  ],
  "Creative Writing": [
    "Learners write short paragraphs on familiar topics",
    "Learners compose simple poems and stories",
    "Learners organize ideas logically in writing",
  ],
  // Social Studies
  Family: [
    "Learners describe roles of different family members",
    "Learners appreciate the importance of family unity",
    "Learners demonstrate responsibility in family tasks",
  ],
  Community: [
    "Learners identify various community helpers",
    "Learners describe services provided by community members",
    "Learners participate in community service activities",
  ],
  Culture: [
    "Learners describe cultural practices in their community",
    "Learners appreciate diverse cultural traditions",
    "Learners participate in cultural events and festivals",
  ],
  "Natural Resources": [
    "Learners identify natural resources in their locality",
    "Learners describe uses of natural resources",
    "Learners practice conservation of natural resources",
  ],
  // Science and Technology
  Plants: [
    "Learners identify common plants in the environment",
    "Learners describe parts of a plant and their functions",
    "Learners grow plants and record their growth",
    "Learners appreciate the importance of plants",
  ],
  Animals: [
    "Learners identify common animals and their habitats",
    "Learners classify animals according to characteristics",
    "Learners describe how animals are useful to humans",
  ],
  "Human Body": [
    "Learners identify parts of the human body",
    "Learners describe functions of sense organs",
    "Learners practice good hygiene for body care",
  ],
  Environment: [
    "Learners describe ways to care for the environment",
    "Learners identify sources of water and their uses",
    "Learners sort waste for proper disposal",
  ],
  Energy: [
    "Learners identify sources of energy in daily life",
    "Learners describe uses of light, heat, and sound",
    "Learners practice safety when using electrical appliances",
  ],
  // Religious Education
  "Belief in God": [
    "Learners express understanding of God as the creator",
    "Learners appreciate God's love and care",
    "Learners demonstrate gratitude through prayer",
  ],
  Honesty: [
    "Learners demonstrate honesty in words and actions",
    "Learners tell the truth even when it is difficult",
    "Learners return items that do not belong to them",
  ],
  // Creative Arts
  Drawing: [
    "Learners draw objects from the environment",
    "Learners use different drawing materials creatively",
    "Learners express ideas through drawing",
  ],
  Singing: [
    "Learners sing songs with correct melody and rhythm",
    "Learners sing patriotic and religious songs",
    "Learners use songs to express emotions and ideas",
  ],
  // Agriculture
  Gardening: [
    "Learners prepare a garden for planting",
    "Learners plant and care for vegetables",
    "Learners harvest and use farm produce",
  ],
}

const TEACHER_ACTIVITIES = [
  "Guides learners through examples using real objects",
  "Demonstrates concepts using practical activities",
  "Asks probing questions to promote critical thinking",
  "Supervises group activities and provides support",
  "Provides feedback during and after tasks",
  "Facilitates class discussion on key concepts",
  "Models correct pronunciation and language use",
  "Uses charts and visual aids to explain content",
  "Moves around the class to monitor progress",
  "Differentiates instruction for diverse learners",
  "Gives clear instructions for each learning task",
  "Encourages learners to share their ideas",
  "Uses songs, rhymes, and games to reinforce learning",
  "Conducts demonstration experiments",
  "Provides remediation for learners needing extra support",
]

const LEARNER_ACTIVITIES = [
  "Works in groups to solve problems and tasks",
  "Answers oral questions during class discussion",
  "Completes worksheets and written exercises",
  "Participates actively in class discussions",
  "Presents group findings to the class",
  "Engages in hands-on practical activities",
  "Practices skills individually and in pairs",
  "Sings songs and recites rhymes",
  "Plays educational games related to the topic",
  "Observes demonstrations and takes notes",
  "Draws and labels diagrams in exercise books",
  "Reads aloud and silently from texts",
  "Measures and records data from experiments",
  "Creates models and projects using available materials",
  "Peer-assesses and self-assesses their work",
]

const RESOURCES = [
  "Textbooks",
  "Flashcards",
  "Real objects (realia)",
  "Charts and posters",
  "Worksheets",
  "Digital devices (tablets/laptops)",
  "Classroom environment",
  "Manipulatives (counting beads, blocks)",
  "Songs and audio recordings",
  "Library books",
  "Science equipment",
  "Art and craft materials",
  "Sports equipment",
  "Models and specimens",
  "Weather instruments",
  "Clay and modelling materials",
  "Puppets and props",
  "Wall maps and globes",
]

const ASSESSMENT_METHODS = [
  "Observation",
  "Oral questioning",
  "Written exercise",
  "Group presentation",
  "Practical demonstration",
  "Portfolio assessment",
  "Peer assessment",
  "Self-assessment",
  "Project work",
  "Checklist assessment",
  "Anecdotal records",
  "Quiz",
]

const REMARKS = [
  "Lesson well received. Learners demonstrated understanding.",
  "Most learners achieved expected competency level.",
  "Some learners need reinforcement in key areas.",
  "Excellent participation and engagement observed.",
  "Learners enjoyed the activities and participated actively.",
  "Lesson proceeded as planned. All objectives achieved.",
  "Majority of learners grasped the concept with minimal support.",
  "Learners showed great creativity and critical thinking.",
  "Some learners required additional scaffolding during tasks.",
  "Very interactive lesson with high learner engagement.",
]

const coreCompetencies = [
  "Communication and Collaboration",
  "Critical Thinking and Problem Solving",
  "Creativity and Imagination",
  "Citizenship",
  "Digital Literacy",
  "Learning to Learn",
  "Self-Efficacy",
]

const values = [
  "Love",
  "Responsibility",
  "Respect",
  "Unity",
  "Peace",
  "Integrity",
  "Patriotism",
]

const pciOptions = [
  "Life Skills and Values Education",
  "Health Education",
  "Environmental Education",
  "Citizenship Education",
  "Peace Education",
  "Safety and Security Education",
  "Gender Issues in Education",
  "Drug and Substance Abuse Awareness",
  "Child Rights and Child Protection",
  "HIV and AIDS Education",
  "Parental Empowerment and Engagement",
  "Career Guidance and Mentorship",
]

const SUBSTRAND_COMPETENCY_MAP: Record<string, string[]> = {
  "Number Concepts": ["Critical Thinking and Problem Solving"],
  Counting: ["Critical Thinking and Problem Solving"],
  "Place Value": ["Critical Thinking and Problem Solving", "Digital Literacy"],
  Addition: ["Critical Thinking and Problem Solving", "Self-Efficacy"],
  Subtraction: ["Critical Thinking and Problem Solving", "Self-Efficacy"],
  Multiplication: ["Critical Thinking and Problem Solving", "Self-Efficacy"],
  Division: ["Critical Thinking and Problem Solving", "Self-Efficacy"],
  Fractions: ["Critical Thinking and Problem Solving", "Creativity and Imagination"],
  Length: ["Critical Thinking and Problem Solving", "Digital Literacy"],
  Mass: ["Critical Thinking and Problem Solving", "Digital Literacy"],
  Capacity: ["Critical Thinking and Problem Solving", "Digital Literacy"],
  Time: ["Critical Thinking and Problem Solving", "Digital Literacy"],
  Money: ["Critical Thinking and Problem Solving", "Self-Efficacy", "Citizenship"],
  "Listening and Speaking": ["Communication and Collaboration", "Creativity and Imagination"],
  Conversations: ["Communication and Collaboration", "Citizenship"],
  Reading: ["Communication and Collaboration", "Learning to Learn"],
  "Sentence Construction": ["Communication and Collaboration", "Creativity and Imagination"],
  "Creative Writing": ["Creativity and Imagination", "Communication and Collaboration", "Self-Efficacy"],
  Plants: ["Creativity and Imagination", "Critical Thinking and Problem Solving", "Digital Literacy"],
  Animals: ["Creativity and Imagination", "Critical Thinking and Problem Solving"],
  "Human Body": ["Self-Efficacy", "Learning to Learn"],
  Environment: ["Citizenship", "Critical Thinking and Problem Solving"],
  Energy: ["Critical Thinking and Problem Solving", "Digital Literacy"],
  Family: ["Citizenship", "Communication and Collaboration"],
  Community: ["Citizenship", "Communication and Collaboration"],
  Culture: ["Citizenship", "Creativity and Imagination"],
  "Belief in God": ["Citizenship", "Self-Efficacy"],
  Honesty: ["Communication and Collaboration", "Citizenship"],
  Drawing: ["Creativity and Imagination", "Self-Efficacy"],
  Singing: ["Creativity and Imagination", "Communication and Collaboration"],
  Gardening: ["Self-Efficacy", "Creativity and Imagination", "Citizenship"],
  "Natural Resources": ["Citizenship", "Critical Thinking and Problem Solving", "Digital Literacy"],
}

const SUBSTRAND_VALUE_MAP: Record<string, string[]> = {
  Family: ["Love", "Respect", "Responsibility", "Unity"],
  Community: ["Respect", "Unity", "Responsibility", "Peace"],
  "Belief in God": ["Love", "Respect", "Integrity"],
  Honesty: ["Integrity", "Respect", "Responsibility"],
  Environment: ["Responsibility", "Respect", "Love"],
  "Natural Resources": ["Responsibility", "Respect", "Patriotism"],
  Culture: ["Unity", "Respect", "Peace", "Love"],
  Money: ["Integrity", "Responsibility"],
  Energy: ["Responsibility", "Peace"],
  Plants: ["Responsibility", "Love", "Respect"],
  Animals: ["Responsibility", "Love", "Respect"],
  Gardening: ["Responsibility", "Patriotism", "Love"],
  "Place Value": ["Responsibility", "Self-Efficacy"],
}

const SUBSTRAND_PCI_MAP: Record<string, string[]> = {
  Environment: ["Environmental Education", "Health Education"],
  "Natural Resources": ["Environmental Education", "Citizenship Education"],
  Energy: ["Environmental Education", "Safety and Security Education"],
  "Health and Hygiene": ["Health Education", "Life Skills and Values Education"],
  Safety: ["Safety and Security Education", "Life Skills and Values Education"],
  "Human Body": ["Health Education", "Life Skills and Values Education"],
  "Community Health": ["Health Education", "Citizenship Education"],
  "Drug and Substance Abuse": ["Drug and Substance Abuse Awareness", "Health Education"],
  Family: ["Life Skills and Values Education", "Child Rights and Child Protection"],
  Culture: ["Citizenship Education", "Peace Education"],
  Community: ["Citizenship Education", "Life Skills and Values Education"],
  "Road Safety": ["Safety and Security Education", "Life Skills and Values Education"],
  Plants: ["Environmental Education"],
  Animals: ["Environmental Education"],
  Gardening: ["Environmental Education", "Career Guidance and Mentorship"],
  Money: ["Life Skills and Values Education", "Parental Empowerment and Engagement"],
}

// ====== SEARCHABLE MULTI-SELECT COMPONENT ======

interface SearchableMultiSelectProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  allowCustom?: boolean
  customPlaceholder?: string
}

function SearchableMultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Type to search...",
  allowCustom = false,
  customPlaceholder = "Add custom item...",
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [customValue, setCustomValue] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    if (!search) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, search])

  const toggleOption = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option]
    onChange(next)
  }

  const addCustom = () => {
    const trimmed = customValue.trim()
    if (!trimmed) return
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed])
    }
    setCustomValue("")
    setSearch("")
  }

  const removeChip = (item: string) => {
    onChange(selected.filter((s) => s !== item))
  }

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-1.5 rounded-lg border border-input bg-input/30 px-2.5 py-2 text-sm text-left min-h-10 transition-colors hover:bg-input/50"
        >
          <div className="flex-1 flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">Select {label.toLowerCase()}...</span>
            ) : (
              selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs max-w-[140px]"
                >
                  <span className="truncate">{item}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); removeChip(item) }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); removeChip(item) } }}
                    className="shrink-0 hover:text-primary/70 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filtered.length === 0 && !allowCustom && (
                <p className="px-2 py-3 text-xs text-muted-foreground text-center">No options found</p>
              )}
              {filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleOption(option)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors text-left"
                >
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    selected.includes(option)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border"
                  }`}>
                    {selected.includes(option) && <Check className="h-3 w-3" />}
                  </span>
                  <span className="truncate">{option}</span>
                </button>
              ))}
              {allowCustom && search && (
                <div className="border-t border-border mt-1 pt-1">
                  <div className="flex items-center gap-1 px-2">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder={customPlaceholder}
                      className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom() } }}
                    />
                    <button
                      type="button"
                      onClick={addCustom}
                      className="shrink-0 rounded p-1 text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ====== SIMPLE MULTI-SELECT DROPDOWN (no search) ======

interface MultiSelectProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleOption = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option]
    )
  }

  const removeChip = (item: string) => {
    onChange(selected.filter((s) => s !== item))
  }

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-1.5 rounded-lg border border-input bg-input/30 px-2.5 py-2 text-sm text-left min-h-10 transition-colors hover:bg-input/50"
        >
          <div className="flex-1 flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">Select {label.toLowerCase()}...</span>
            ) : (
              selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs max-w-[160px]"
                >
                  <span className="truncate">{item}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); removeChip(item) }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); removeChip(item) } }}
                    className="shrink-0 hover:text-primary/70 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-56 overflow-y-auto p-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors text-left"
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  selected.includes(option)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border"
                }`}>
                  {selected.includes(option) && <Check className="h-3 w-3" />}
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ====== MAIN COMPONENT ======

interface KICDPlan {
  grade: string
  learningArea: string
  strand: string
  subStrand: string
  lessonNumber: string
  duration: string
  outcomes: string[]
  competencies: string[]
  values: string[]
  pcis: string[]
  teacherActivities: string[]
  learnerActivities: string[]
  resources: string[]
  assessmentMethods: string[]
  remarks: string
}

const initialPlan: KICDPlan = {
  grade: "",
  learningArea: "",
  strand: "",
  subStrand: "",
  lessonNumber: "1",
  duration: "40",
  outcomes: [],
  competencies: [],
  values: [],
  pcis: [],
  teacherActivities: [],
  learnerActivities: [],
  resources: [],
  assessmentMethods: [],
  remarks: "",
}

export default function CBCLessonPlanner() {
  const [plan, setPlan] = useState<KICDPlan>({ ...initialPlan })
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    trackToolUse("cbc_lesson_planner", "tool_open")
  }, [])

  const updateField = <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => {
    setPlan((prev) => ({ ...prev, [key]: value }))
  }

  const learningAreas = plan.grade ? LEARNING_AREAS_BY_GRADE[plan.grade] || [] : []
  const strands = plan.learningArea ? STRANDS_BY_AREA[plan.learningArea] || [] : []
  const subStrands = plan.strand ? SUBSTRANDS[plan.strand] || [] : []

  const suggestedOutcomes = plan.subStrand ? OUTCOMES_BY_SUBSTRAND[plan.subStrand] || [] : []

  const handleStrandChange = (strand: string) => {
    setPlan((prev) => {
      const next = { ...prev, strand, subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] }
      return next
    })
  }

  const handleSubStrandChange = (sub: string) => {
    setPlan((prev) => {
      const autoCompetencies = SUBSTRAND_COMPETENCY_MAP[sub] || []
      const autoValues = SUBSTRAND_VALUE_MAP[sub] || []
      const autoPCIs = SUBSTRAND_PCI_MAP[sub] || []
      return {
        ...prev,
        subStrand: sub,
        outcomes: prev.outcomes.length > 0 ? prev.outcomes : (OUTCOMES_BY_SUBSTRAND[sub]?.slice(0, 2) || []),
        competencies: prev.competencies.length > 0 ? prev.competencies : autoCompetencies,
        values: prev.values.length > 0 ? prev.values : autoValues,
        pcis: prev.pcis.length > 0 ? prev.pcis : autoPCIs,
      }
    })
  }

  const toggleChip = (key: "competencies" | "values" | "pcis", item: string) => {
    setPlan((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((v) => v !== item)
        : [...prev[key], item],
    }))
  }

  const autoGenerateRemarks = () => {
    const random = REMARKS[Math.floor(Math.random() * REMARKS.length)]
    updateField("remarks", random)
    toast.success("Remarks auto-generated")
  }

  const generate = () => {
    if (!plan.grade || !plan.learningArea || !plan.strand) {
      toast.error("Please fill in Grade, Learning Area, and Strand")
      return
    }
    if (plan.outcomes.length === 0) {
      toast.error("Please select at least one Learning Outcome")
      return
    }
    setGenerated(true)
    trackToolUse("cbc_lesson_planner", "generate_lesson")
    toast.success("KICD CBC lesson plan generated")
  }

  const resetForm = () => {
    setPlan({ ...initialPlan })
    setGenerated(false)
    toast.success("Form reset")
  }

  // ====== OUTPUT FORMATTING ======

  const formatPlan = () => {
    const lines = [
      "KICD COMPETENCY-BASED LESSON PLAN",
      "=".repeat(50),
      `Grade: ${plan.grade}`,
      `Learning Area: ${plan.learningArea}`,
      `Strand: ${plan.strand}`,
      `Sub-Strand: ${plan.subStrand || "\u2014"}`,
      `Lesson Number: ${plan.lessonNumber}`,
      `Duration: ${plan.duration} minutes`,
      "",
      "1. SPECIFIC LEARNING OUTCOMES",
      ...plan.outcomes.map((o) => `   \u2022 ${o}`),
      "",
      "2. CORE COMPETENCIES",
      ...(plan.competencies.length ? plan.competencies.map((c) => `   \u2022 ${c}`) : ["   \u2014"]),
      "",
      "3. VALUES",
      ...(plan.values.length ? plan.values.map((v) => `   \u2022 ${v}`) : ["   \u2014"]),
      "",
      "4. PERTINENT & CONTEMPORARY ISSUES (PCIs)",
      ...(plan.pcis.length ? plan.pcis.map((p) => `   \u2022 ${p}`) : ["   \u2014"]),
      "",
      "5. LEARNING ACTIVITIES",
      "   Teacher Activities:",
      ...plan.teacherActivities.map((a) => `      \u2022 ${a}`),
      "   Learner Activities:",
      ...plan.learnerActivities.map((a) => `      \u2022 ${a}`),
      "",
      "6. RESOURCES",
      ...plan.resources.map((r) => `   \u2022 ${r}`),
      "",
      "7. ASSESSMENT METHODS",
      ...plan.assessmentMethods.map((a) => `   \u2022 ${a}`),
      "",
      "8. REMARKS",
      `   ${plan.remarks || "\u2014"}`,
    ]
    return lines.join("\n")
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formatPlan())
    trackToolUse("cbc_lesson_planner", "copy")
    toast.success("Lesson plan copied to clipboard")
  }, [plan])

  const handlePrint = useCallback(() => {
    trackToolUse("cbc_lesson_planner", "print")
    window.print()
  }, [])

  const handlePDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      let y = 20
      const margin = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const maxWidth = pageWidth - margin * 2
      const lineHeight = 7

      const write = (text: string, bold = false, size = 11) => {
        if (y > 275) { doc.addPage(); y = 20 }
        doc.setFontSize(size)
        doc.setFont("helvetica", bold ? "bold" : "normal")
        doc.text(text, margin, y)
        y += lineHeight
      }

      write("KICD COMPETENCY-BASED LESSON PLAN", true, 14)
      y += 3

      const fields = [
        ["Grade", plan.grade],
        ["Learning Area", plan.learningArea],
        ["Strand", plan.strand],
        ["Sub-Strand", plan.subStrand || "\u2014"],
        ["Lesson No.", plan.lessonNumber],
        ["Duration", `${plan.duration} min`],
      ]
      fields.forEach(([label, value]) => {
        write(`${label}: ${value}`, false, 10)
      })

      y += 3
      const section = (title: string, items: string[]) => {
        if (y > 260) { doc.addPage(); y = 20 }
        write(title, true, 11)
        if (items.length === 0) { write("   \u2014", false, 10); return }
        items.forEach((item) => {
          if (y > 270) { doc.addPage(); y = 20 }
          const lines = doc.splitTextToSize(`   \u2022 ${item}`, maxWidth)
          lines.forEach((l: string) => write(l, false, 10))
        })
        y += 2
      }

      section("1. Specific Learning Outcomes", plan.outcomes)
      section("2. Core Competencies", plan.competencies)
      section("3. Values", plan.values)
      section("4. Pertinent & Contemporary Issues", plan.pcis)

      if (y > 250) { doc.addPage(); y = 20 }
      write("5. Learning Activities", true, 11)
      write("   Teacher Activities:", true, 10)
      plan.teacherActivities.forEach((a) => {
        if (y > 270) { doc.addPage(); y = 20 }
        const lines = doc.splitTextToSize(`      \u2022 ${a}`, maxWidth)
        lines.forEach((l: string) => write(l, false, 10))
      })
      write("   Learner Activities:", true, 10)
      plan.learnerActivities.forEach((a) => {
        if (y > 270) { doc.addPage(); y = 20 }
        const lines = doc.splitTextToSize(`      \u2022 ${a}`, maxWidth)
        lines.forEach((l: string) => write(l, false, 10))
      })
      y += 2

      section("6. Resources", plan.resources)
      section("7. Assessment Methods", plan.assessmentMethods)

      if (y > 260) { doc.addPage(); y = 20 }
      write("8. Remarks", true, 11)
      write(`   ${plan.remarks || "\u2014"}`, false, 10)

      doc.save("cbc-lesson-plan.pdf")
      trackDownload("cbc_lesson_planner", "download_pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [plan])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">CBC Lesson Plan Builder</h2>
        <p className="text-sm text-muted-foreground">
          Build full KICD-compliant lesson plans using structured dropdowns, multi-select chips, and auto-suggested CBC components
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          {/* Row 1: Grade, Lesson No, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Grade *</label>
              <select
                value={plan.grade}
                onChange={(e) => {
                  const val = e.target.value
                  setPlan((prev) => ({
                    ...prev,
                    grade: val,
                    learningArea: "",
                    strand: "",
                    subStrand: "",
                    outcomes: [],
                    competencies: [],
                    values: [],
                    pcis: [],
                  }))
                }}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                <option value="">Select grade...</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Lesson Number</label>
              <select
                value={plan.lessonNumber}
                onChange={(e) => updateField("lessonNumber", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                {LESSON_NUMBERS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Duration (minutes)</label>
              <select
                value={plan.duration}
                onChange={(e) => updateField("duration", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Learning Area, Strand, Sub-Strand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learning Area *</label>
              <select
                value={plan.learningArea}
                onChange={(e) => {
                  const val = e.target.value
                  setPlan((prev) => ({
                    ...prev,
                    learningArea: val,
                    strand: "",
                    subStrand: "",
                    outcomes: [],
                    competencies: [],
                    values: [],
                    pcis: [],
                  }))
                }}
                disabled={!plan.grade}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors disabled:opacity-50"
              >
                <option value="">Select learning area...</option>
                {learningAreas.map((la) => <option key={la} value={la}>{la}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Strand *</label>
              <select
                value={plan.strand}
                onChange={(e) => handleStrandChange(e.target.value)}
                disabled={!plan.learningArea}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors disabled:opacity-50"
              >
                <option value="">Select strand...</option>
                {strands.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sub-Strand</label>
              <select
                value={plan.subStrand}
                onChange={(e) => handleSubStrandChange(e.target.value)}
                disabled={!plan.strand}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors disabled:opacity-50"
              >
                <option value="">Select sub-strand...</option>
                {subStrands.map((ss) => <option key={ss} value={ss}>{ss}</option>)}
              </select>
            </div>
          </div>

          <Separator />

          {/* Specific Learning Outcomes - Searchable Multi-Select */}
          <div className="space-y-2">
            <SearchableMultiSelect
              label="Specific Learning Outcomes"
              options={suggestedOutcomes}
              selected={plan.outcomes}
              onChange={(val) => updateField("outcomes", val)}
              placeholder="Search outcomes..."
              allowCustom
              customPlaceholder="Type a custom outcome..."
            />
            {plan.subStrand && suggestedOutcomes.length === 0 && (
              <p className="text-xs text-amber-500">
                No preloaded outcomes for this sub-strand. Use "Add custom outcome" above.
              </p>
            )}
          </div>

          <Separator />

          {/* Core Competencies - Toggle Chips */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Core Competencies</label>
            <div className="flex flex-wrap gap-1.5">
              {coreCompetencies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChip("competencies", c)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    plan.competencies.includes(c)
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-muted/20 border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Values - Toggle Chips */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Values</label>
            <div className="flex flex-wrap gap-1.5">
              {values.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleChip("values", v)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    plan.values.includes(v)
                      ? "bg-green-500/20 border-green-500 text-green-500"
                      : "bg-muted/20 border-border text-muted-foreground hover:border-green-500/50"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* PCIs - Toggle Chips */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Pertinent & Contemporary Issues (PCIs)</label>
            <div className="flex flex-wrap gap-1.5">
              {pciOptions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleChip("pcis", p)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    plan.pcis.includes(p)
                      ? "bg-purple-500/20 border-purple-500 text-purple-500"
                      : "bg-muted/20 border-border text-muted-foreground hover:border-purple-500/50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Teacher Activities - Multi-Select */}
          <MultiSelect
            label="Teacher Activities"
            options={TEACHER_ACTIVITIES}
            selected={plan.teacherActivities}
            onChange={(val) => updateField("teacherActivities", val)}
          />

          {/* Learner Activities - Multi-Select */}
          <MultiSelect
            label="Learner Activities"
            options={LEARNER_ACTIVITIES}
            selected={plan.learnerActivities}
            onChange={(val) => updateField("learnerActivities", val)}
          />

          {/* Resources - Multi-Select */}
          <MultiSelect
            label="Resources"
            options={RESOURCES}
            selected={plan.resources}
            onChange={(val) => updateField("resources", val)}
          />

          {/* Assessment Methods - Multi-Select */}
          <MultiSelect
            label="Assessment Methods"
            options={ASSESSMENT_METHODS}
            selected={plan.assessmentMethods}
            onChange={(val) => updateField("assessmentMethods", val)}
          />

          <Separator />

          {/* Remarks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Remarks</label>
              <Button variant="ghost" size="xs" type="button" onClick={autoGenerateRemarks}>
                <Sparkles className="h-3 w-3" /> Auto-generate
              </Button>
            </div>
            <select
              value={plan.remarks}
              onChange={(e) => updateField("remarks", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
            >
              <option value="">Select remarks...</option>
              {REMARKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={generate} className="flex-1">
              <BookOpen className="h-4 w-4" /> Generate KICD Lesson Plan
            </Button>
            <Button variant="outline" onClick={resetForm}>
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ====== OUTPUT ====== */}
      {generated && (
        <Card className="border-primary/30 print:border-primary/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold">Generated KICD Lesson Plan</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="outline" size="xs" onClick={handlePDF}>
                  <FileDown className="h-3.5 w-3.5" /> PDF
                </Button>
                <Button variant="outline" size="xs" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 text-sm space-y-3 leading-relaxed">
              <div className="font-bold text-base">KICD COMPETENCY-BASED LESSON PLAN</div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div><span className="font-semibold">Grade:</span> {plan.grade}</div>
                <div><span className="font-semibold">Learning Area:</span> {plan.learningArea}</div>
                <div><span className="font-semibold">Strand:</span> {plan.strand}</div>
                <div><span className="font-semibold">Sub-Strand:</span> {plan.subStrand || "\u2014"}</div>
                <div><span className="font-semibold">Lesson No:</span> {plan.lessonNumber}</div>
                <div><span className="font-semibold">Duration:</span> {plan.duration} min</div>
              </div>

              <Separator />

              <div>
                <span className="font-semibold">1. Specific Learning Outcomes</span>
                <ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">
                  {plan.outcomes.length ? plan.outcomes.map((o, i) => <li key={i}>{o}</li>) : <li className="list-none text-muted-foreground">\u2014</li>}
                </ul>
              </div>

              <div>
                <span className="font-semibold">2. Core Competencies</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {plan.competencies.length
                    ? plan.competencies.map((c) => <span key={c} className="px-2 py-0.5 rounded-full bg-primary/10 text-xs">{c}</span>)
                    : <span className="text-muted-foreground">\u2014</span>}
                </div>
              </div>

              <div>
                <span className="font-semibold">3. Values</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {plan.values.length
                    ? plan.values.map((v) => <span key={v} className="px-2 py-0.5 rounded-full bg-green-500/10 text-xs">{v}</span>)
                    : <span className="text-muted-foreground">\u2014</span>}
                </div>
              </div>

              <div>
                <span className="font-semibold">4. PCIs</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {plan.pcis.length
                    ? plan.pcis.map((p) => <span key={p} className="px-2 py-0.5 rounded-full bg-purple-500/10 text-xs">{p}</span>)
                    : <span className="text-muted-foreground">\u2014</span>}
                </div>
              </div>

              <div>
                <span className="font-semibold">5. Learning Activities</span>
                <div className="mt-0.5">
                  <p className="font-medium text-xs text-muted-foreground">Teacher:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    {plan.teacherActivities.length
                      ? plan.teacherActivities.map((a, i) => <li key={i}>{a}</li>)
                      : <li className="list-none text-muted-foreground">\u2014</li>}
                  </ul>
                  <p className="font-medium text-xs text-muted-foreground mt-1">Learner:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    {plan.learnerActivities.length
                      ? plan.learnerActivities.map((a, i) => <li key={i}>{a}</li>)
                      : <li className="list-none text-muted-foreground">\u2014</li>}
                  </ul>
                </div>
              </div>

              <div>
                <span className="font-semibold">6. Resources</span>
                <ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">
                  {plan.resources.length
                    ? plan.resources.map((r, i) => <li key={i}>{r}</li>)
                    : <li className="list-none text-muted-foreground">\u2014</li>}
                </ul>
              </div>

              <div>
                <span className="font-semibold">7. Assessment Methods</span>
                <ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">
                  {plan.assessmentMethods.length
                    ? plan.assessmentMethods.map((a, i) => <li key={i}>{a}</li>)
                    : <li className="list-none text-muted-foreground">\u2014</li>}
                </ul>
              </div>

              <div>
                <span className="font-semibold">8. Remarks:</span> {plan.remarks || "\u2014"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
