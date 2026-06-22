"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useBiblicalTheme } from "@/contexts/biblical-theme-context"
import {
  BookOpen, Copy, Printer, FileDown, Plus, X, Search, ChevronDown, RefreshCw, Check, Trash2, Sparkles,
  ChevronLeft, ChevronRight, Save, FileText, Calendar, Clock, Layout, Layers, Target, ClipboardList,
  Download, Upload, Eye, AlertCircle, ChevronLeftCircle, ChevronRightCircle, ArrowLeft, ArrowRight,
  ListChecks, GraduationCap, BarChart3, BookTemplate, StickyNote, FileSpreadsheet, Workflow, Leaf
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

// ====== SMART FALLBACK OUTCOMES BY STRAND ======

const STRAND_FALLBACK_OUTCOMES: Record<string, string[]> = {
  Numbers: [
    "Learners identify and manipulate numbers in various contexts",
    "Learners apply number operations to solve real-life problems",
    "Learners demonstrate understanding of number relationships",
  ],
  Measurement: [
    "Learners use appropriate units to measure different attributes",
    "Learners estimate and compare measurements in daily contexts",
    "Learners apply measurement skills in practical activities",
  ],
  Geometry: [
    "Learners identify and describe geometric shapes in the environment",
    "Learners explore spatial relationships and properties of shapes",
    "Learners create and interpret geometric patterns",
  ],
  Algebra: [
    "Learners recognize and extend patterns in various contexts",
    "Learners use symbols to represent mathematical relationships",
    "Learners solve simple equations using logical reasoning",
  ],
  "Data Handling": [
    "Learners collect and organize data from their environment",
    "Learners represent data using simple graphs and charts",
    "Learners interpret data to make informed decisions",
  ],
  "Listening and Speaking": [
    "Learners demonstrate active listening in various communication contexts",
    "Learners express ideas clearly using appropriate vocabulary",
    "Learners engage in meaningful conversations with peers and adults",
  ],
  Reading: [
    "Learners read grade-appropriate texts with fluency and comprehension",
    "Learners identify main ideas and supporting details in texts",
    "Learners develop vocabulary through contextual reading",
  ],
  Writing: [
    "Learners write coherent sentences and paragraphs on familiar topics",
    "Learners apply correct grammar and punctuation in writing",
    "Learners organize ideas logically in written compositions",
  ],
  Grammar: [
    "Learners identify and use parts of speech correctly",
    "Learners construct grammatically correct sentences",
    "Learners apply language conventions in written and oral communication",
  ],
  Comprehension: [
    "Learners demonstrate understanding of both fiction and non-fiction texts",
    "Learners make predictions and draw conclusions from texts",
    "Learners analyze characters, settings, and events in stories",
  ],
  Environment: [
    "Learners describe the importance of environmental conservation",
    "Learners identify environmental threats in their locality",
    "Learners suggest practical solutions to protect the environment",
  ],
  Energy: [
    "Learners identify different forms of energy in daily life",
    "Learners describe how energy is used in homes and industry",
    "Learners practice energy conservation and safety measures",
  ],
  "Living Things": [
    "Learners identify living and non-living things in the environment",
    "Learners describe characteristics and life processes of organisms",
    "Learners appreciate biodiversity and the need for conservation",
  ],
  Plants: [
    "Learners identify common plants in their locality",
    "Learners describe the importance of plants to humans and animals",
    "Learners demonstrate proper plant care and conservation practices",
  ],
  Animals: [
    "Learners identify common animals and their habitats",
    "Learners classify animals based on observable characteristics",
    "Learners describe the importance of animals to human life",
  ],
  "People and Relationships": [
    "Learners identify different types of relationships in society",
    "Learners demonstrate respect and empathy in interactions",
    "Learners resolve conflicts peacefully using dialogue",
  ],
  "Resources and Economic Activities": [
    "Learners identify natural resources in their community",
    "Learners describe various economic activities in the locality",
    "Learners practice responsible use of community resources",
  ],
  "Political Systems and Governance": [
    "Learners describe the structure of leadership in the community",
    "Learners explain the importance of rules and laws",
    "Learners demonstrate good citizenship in school and community",
  ],
  "Peace and Conflict Resolution": [
    "Learners identify causes of conflict in daily situations",
    "Learners apply conflict resolution strategies peacefully",
    "Learners promote harmony and coexistence in diverse settings",
  ],
  "Visual Arts": [
    "Learners explore different art materials and techniques",
    "Learners create artistic works inspired by the environment",
    "Learners express ideas and emotions through visual art",
  ],
  Music: [
    "Learners identify elements of music including rhythm and melody",
    "Learners sing and perform simple musical pieces",
    "Learners appreciate music from different cultures",
  ],
  "Drama and Theatre": [
    "Learners participate in dramatic activities and role play",
    "Learners express ideas through body movement and dialogue",
    "Learners develop confidence through public performance",
  ],
  Dance: [
    "Learners perform basic dance movements and sequences",
    "Learners create simple dance routines individually and in groups",
    "Learners appreciate dance as a form of cultural expression",
  ],
  "Locomotor Skills": [
    "Learners demonstrate fundamental locomotor movements correctly",
    "Learners combine locomotor skills in games and activities",
    "Learners develop coordination and body awareness through movement",
  ],
  "Non-locomotor Skills": [
    "Learners demonstrate balance and stability in various positions",
    "Learners perform bending, stretching, and twisting movements",
    "Learners control body movements during physical activities",
  ],
  "Manipulative Skills": [
    "Learners demonstrate throwing, catching, and kicking skills",
    "Learners manipulate objects with increasing control and accuracy",
    "Learners apply manipulative skills in games and sports",
  ],
  "Health and Hygiene": [
    "Learners practice proper personal hygiene routines daily",
    "Learners explain the importance of cleanliness for health",
    "Learners demonstrate healthy habits in school and at home",
  ],
  Safety: [
    "Learners identify potential safety hazards in different environments",
    "Learners apply safety rules at home, school, and on the road",
    "Learners demonstrate basic first aid and emergency response",
  ],
  Soil: [
    "Learners identify different soil types in the locality",
    "Learners describe the importance of soil for plant growth",
    "Learners practice soil conservation techniques",
  ],
  "Food Production": [
    "Learners identify food crops grown in the community",
    "Learners describe methods of food preservation and storage",
    "Learners appreciate the value of agriculture in daily life",
  ],
  "Food and Nutrition": [
    "Learners classify foods into different food groups",
    "Learners plan balanced meals for healthy living",
    "Learners practice proper food hygiene and safety",
  ],
  Entrepreneurship: [
    "Learners identify business opportunities in the community",
    "Learners develop basic entrepreneurial and financial skills",
    "Learners demonstrate responsible use of money and resources",
  ],
  Weather: [
    "Learners observe and describe different weather conditions",
    "Learners record weather data using simple instruments",
    "Learners explain how weather affects daily activities",
  ],
  Water: [
    "Learners identify sources of water in the environment",
    "Learners describe the importance of water for life",
    "Learners practice water conservation and safe usage",
  ],
  "Personal Hygiene": [
    "Learners demonstrate proper hand washing and dental care",
    "Learners maintain personal cleanliness and grooming",
    "Learners develop lifelong healthy hygiene habits",
  ],
  Creation: [
    "Learners appreciate the wonders of creation in nature",
    "Learners describe the order and purpose in the natural world",
    "Learners demonstrate gratitude and care for creation",
  ],
  "Faith and Beliefs": [
    "Learners express understanding of their faith and beliefs",
    "Learners respect diverse religious beliefs and practices",
    "Learners demonstrate values derived from faith traditions",
  ],
  "Moral Values": [
    "Learners demonstrate honesty, kindness, and respect in actions",
    "Learners take responsibility for their choices and behavior",
    "Learners practice forgiveness and empathy in relationships",
  ],
  "Worship and Rituals": [
    "Learners participate in worship activities with reverence",
    "Learners describe the significance of religious rituals",
    "Learners appreciate the role of prayer in spiritual life",
  ],
  "Technical Skills": [
    "Learners identify and use basic tools and equipment safely",
    "Learners apply technical skills to create simple projects",
    "Learners demonstrate problem-solving through practical tasks",
  ],
  "Career Awareness": [
    "Learners identify different careers and their requirements",
    "Learners describe the skills needed for various occupations",
    "Learners set personal goals aligned with career interests",
  ],
  "Personal Health": [
    "Learners describe the components of a healthy lifestyle",
    "Learners practice physical fitness and personal wellness",
    "Learners make informed decisions about personal health",
  ],
  Nutrition: [
    "Learners classify foods according to their nutritional value",
    "Learners plan and prepare simple healthy meals",
    "Learners evaluate food choices for balanced nutrition",
  ],
  "Disease Prevention": [
    "Learners describe common diseases and their causes",
    "Learners practice preventive measures against diseases",
    "Learners demonstrate understanding of immunization and health screening",
  ],
  "Reproductive Health": [
    "Learners describe physical and emotional changes during adolescence",
    "Learners practice personal care and hygiene during development",
    "Learners demonstrate respect for themselves and others",
  ],
  "Substance Abuse": [
    "Learners identify harmful substances and their effects",
    "Learners develop resistance skills against peer pressure",
    "Learners make healthy choices regarding substance use",
  ],
  God: [
    "Learners express understanding of God as creator",
    "Learners appreciate God's love and care in daily life",
    "Learners demonstrate gratitude and reverence through prayer",
  ],
  Family: [
    "Learners describe roles and responsibilities of family members",
    "Learners demonstrate love, respect, and cooperation in the family",
    "Learners contribute positively to family activities",
  ],
  Community: [
    "Learners identify different groups and roles in the community",
    "Learners participate in community service activities",
    "Learners demonstrate responsibility towards community well-being",
  ],
  Culture: [
    "Learners describe cultural practices and traditions in their community",
    "Learners participate in cultural events with appreciation",
    "Learners respect and value cultural diversity",
  ],
  Time: [
    "Learners tell time using analog and digital clocks",
    "Learners organize daily activities according to time schedules",
    "Learners demonstrate punctuality and time management skills",
  ],
  Money: [
    "Learners identify Kenyan currency and its value",
    "Learners perform simple monetary transactions",
    "Learners practice responsible spending and saving habits",
  ],
  "Natural Resources": [
    "Learners identify natural resources in Kenya",
    "Learners describe sustainable use of natural resources",
    "Learners participate in conservation of natural resources",
  ],
  "Force and Motion": [
    "Learners describe the effects of forces on objects",
    "Learners demonstrate understanding of motion and direction",
    "Learners apply concepts of force in simple machines",
  ],
  Materials: [
    "Learners identify properties of different materials",
    "Learners classify materials based on their characteristics",
    "Learners select appropriate materials for specific purposes",
  ],
  Technology: [
    "Learners identify simple technological tools in daily use",
    "Learners use digital devices responsibly for learning",
    "Learners demonstrate awareness of technology in society",
  ],
  "Scientific Investigation": [
    "Learners make observations and ask questions about phenomena",
    "Learners conduct simple experiments following procedures",
    "Learners record and communicate findings from investigations",
  ],
}

function getSmartFallbackOutcomes(strand: string): string[] {
  const fallback = STRAND_FALLBACK_OUTCOMES[strand]
  if (fallback) return [...fallback]
  return [
    `Learners demonstrate understanding of key concepts in ${strand.toLowerCase()}`,
    `Learners apply ${strand.toLowerCase()} knowledge in real-life situations`,
    `Learners develop critical thinking skills through ${strand.toLowerCase()} activities`,
  ]
}

// ====== LOCAL STORAGE KEY ======

const STORAGE_KEY = "toolforge_lesson_plans"

interface SavedPlan {
  id: string
  name: string
  createdAt: string
  plan: KICDPlan
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

// ====== SIMPLE MULTI-SELECT DROPDOWN ======

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

// ====== COMPLIANCE METER ======

interface ComplianceBreakdown {
  label: string
  weight: number
  earned: boolean
  deduction: number
}

function ComplianceMeter({ plan }: { plan: KICDPlan }) {
  const breakdown: ComplianceBreakdown[] = useMemo(() => [
    { label: "Grade selected", weight: 8, earned: !!plan.grade, deduction: 0 },
    { label: "Learning Area selected", weight: 8, earned: !!plan.learningArea, deduction: 0 },
    { label: "Strand mapped", weight: 12, earned: !!plan.strand, deduction: 0 },
    { label: "Sub-Strand selected", weight: 10, earned: !!plan.subStrand, deduction: 0 },
    { label: "Specific Learning Outcomes", weight: 15, earned: plan.outcomes.length >= 2, deduction: 0 },
    { label: "Core Competencies", weight: 10, earned: plan.competencies.length >= 2, deduction: 0 },
    { label: "Values integrated", weight: 8, earned: plan.values.length >= 2, deduction: 0 },
    { label: "PCIs addressed", weight: 8, earned: plan.pcis.length >= 1, deduction: 0 },
    { label: "Teacher Activities", weight: 6, earned: plan.teacherActivities.length >= 2, deduction: 0 },
    { label: "Learner Activities", weight: 6, earned: plan.learnerActivities.length >= 2, deduction: 0 },
    { label: "Assessment Methods", weight: 5, earned: plan.assessmentMethods.length >= 2, deduction: 0 },
    { label: "Remarks recorded", weight: 4, earned: !!plan.remarks, deduction: 0 },
  ], [plan])

  const score = useMemo(() => {
    let s = 0
    breakdown.forEach((b) => { if (b.earned) s += b.weight })
    return Math.min(100, s)
  }, [breakdown])

  const missing = useMemo(() => {
    return breakdown
      .filter((b) => !b.earned)
      .map((b) => ({ label: b.label, deduction: b.weight }))
  }, [breakdown])

  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
  const statusLabel = score >= 80 ? "KICD-ready" : score >= 50 ? "Partially compliant" : "Incomplete"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">CBC Compliance Score</label>
        <span className="text-xs font-bold tabular-nums" style={{ color: score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444' }}>{score}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-[10px] font-medium ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
        Status: {statusLabel}
      </p>
      {missing.length > 0 && (
        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground font-medium">Missing:</p>
          {missing.map((m) => (
            <div key={m.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="text-red-400">\u2212</span>
              <span className="flex-1">{m.label}</span>
              <span className="tabular-nums text-red-400">\u2212{m.deduction}%</span>
            </div>
          ))}
        </div>
      )}
      {missing.length === 0 && (
        <p className="text-[10px] text-green-600">All sections complete. Ready for KICD submission.</p>
      )}
    </div>
  )
}

// ====== WEEKLY PLANNER MODAL ======

interface WeeklyPlan {
  monday: KICDPlan
  tuesday: KICDPlan
  wednesday: KICDPlan
  thursday: KICDPlan
  friday: KICDPlan
}

function createEmptyPlan(): KICDPlan {
  return {
    grade: "", learningArea: "", strand: "", subStrand: "",
    lessonNumber: "1", duration: "40", outcomes: [],
    competencies: [], values: [], pcis: [],
    teacherActivities: [], learnerActivities: [],
    resources: [], assessmentMethods: [], remarks: "",
  }
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

const STEPS = [
  { id: 1, label: "Lesson Setup", icon: Settings, desc: "Grade, duration & learning area" },
  { id: 2, label: "Curriculum", icon: BookTemplate, desc: "Strand, sub-strand & outcomes" },
  { id: 3, label: "Competencies", icon: GraduationCap, desc: "Competencies, values & PCIs" },
  { id: 4, label: "Activities", icon: Workflow, desc: "Teacher & learner activities" },
  { id: 5, label: "Assessment", icon: ClipboardList, desc: "Methods & remarks" },
  { id: 6, label: "Preview", icon: Eye, desc: "Review & export" },
]

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const
type DayKey = keyof WeeklyPlan

// ====== BIBLICAL VERSES FOR OPTIONAL REFLECTION ======
interface BibleVerse { ref: string; text: string; explanation: string }

const BIBLE_VERSES: BibleVerse[] = [
  { ref: "Proverbs 1:7", text: "The fear of the Lord is the beginning of knowledge", explanation: "This verse teaches that reverence for God is the foundation of all true learning, connecting wisdom with humility." },
  { ref: "Proverbs 2:6", text: "For the Lord gives wisdom; from his mouth come knowledge and understanding", explanation: "This verse reminds us that all wisdom and understanding ultimately come from God, making Him the source of true education." },
  { ref: "Proverbs 9:10", text: "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding", explanation: "This verse reinforces that wisdom begins with reverence for God and that knowing Him leads to true understanding." },
  { ref: "Proverbs 22:6", text: "Train up a child in the way he should go; even when he is old he will not depart from it", explanation: "This verse emphasizes the importance of early instruction and the lasting impact of godly teaching and mentorship." },
  { ref: "Psalm 119:66", text: "Teach me knowledge and good judgment, for I trust your commands", explanation: "This verse connects the pursuit of knowledge and good judgment with trust in God's guidance." },
  { ref: "Psalm 32:8", text: "I will instruct you and teach you in the way you should go", explanation: "This verse assures that God is our ultimate teacher, guiding us in the right path." },
  { ref: "Isaiah 54:13", text: "All your children shall be taught by the Lord, and great shall be the peace of your children", explanation: "This verse promises that when children are taught by the Lord, they will experience great peace." },
  { ref: "Deuteronomy 6:7", text: "You shall teach them diligently to your children", explanation: "This verse calls for the faithful and diligent teaching of God's ways to the next generation." },
  { ref: "2 Timothy 3:16", text: "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction", explanation: "This verse affirms the divine origin and practical value of Scripture for teaching and training in righteousness." },
  { ref: "Matthew 5:14", text: "You are the light of the world. A city set on a hill cannot be hidden", explanation: "This verse encourages learners to be positive influences in their communities, shining as examples of good character." },
  { ref: "Colossians 3:23", text: "Whatever you do, work heartily, as for the Lord and not for men", explanation: "This verse teaches diligence and wholehearted effort in all tasks, connecting work with service to God." },
  { ref: "James 1:5", text: "If any of you lacks wisdom, let him ask God, who gives generously", explanation: "This verse encourages learners to seek wisdom from God, who gives freely to all who ask." },
  { ref: "Proverbs 18:15", text: "An intelligent heart acquires knowledge, and the ear of the wise seeks knowledge", explanation: "This verse highlights the value of an eager mind that actively seeks knowledge and understanding." },
  { ref: "Luke 6:40", text: "A disciple is not above his teacher, but everyone when he is fully trained will be like his teacher", explanation: "This verse underscores the influence of a teacher and the transformative goal of education." },
  { ref: "Genesis 2:15", text: "The Lord God took the man and put him in the Garden of Eden to work it and keep it", explanation: "This verse teaches stewardship and responsible care of God's creation, aligning with environmental conservation." },
  { ref: "Proverbs 11:3", text: "The integrity of the upright guides them, but the crookedness of the treacherous destroys them", explanation: "This verse connects integrity with guidance and warns against dishonesty." },
  { ref: "Matthew 5:9", text: "Blessed are the peacemakers, for they shall be called sons of God", explanation: "This verse blesses those who work for peace, encouraging conflict resolution and harmony." },
  { ref: "Proverbs 10:9", text: "Whoever walks in integrity walks securely, but he who makes his ways crooked will be found out", explanation: "This verse teaches that integrity leads to security and that dishonesty is ultimately exposed." },
  { ref: "1 Corinthians 13:4-7", text: "Love is patient and kind; love does not envy or boast; it is not arrogant", explanation: "This passage defines love as patient, kind, and selfless, forming the foundation of healthy relationships." },
  { ref: "Psalm 133:1", text: "Behold, how good and pleasant it is when brothers dwell in unity", explanation: "This verse celebrates the beauty of unity and harmony among people." },
  { ref: "Philippians 2:3", text: "Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves", explanation: "This verse teaches humility and respect for others, placing their needs above our own." },
  { ref: "Mark 10:45", text: "For even the Son of Man came not to be served but to serve, and to give his life as a ransom for many", explanation: "This verse exemplifies servant leadership, teaching that true greatness comes through serving others." },
  { ref: "Exodus 20:12", text: "Honor your father and your mother, that your days may be long in the land", explanation: "This commandment teaches respect for parents and authority figures." },
  { ref: "Leviticus 19:18", text: "You shall love your neighbor as yourself", explanation: "This verse teaches love for others as a fundamental moral duty." },
  { ref: "Micah 6:8", text: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness", explanation: "This verse summarizes God's requirements: justice, kindness, and walking humbly with God." },
  { ref: "Galatians 5:22-23", text: "The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control", explanation: "This passage lists the virtues that form good character, aligning with values education." },
  { ref: "Romans 12:10", text: "Love one another with brotherly affection. Outdo one another in showing honor", explanation: "This verse encourages mutual respect, honor, and genuine care for others." },
  { ref: "Ephesians 4:32", text: "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you", explanation: "This verse teaches kindness, compassion, and forgiveness as essential Christian virtues." },
  { ref: "1 Corinthians 6:19", text: "Do you not know that your body is a temple of the Holy Spirit within you?", explanation: "This verse teaches that our bodies are sacred and should be treated with respect and care." },
  { ref: "Proverbs 22:3", text: "The prudent sees danger and hides himself, but the simple go on and suffer for it", explanation: "This verse teaches wisdom and caution, encouraging learners to make safe and prudent choices." },
  { ref: "Philippians 4:13", text: "I can do all things through him who strengthens me", explanation: "This verse teaches that true strength and ability come from God, encouraging confidence and perseverance." },
  { ref: "Revelation 7:9", text: "Before me was a great multitude that no one could count, from every nation, tribe, people and language", explanation: "This verse reveals the beauty of diversity, showing that people from every culture are valued by God." },
  { ref: "Luke 16:11", text: "If then you have not been faithful in the unrighteous wealth, who will entrust to you the true riches?", explanation: "This verse teaches that faithfulness in handling material resources reflects our character and trustworthiness." },
  { ref: "Exodus 20:12", text: "Honor your father and your mother, that your days may be long in the land", explanation: "This commandment teaches respect for parents and authority, forming the foundation of family life." },
  { ref: "Leviticus 19:18", text: "You shall love your neighbor as yourself", explanation: "This verse teaches love for others as a fundamental moral duty and the basis for healthy relationships." },
]

// ====== STRAND-BASED VERSE SUGGESTION RULES ======
interface VerseSuggestion {
  verseRef: string
  connection: string
  explanation: string
}

const VERSE_MAP_BY_STRAND: Record<string, VerseSuggestion> = {
  Environment: {
    verseRef: "Genesis 2:15",
    connection: "This lesson on environmental conservation reinforces stewardship, responsibility, and care for creation.",
    explanation: "The verse teaches that humanity is entrusted with caring for God's creation, making environmental stewardship a sacred duty.",
  },
  "Living Things": {
    verseRef: "Genesis 2:15",
    connection: "This lesson on living things reinforces respect for God's creation and our responsibility to care for all forms of life.",
    explanation: "The verse reminds us that all living things are part of God's creation and deserve our care and respect.",
  },
  "Natural Resources": {
    verseRef: "Genesis 2:15",
    connection: "This lesson on natural resources reinforces responsible use and stewardship of the resources God has provided.",
    explanation: "The verse teaches that we are placed on earth to work it and keep it, emphasizing sustainable use of resources.",
  },
  "People and Relationships": {
    verseRef: "1 Corinthians 13:4-7",
    connection: "This lesson on relationships reinforces love, patience, and kindness as foundations for healthy interactions.",
    explanation: "This passage defines love as patient, kind, and selfless, providing a biblical model for all relationships.",
  },
  "Political Systems and Governance": {
    verseRef: "Proverbs 11:3",
    connection: "This lesson on governance reinforces the importance of integrity and honesty in leadership.",
    explanation: "The verse connects integrity with guidance, teaching that upright leaders lead their communities well.",
  },
  "Peace and Conflict Resolution": {
    verseRef: "Matthew 5:9",
    connection: "This lesson on peace and conflict resolution reinforces the value of peacemaking and reconciliation.",
    explanation: "The verse blesses peacemakers, affirming that those who work for peace reflect God's character.",
  },
  "Moral Values": {
    verseRef: "Micah 6:8",
    connection: "This lesson on moral values reinforces justice, kindness, and humility as foundational virtues.",
    explanation: "The verse summarizes what God requires: doing justice, loving kindness, and walking humbly.",
  },
  "Community Life": {
    verseRef: "Psalm 133:1",
    connection: "This lesson on community life reinforces the beauty and importance of unity and harmony.",
    explanation: "The verse celebrates how good and pleasant it is when people live together in unity.",
  },
  "Faith and Beliefs": {
    verseRef: "Proverbs 9:10",
    connection: "This lesson on faith and beliefs reinforces that true wisdom begins with reverence for God.",
    explanation: "The verse teaches that the fear of the Lord is the beginning of wisdom, connecting faith with knowledge.",
  },
  "Energy": {
    verseRef: "Colossians 3:23",
    connection: "This lesson on energy reinforces diligence and wholehearted effort in all tasks.",
    explanation: "The verse teaches us to work heartily in everything we do, as service to God.",
  },
  Numbers: {
    verseRef: "Proverbs 18:15",
    connection: "This lesson on numbers reinforces the value of an eager mind that actively seeks understanding.",
    explanation: "The verse highlights how an intelligent heart acquires knowledge and the ear of the wise seeks it.",
  },
  Measurement: {
    verseRef: "Proverbs 18:15",
    connection: "This lesson on measurement reinforces precision, accuracy, and the pursuit of knowledge.",
    explanation: "The verse encourages the acquisition of knowledge and understanding through careful attention.",
  },
  Algebra: {
    verseRef: "Proverbs 2:6",
    connection: "This lesson on Algebra reinforces that understanding and wisdom come from God as the ultimate source.",
    explanation: "The verse reminds us that God gives wisdom, knowledge, and understanding.",
  },
  "Listening and Speaking": {
    verseRef: "James 1:5",
    connection: "This lesson on communication reinforces the importance of seeking wisdom to speak and listen well.",
    explanation: "The verse encourages asking God for wisdom, which He gives generously.",
  },
  Reading: {
    verseRef: "2 Timothy 3:16",
    connection: "This lesson on reading reinforces the value of Scripture and written knowledge for instruction.",
    explanation: "The verse affirms that all Scripture is profitable for teaching, reproof, and correction.",
  },
  Writing: {
    verseRef: "Proverbs 22:6",
    connection: "This lesson on writing reinforces the importance of training and instruction that lasts a lifetime.",
    explanation: "The verse promises that early training leaves a lasting impact that endures into old age.",
  },
  "Health and Hygiene": {
    verseRef: "1 Corinthians 6:19",
    connection: "This lesson on health reinforces that our bodies are sacred and should be cared for respectfully.",
    explanation: "The verse teaches that our bodies are temples of the Holy Spirit, calling us to care for them.",
  },
  Safety: {
    verseRef: "Proverbs 22:3",
    connection: "This lesson on safety reinforces prudence, caution, and wise decision-making.",
    explanation: "The verse teaches the importance of being alert to danger and taking appropriate precautions.",
  },
}

const VERSE_MAP_BY_VALUE: Record<string, VerseSuggestion> = {
  Love: {
    verseRef: "1 Corinthians 13:4-7",
    connection: "This lesson's focus on love reinforces patience, kindness, and selflessness in relationships.",
    explanation: "This passage defines love as patient, kind, and not self-seeking, providing the biblical standard for love.",
  },
  Respect: {
    verseRef: "Philippians 2:3",
    connection: "This lesson's focus on respect reinforces humility and considering others as more important than ourselves.",
    explanation: "The verse teaches that true respect involves humility and valuing others above ourselves.",
  },
  Responsibility: {
    verseRef: "Colossians 3:23",
    connection: "This lesson's focus on responsibility reinforces working heartily and with dedication in all tasks.",
    explanation: "The verse teaches us to do everything with wholehearted effort, as working for the Lord.",
  },
  Unity: {
    verseRef: "Psalm 133:1",
    connection: "This lesson's focus on unity reinforces the beauty and strength of living together in harmony.",
    explanation: "The verse celebrates how good and pleasant unity is among people.",
  },
  Integrity: {
    verseRef: "Proverbs 10:9",
    connection: "This lesson's focus on integrity reinforces walking securely through honest and upright living.",
    explanation: "The verse teaches that integrity leads to security and a clear conscience before God.",
  },
  Peace: {
    verseRef: "Matthew 5:9",
    connection: "This lesson's focus on peace reinforces the blessedness of peacemaking and reconciliation.",
    explanation: "The verse blesses peacemakers, calling them children of God.",
  },
  Patriotism: {
    verseRef: "Exodus 20:12",
    connection: "This lesson's focus on patriotism reinforces honoring our nation and its institutions.",
    explanation: "The verse teaches honor and respect, which extends to our nation and community.",
  },
  "Self-Efficacy": {
    verseRef: "Philippians 4:13",
    connection: "This lesson's focus on self-efficacy reinforces confidence through God's strength.",
    explanation: "The verse teaches that true confidence comes from God who strengthens us.",
  },
}

const VERSE_MAP_BY_SUBSTRAND: Record<string, VerseSuggestion> = {
  Family: {
    verseRef: "Exodus 20:12",
    connection: "This lesson on family reinforces honor, respect, and love within family relationships.",
    explanation: "The commandment to honor parents establishes the foundation for healthy family life.",
  },
  Community: {
    verseRef: "Psalm 133:1",
    connection: "This lesson on community reinforces unity, cooperation, and mutual support.",
    explanation: "The verse celebrates the beauty of people living together in harmony.",
  },
  "Belief in God": {
    verseRef: "Proverbs 9:10",
    connection: "This lesson on belief in God reinforces that true wisdom begins with reverence for God.",
    explanation: "The verse teaches that the fear of the Lord is the foundation of knowledge and wisdom.",
  },
  Honesty: {
    verseRef: "Proverbs 11:3",
    connection: "This lesson on honesty reinforces that integrity guides and protects those who walk uprightly.",
    explanation: "The verse teaches that honesty and integrity provide guidance and security.",
  },
  Environment: {
    verseRef: "Genesis 2:15",
    connection: "This lesson on the environment reinforces stewardship and responsible care of God's creation.",
    explanation: "The verse teaches that we are placed on earth to care for and keep it.",
  },
  Culture: {
    verseRef: "Revelation 7:9",
    connection: "This lesson on culture reinforces respect for diversity and the value of every culture.",
    explanation: "The verse reveals God's heart for all nations and cultures, showing the value of diversity.",
  },
  Money: {
    verseRef: "Luke 16:11",
    connection: "This lesson on money reinforces faithfulness, integrity, and wise stewardship of resources.",
    explanation: "The verse teaches that faithfulness in handling money reflects our character.",
  },
}

const CURRICULUM_CONNECTION_MAP: Record<string, string> = {
  Environment: "Environmental conservation reinforces stewardship, responsibility, and care for God's creation.",
  "Living Things": "the study of living things reinforces respect for all forms of life as part of God's creation.",
  "Natural Resources": "the responsible use of natural resources reinforces our duty as stewards of God's provision.",
  "People and Relationships": "relationships reinforce love, patience, kindness, and mutual respect.",
  "Political Systems and Governance": "governance and leadership reinforce the importance of integrity and justice.",
  "Peace and Conflict Resolution": "peace education reinforces the value of peacemaking, reconciliation, and harmony.",
  "Moral Values": "moral values reinforce the biblical foundations of justice, kindness, and humility.",
  "Community Life": "community life reinforces the beauty of unity, cooperation, and mutual support.",
  "Faith and Beliefs": "faith and beliefs reinforce that true wisdom begins with reverence for God.",
  Numbers: "mathematical concepts reinforce the order and precision of God's creation.",
  Measurement: "measurement reinforces precision, accuracy, and the value of careful observation.",
  Algebra: "algebra reinforces logical thinking and the beauty of patterns in God's creation.",
  "Listening and Speaking": "communication reinforces the importance of wise speech and careful listening.",
  Reading: "reading reinforces the value of written knowledge and the importance of instruction.",
  Writing: "writing reinforces the importance of diligent practice and clear expression.",
}

const VALUES_ADVISORY_ALL: string[] = [
  "Love", "Respect", "Responsibility", "Unity", "Integrity", "Peace", "Patriotism", "Self-Efficacy",
]

// ====== SETTINGS ICON IMPORT ======
function Settings() { return <SettingsIcon className="h-4 w-4" /> }
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

export default function CBCLessonPlanner() {
  const { biblicalMode, calmMode } = useBiblicalTheme()
  const [plan, setPlan] = useState<KICDPlan>({ ...initialPlan })
  const [generated, setGenerated] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(true)
  const [weeklyMode, setWeeklyMode] = useState(false)
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan>({
    monday: createEmptyPlan(), tuesday: createEmptyPlan(), wednesday: createEmptyPlan(),
    thursday: createEmptyPlan(), friday: createEmptyPlan(),
  })
  const [weeklyDay, setWeeklyDay] = useState<DayKey>("monday")
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [planName, setPlanName] = useState("")
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)

  // Biblical Verse (Optional)
  const [biblicalVerseEnabled, setBiblicalVerseEnabled] = useState(false)
  const [biblicalVerse, setBiblicalVerse] = useState("")
  const [teacherReflectionNotes, setTeacherReflectionNotes] = useState("")
  const [curriculumConnection, setCurriculumConnection] = useState("")
  const [verseExplanation, setVerseExplanation] = useState("")

  // Values-Based Lesson Enhancer
  const [valuesEnhancerEnabled, setValuesEnhancerEnabled] = useState(false)

  // Teacher Reflection Notes (private, localStorage-backed)
  const [teacherPrivateNotes, setTeacherPrivateNotes] = useState("")
  const [includeNotesInExport, setIncludeNotesInExport] = useState(false)

  useEffect(() => {
    trackToolUse("cbc_lesson_planner", "tool_open")
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSavedPlans(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  // Load/save teacher private notes to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("toolforge_teacher_notes")
      if (saved) setTeacherPrivateNotes(saved)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("toolforge_teacher_notes", teacherPrivateNotes)
    } catch { /* ignore */ }
  }, [teacherPrivateNotes])

  // Debug: log biblical verse state changes
  useEffect(() => {
    console.log("Biblical Mode:", biblicalVerseEnabled)
    console.log("Selected Verse:", biblicalVerse || "(none)")
  }, [biblicalVerseEnabled, biblicalVerse])

  const activePlan = weeklyMode ? weeklyPlans[weeklyDay] : plan

  const updateField = <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => {
    if (weeklyMode) {
      setWeeklyPlans((prev) => ({ ...prev, [weeklyDay]: { ...prev[weeklyDay], [key]: value } }))
    } else {
      setPlan((prev) => ({ ...prev, [key]: value }))
    }
  }

  const activePlanObj = weeklyMode ? weeklyPlans[weeklyDay] : plan
  const setActivePlan = useCallback((newPlan: KICDPlan) => {
    if (weeklyMode) {
      setWeeklyPlans((prev) => ({ ...prev, [weeklyDay]: newPlan }))
    } else {
      setPlan(newPlan)
    }
  }, [weeklyMode, weeklyDay])

  const learningAreas = activePlanObj.grade ? LEARNING_AREAS_BY_GRADE[activePlanObj.grade] || [] : []
  const strands = activePlanObj.learningArea ? STRANDS_BY_AREA[activePlanObj.learningArea] || [] : []
  const subStrands = activePlanObj.strand ? SUBSTRANDS[activePlanObj.strand] || [] : []

  const suggestedOutcomes = activePlanObj.subStrand ? OUTCOMES_BY_SUBSTRAND[activePlanObj.subStrand] || [] : []

  const handleStrandChange = (strand: string) => {
    const next = { ...activePlanObj, strand, subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] }
    setActivePlan(next)
  }

  const handleSubStrandChange = (sub: string) => {
    const autoCompetencies = SUBSTRAND_COMPETENCY_MAP[sub] || []
    const autoValues = SUBSTRAND_VALUE_MAP[sub] || []
    const autoPCIs = SUBSTRAND_PCI_MAP[sub] || []
    setActivePlan({
      ...activePlanObj,
      subStrand: sub,
      outcomes: activePlanObj.outcomes.length > 0 ? activePlanObj.outcomes : (OUTCOMES_BY_SUBSTRAND[sub]?.slice(0, 2) || []),
      competencies: activePlanObj.competencies.length > 0 ? activePlanObj.competencies : autoCompetencies,
      values: activePlanObj.values.length > 0 ? activePlanObj.values : autoValues,
      pcis: activePlanObj.pcis.length > 0 ? activePlanObj.pcis : autoPCIs,
    })
  }

  const toggleChip = (key: "competencies" | "values" | "pcis", item: string) => {
    const current = activePlanObj[key]
    updateField(key, current.includes(item) ? current.filter((v: string) => v !== item) : [...current, item])
  }

  const autoGenerateRemarks = () => {
    const random = REMARKS[Math.floor(Math.random() * REMARKS.length)]
    updateField("remarks", random)
    toast.success("Remarks auto-generated")
  }

  const suggestVerseForLesson = useCallback(() => {
    const strand = activePlanObj.strand
    const subStrand = activePlanObj.subStrand
    const selectedValues = activePlanObj.values

    // Try strand match first
    let suggestion: VerseSuggestion | undefined
    let matchSource = "strand"

    if (strand && VERSE_MAP_BY_STRAND[strand]) {
      suggestion = VERSE_MAP_BY_STRAND[strand]
    }

    // Try sub-strand match if no strand match
    if (!suggestion && subStrand && VERSE_MAP_BY_SUBSTRAND[subStrand]) {
      suggestion = VERSE_MAP_BY_SUBSTRAND[subStrand]
      matchSource = "sub-strand"
    }

    // Try value match if no strand/sub-strand match
    if (!suggestion && selectedValues.length > 0) {
      for (const val of selectedValues) {
        if (VERSE_MAP_BY_VALUE[val]) {
          suggestion = VERSE_MAP_BY_VALUE[val]
          matchSource = "value"
          break
        }
      }
    }

    if (suggestion) {
      const verseObj = BIBLE_VERSES.find((v) => v.ref === suggestion!.verseRef)
      const verseFull = verseObj
        ? `${verseObj.ref} — ${verseObj.text}`
        : suggestion.verseRef
      setBiblicalVerse(verseFull)
      setCurriculumConnection(suggestion.connection)
      setVerseExplanation(suggestion.explanation)

      // Pre-fill reflection with connection context
      if (!teacherReflectionNotes) {
        setTeacherReflectionNotes(`This lesson connects to ${matchSource}-based learning. ${suggestion.connection}`)
      }

      toast.success(`Suggested verse: ${suggestion.verseRef}`)
      console.log("Verse suggested:", suggestion.verseRef, "from", matchSource)
    } else {
      // Fallback: pick a general teaching verse
      const fallback = BIBLE_VERSES.find((v) => v.ref === "Proverbs 1:7") || BIBLE_VERSES[0]
      const verseFull = `${fallback.ref} — ${fallback.text}`
      setBiblicalVerse(verseFull)
      setCurriculumConnection("This lesson reinforces the pursuit of knowledge and wisdom as foundational to learning.")
      setVerseExplanation(fallback.explanation)

      if (!teacherReflectionNotes) {
        setTeacherReflectionNotes("How does this lesson help learners grow in knowledge and wisdom?")
      }

      toast.success(`Suggested verse: ${fallback.ref}`)
      console.log("Verse suggested (fallback):", fallback.ref)
    }

    // Enable biblical reflection if not already on
    if (!biblicalVerseEnabled) {
      setBiblicalVerseEnabled(true)
    }
  }, [activePlanObj.strand, activePlanObj.subStrand, activePlanObj.values, teacherReflectionNotes, biblicalVerseEnabled])

  const generate = () => {
    if (!activePlanObj.grade || !activePlanObj.learningArea || !activePlanObj.strand) {
      toast.error("Please fill in Grade, Learning Area, and Strand")
      return
    }
    if (activePlanObj.outcomes.length === 0) {
      toast.error("Please select at least one Learning Outcome")
      return
    }
    if (weeklyMode) {
      const allDays = DAY_LABELS.map((d) => d.toLowerCase() as DayKey)
      const incomplete = allDays.filter((d) => !weeklyPlans[d].grade || !weeklyPlans[d].learningArea || !weeklyPlans[d].strand)
      if (incomplete.length > 0) {
        toast.error(`Some days are incomplete: ${incomplete.join(", ")}`)
        return
      }
    }
    setGenerated(true)
    trackToolUse("cbc_lesson_planner", "generate_lesson")
    toast.success(weeklyMode ? "Weekly lesson plans generated" : "KICD CBC lesson plan generated")
  }

  const resetForm = () => {
    if (weeklyMode) {
      setWeeklyPlans({
        monday: createEmptyPlan(), tuesday: createEmptyPlan(), wednesday: createEmptyPlan(),
        thursday: createEmptyPlan(), friday: createEmptyPlan(),
      })
    } else {
      setPlan({ ...initialPlan })
    }
    setGenerated(false)
    toast.success("Form reset")
  }

  // ====== SAVE / LOAD ======

  const saveToStorage = (name: string) => {
    const entry: SavedPlan = {
      id: Date.now().toString(),
      name: name || `Lesson Plan ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      plan: { ...plan },
    }
    const updated = [...savedPlans, entry]
    setSavedPlans(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    toast.success("Lesson plan saved")
    setSaveDialogOpen(false)
    setPlanName("")
  }

  const loadFromStorage = (entry: SavedPlan) => {
    setPlan({ ...entry.plan })
    setGenerated(true)
    setLoadDialogOpen(false)
    toast.success(`Loaded: ${entry.name}`)
  }

  const deleteSaved = (id: string) => {
    const updated = savedPlans.filter((s) => s.id !== id)
    setSavedPlans(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    toast.success("Plan deleted")
  }

  const duplicatePlan = () => {
    const dup = { ...plan, lessonNumber: String(Math.min(30, Number(plan.lessonNumber) + 1)) }
    setPlan(dup)
    toast.success("Plan duplicated (lesson number incremented)")
  }

  // ====== EXPORT ======

  const formatPlan = useCallback((p: KICDPlan) => {
    const lines = [
      "KICD COMPETENCY-BASED LESSON PLAN",
      "=".repeat(50),
      `Grade: ${p.grade}`,
      `Learning Area: ${p.learningArea}`,
      `Strand: ${p.strand}`,
      `Sub-Strand: ${p.subStrand || "\u2014"}`,
      `Lesson Number: ${p.lessonNumber}`,
      `Duration: ${p.duration} minutes`,
      "",
      "1. SPECIFIC LEARNING OUTCOMES",
      ...p.outcomes.map((o) => `   \u2022 ${o}`),
      "",
      "2. CORE COMPETENCIES",
      ...(p.competencies.length ? p.competencies.map((c) => `   \u2022 ${c}`) : ["   \u2014"]),
      "",
      "3. VALUES",
      ...(p.values.length ? p.values.map((v) => `   \u2022 ${v}`) : ["   \u2014"]),
      "",
      "4. PERTINENT & CONTEMPORARY ISSUES (PCIs)",
      ...(p.pcis.length ? p.pcis.map((pc) => `   \u2022 ${pc}`) : ["   \u2014"]),
      "",
      "5. LEARNING ACTIVITIES",
      "   Teacher Activities:",
      ...p.teacherActivities.map((a) => `      \u2022 ${a}`),
      "   Learner Activities:",
      ...p.learnerActivities.map((a) => `      \u2022 ${a}`),
      "",
      "6. RESOURCES",
      ...p.resources.map((r) => `   \u2022 ${r}`),
      "",
      "7. ASSESSMENT METHODS",
      ...p.assessmentMethods.map((a) => `   \u2022 ${a}`),
      "",
      "8. REMARKS",
      `   ${p.remarks || "\u2014"}`,
    ]

    if (biblicalVerseEnabled && biblicalVerse) {
      lines.push("", "9. BIBLICAL REFLECTION (Optional)")
      const verseRef = biblicalVerse.split(" — ")[0]
      const verseText = biblicalVerse.split(" — ").slice(1).join(" — ")
      lines.push(`   Reference: ${verseRef}`)
      lines.push(`   Verse: "${verseText}"`)
      if (curriculumConnection) lines.push(`   Curriculum Connection: ${curriculumConnection}`)
      if (verseExplanation) lines.push(`   Verse Explanation: ${verseExplanation}`)
      if (teacherReflectionNotes) lines.push(`   Teacher Reflection: ${teacherReflectionNotes}`)
    }

    if (includeNotesInExport && teacherPrivateNotes.trim()) {
      lines.push("", "TEACHER NOTES (PRIVATE)", `   ${teacherPrivateNotes}`)
    }

    return lines.join("\n")
  }, [biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes])

  const formatPlanHTML = useCallback((p: KICDPlan) => {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>KICD Lesson Plan</title>
<style>
  body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#222;line-height:1.6}
  h1{text-align:center;font-size:18px;margin-bottom:4px}
  hr{border:none;border-top:2px solid #333;margin:12px 0}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:13px;margin:12px 0}
  .meta b{display:inline-block;min-width:100px}
  h2{font-size:14px;margin:16px 0 6px;border-bottom:1px solid #ccc;padding-bottom:4px}
  ul{margin:4px 0;padding-left:20px}
  li{font-size:13px;margin:2px 0}
  .activities{margin:8px 0}
  .activities .group{font-weight:700;font-size:13px;margin:6px 0 2px}
  .tag{display:inline-block;padding:1px 10px;border-radius:12px;font-size:11px;margin:2px 4px 2px 0}
  .comp{background:#e0e7ff;color:#4338ca}
  .val{background:#dcfce7;color:#16a34a}
  .pci{background:#f3e8ff;color:#9333ea}
  .footer{margin-top:20px;text-align:center;font-size:11px;color:#888}
</style></head><body>
<h1>KICD COMPETENCY-BASED LESSON PLAN</h1>
<hr>
<div class="meta">
  <div><b>Grade:</b> ${p.grade}</div>
  <div><b>Learning Area:</b> ${p.learningArea}</div>
  <div><b>Strand:</b> ${p.strand}</div>
  <div><b>Sub-Strand:</b> ${p.subStrand || "\u2014"}</div>
  <div><b>Lesson No:</b> ${p.lessonNumber}</div>
  <div><b>Duration:</b> ${p.duration} min</div>
</div>
<h2>1. Specific Learning Outcomes</h2>
<ul>${p.outcomes.map((o) => `<li>${o}</li>`).join("")}</ul>
<h2>2. Core Competencies</h2>
${p.competencies.length ? p.competencies.map((c) => `<span class="tag comp">${c}</span>`).join("") : "\u2014"}
<h2>3. Values</h2>
${p.values.length ? p.values.map((v) => `<span class="tag val">${v}</span>`).join("") : "\u2014"}
<h2>4. PCIs</h2>
${p.pcis.length ? p.pcis.map((pc) => `<span class="tag pci">${pc}</span>`).join("") : "\u2014"}
<h2>5. Learning Activities</h2>
<div class="activities">
  <div class="group">Teacher Activities:</div>
  <ul>${p.teacherActivities.map((a) => `<li>${a}</li>`).join("")}</ul>
  <div class="group">Learner Activities:</div>
  <ul>${p.learnerActivities.map((a) => `<li>${a}</li>`).join("")}</ul>
</div>
<h2>6. Resources</h2>
<ul>${p.resources.map((r) => `<li>${r}</li>`).join("")}</ul>
<h2>7. Assessment Methods</h2>
<ul>${p.assessmentMethods.map((a) => `<li>${a}</li>`).join("")}</ul>
<h2>8. Remarks</h2>
<p>${p.remarks || "\u2014"}</p>
${biblicalVerseEnabled && biblicalVerse ? `
<h2 style="color:#b45309">9. Biblical Reflection (Optional)</h2>
<p style="font-weight:bold;font-size:13px;color:#92400e">${biblicalVerse.split(" — ")[0]}</p>
<p style="font-style:italic;color:#b45309">"${biblicalVerse.split(" — ").slice(1).join(" — ")}"</p>
${curriculumConnection ? `<p style="font-size:11px;color:#92400e;background:#fef3c7;padding:6px;border-radius:4px;margin:6px 0"><strong>Curriculum Connection:</strong> ${curriculumConnection}</p>` : ""}
${verseExplanation ? `<p style="font-style:italic;font-size:11px;color:#92400e">${verseExplanation}</p>` : ""}
${teacherReflectionNotes ? `<p style="font-style:italic;font-size:12px;color:#92400e;margin-top:4px">— ${teacherReflectionNotes}</p>` : ""}
` : ""}
${includeNotesInExport && teacherPrivateNotes.trim() ? `
<h2 style="color:#888">Teacher Notes (Private)</h2>
<p style="font-size:12px;color:#888;white-space:pre-wrap">${teacherPrivateNotes}</p>
` : ""}
<div class="footer">Generated by ToolForge CBC Lesson Planner</div>
</body></html>`
  }, [biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes])

  const handleCopy = useCallback(() => {
    const text = weeklyMode
      ? DAY_LABELS.map((d) => `=== ${d.toUpperCase()} ===\n${formatPlan(weeklyPlans[d.toLowerCase() as DayKey])}`).join("\n\n")
      : formatPlan(plan)
    navigator.clipboard.writeText(text)
    trackToolUse("cbc_lesson_planner", "copy")
    toast.success(weeklyMode ? "All weekly plans copied" : "Lesson plan copied to clipboard")
  }, [plan, weeklyMode, weeklyPlans, formatPlan])

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

      const doPlanPDF = (p: KICDPlan, title?: string) => {
        y = title ? y : 20
        if (title) {
          if (y > 20) { doc.addPage(); y = 20 }
          write(title, true, 14)
          y += 3
        }
        write("KICD COMPETENCY-BASED LESSON PLAN", true, 14)
        y += 3

        const fields = [
          ["Grade", p.grade], ["Learning Area", p.learningArea],
          ["Strand", p.strand], ["Sub-Strand", p.subStrand || "\u2014"],
          ["Lesson No.", p.lessonNumber], ["Duration", `${p.duration} min`],
        ]
        fields.forEach(([label, value]) => { write(`${label}: ${value}`, false, 10) })
        y += 3

        const section = (title2: string, items: string[]) => {
          if (y > 260) { doc.addPage(); y = 20 }
          write(title2, true, 11)
          if (items.length === 0) { write("   \u2014", false, 10); return }
          items.forEach((item) => {
            if (y > 270) { doc.addPage(); y = 20 }
            const lines = doc.splitTextToSize(`   \u2022 ${item}`, maxWidth)
            lines.forEach((l: string) => write(l, false, 10))
          })
          y += 2
        }

        section("1. Specific Learning Outcomes", p.outcomes)
        section("2. Core Competencies", p.competencies)
        section("3. Values", p.values)
        section("4. Pertinent & Contemporary Issues", p.pcis)

        if (y > 250) { doc.addPage(); y = 20 }
        write("5. Learning Activities", true, 11)
        write("   Teacher Activities:", true, 10)
        p.teacherActivities.forEach((a) => {
          if (y > 270) { doc.addPage(); y = 20 }
          const lines = doc.splitTextToSize(`      \u2022 ${a}`, maxWidth)
          lines.forEach((l: string) => write(l, false, 10))
        })
        write("   Learner Activities:", true, 10)
        p.learnerActivities.forEach((a) => {
          if (y > 270) { doc.addPage(); y = 20 }
          const lines = doc.splitTextToSize(`      \u2022 ${a}`, maxWidth)
          lines.forEach((l: string) => write(l, false, 10))
        })
        y += 2

        section("6. Resources", p.resources)
        section("7. Assessment Methods", p.assessmentMethods)

        if (y > 260) { doc.addPage(); y = 20 }
        write("8. Remarks", true, 11)
        write(`   ${p.remarks || "\u2014"}`, false, 10)
        y += 4

        if (biblicalVerseEnabled && biblicalVerse) {
          if (y > 250) { doc.addPage(); y = 20 }
          write("9. Biblical Reflection (Optional)", true, 11)
          const verseRef = biblicalVerse.split(" — ")[0]
          const verseText = biblicalVerse.split(" — ").slice(1).join(" — ")
          write(`   ${verseRef}`, false, 10)
          const verseLines = doc.splitTextToSize(`   "${verseText}"`, maxWidth)
          verseLines.forEach((l: string) => write(l, false, 10))
          if (curriculumConnection) {
            const connLines = doc.splitTextToSize(`   Curriculum Connection: ${curriculumConnection}`, maxWidth)
            connLines.forEach((l: string) => write(l, false, 10))
          }
          if (verseExplanation) {
            const explLines = doc.splitTextToSize(`   ${verseExplanation}`, maxWidth)
            explLines.forEach((l: string) => write(l, false, 10))
          }
          if (teacherReflectionNotes) {
            const noteLines = doc.splitTextToSize(`   — ${teacherReflectionNotes}`, maxWidth)
            noteLines.forEach((l: string) => write(l, false, 10))
          }
          y += 2
        }

        if (includeNotesInExport && teacherPrivateNotes.trim()) {
          if (y > 250) { doc.addPage(); y = 20 }
          write("Teacher Notes (Private)", true, 11)
          const noteLines = doc.splitTextToSize(`   ${teacherPrivateNotes}`, maxWidth)
          noteLines.forEach((l: string) => write(l, false, 10))
          y += 2
        }

        y += 4
      }

      const write = (text: string, bold = false, size = 11) => {
        if (y > 275) { doc.addPage(); y = 20 }
        doc.setFontSize(size)
        doc.setFont("helvetica", bold ? "bold" : "normal")
        doc.text(text, margin, y)
        y += lineHeight
      }

      if (weeklyMode) {
        DAY_LABELS.forEach((day) => {
          doPlanPDF(weeklyPlans[day.toLowerCase() as DayKey], day)
        })
        doc.save("cbc-weekly-lesson-plans.pdf")
      } else {
        doPlanPDF(plan)
        doc.save("cbc-lesson-plan.pdf")
      }
      trackDownload("cbc_lesson_planner", "download_pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [plan, weeklyMode, weeklyPlans])

  const handleDOCX = useCallback(() => {
    const content = weeklyMode
      ? DAY_LABELS.map((d) => {
          const p = weeklyPlans[d.toLowerCase() as DayKey]
          return `<h1 style="text-align:center">${d}</h1>${formatPlanHTML(p)}`
        }).join('<div style="page-break-before:always"></div>')
      : formatPlanHTML(plan)
    const blob = new Blob([content], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = weeklyMode ? "cbc-weekly-lesson-plans.doc" : "cbc-lesson-plan.doc"
    a.click()
    URL.revokeObjectURL(url)
    trackDownload("cbc_lesson_planner", "download_docx")
    toast.success("DOCX downloaded")
  }, [plan, weeklyMode, weeklyPlans, formatPlanHTML])

  // ====== STEP NAVIGATION ======

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 1: return !!activePlanObj.grade && !!activePlanObj.learningArea
      case 2: return !!activePlanObj.strand && activePlanObj.outcomes.length > 0
      case 3: return activePlanObj.competencies.length > 0
      case 4: return activePlanObj.teacherActivities.length > 0 && activePlanObj.learnerActivities.length > 0
      case 5: return true
      default: return true
    }
  }, [currentStep, activePlanObj])

  const goNext = () => {
    if (currentStep < 6) setCurrentStep((s) => s + 1)
  }

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  // ====== RENDER STEP CONTENT ======

  const renderStep = () => {
    switch (currentStep) {
      // --- STEP 1: Lesson Setup ---
      case 1:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <SettingsIcon className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Lesson Setup</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Grade *</label>
                <select
                  value={activePlanObj.grade}
                  onChange={(e) => {
                    const val = e.target.value
                    setActivePlan({ ...createEmptyPlan(), grade: val })
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
                  value={activePlanObj.lessonNumber}
                  onChange={(e) => updateField("lessonNumber", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
                >
                  {LESSON_NUMBERS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Duration (minutes)</label>
                <select
                  value={activePlanObj.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
                >
                  {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learning Area *</label>
              <select
                value={activePlanObj.learningArea}
                onChange={(e) => {
                  const val = e.target.value
                  setActivePlan({ ...activePlanObj, learningArea: val, strand: "", subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] })
                }}
                disabled={!activePlanObj.grade}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors disabled:opacity-50"
              >
                <option value="">Select learning area...</option>
                {learningAreas.map((la) => <option key={la} value={la}>{la}</option>)}
              </select>
            </div>
          </div>
        )

      // --- STEP 2: Curriculum Mapping ---
      case 2:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <BookTemplate className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Curriculum Mapping</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Strand *</label>
                <select
                  value={activePlanObj.strand}
                  onChange={(e) => handleStrandChange(e.target.value)}
                  disabled={!activePlanObj.learningArea}
                  className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors disabled:opacity-50"
                >
                  <option value="">Select strand...</option>
                  {strands.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Sub-Strand</label>
                <select
                  value={activePlanObj.subStrand}
                  onChange={(e) => handleSubStrandChange(e.target.value)}
                  disabled={!activePlanObj.strand}
                  className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors disabled:opacity-50"
                >
                  <option value="">Select sub-strand...</option>
                  {subStrands.map((ss) => <option key={ss} value={ss}>{ss}</option>)}
                </select>
              </div>
            </div>

            <SearchableMultiSelect
              label="Specific Learning Outcomes *"
              options={suggestedOutcomes}
              selected={activePlanObj.outcomes}
              onChange={(val) => updateField("outcomes", val)}
              placeholder="Search outcomes..."
              allowCustom
              customPlaceholder="Type a custom outcome..."
            />
            {activePlanObj.subStrand && suggestedOutcomes.length === 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      Suggested outcomes based on strand: {activePlanObj.strand}
                    </p>
                    <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70">Click to add suggested outcomes or type custom ones below</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {getSmartFallbackOutcomes(activePlanObj.strand).slice(0, 3).map((outcome, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const current = activePlanObj.outcomes
                        if (!current.includes(outcome)) {
                          updateField("outcomes", [...current, outcome])
                        }
                      }}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3 text-amber-500 shrink-0" />
                      <span>{outcome}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activePlanObj.subStrand && suggestedOutcomes.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {suggestedOutcomes.length} preloaded outcomes available. You can also add custom outcomes.
              </p>
            )}
          </div>
        )

      // --- STEP 3: Competencies & Values ---
      case 3:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Competencies, Values & PCIs</h3>
              {activePlanObj.subStrand && (
                <span className="text-[10px] text-muted-foreground ml-auto">Auto-suggested from sub-strand</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Core Competencies</label>
              <div className="flex flex-wrap gap-1.5">
                {coreCompetencies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChip("competencies", c)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      activePlanObj.competencies.includes(c)
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-muted/20 border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Values</label>
              <div className="flex flex-wrap gap-1.5">
                {values.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleChip("values", v)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      activePlanObj.values.includes(v)
                        ? "bg-green-500/20 border-green-500 text-green-500"
                        : "bg-muted/20 border-border text-muted-foreground hover:border-green-500/50"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Pertinent & Contemporary Issues (PCIs)</label>
              <div className="flex flex-wrap gap-1.5">
                {pciOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleChip("pcis", p)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      activePlanObj.pcis.includes(p)
                        ? "bg-purple-500/20 border-purple-500 text-purple-500"
                        : "bg-muted/20 border-border text-muted-foreground hover:border-purple-500/50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Values-Based Lesson Enhancer — advisory chips */}
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Values-Based Lesson Enhancer (Optional)</label>
                <button
                  type="button"
                  onClick={() => setValuesEnhancerEnabled((p) => !p)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                    valuesEnhancerEnabled
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600"
                      : "bg-muted/20 border-border text-muted-foreground hover:border-emerald-500/50"
                  }`}
                >
                  <Leaf className="h-3 w-3" />
                  {valuesEnhancerEnabled ? "Showing" : "Show"}
                </button>
              </div>
              {valuesEnhancerEnabled && (
                <div className="rounded-lg border border-emerald-200/30 bg-emerald-50/5 dark:bg-emerald-950/20 p-3 space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Suggested Values</span> — based on your Sub-Strand: <strong>{activePlanObj.subStrand || "(not set)"}</strong>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(activePlanObj.subStrand ? SUBSTRAND_VALUE_MAP[activePlanObj.subStrand] || VALUES_ADVISORY_ALL : VALUES_ADVISORY_ALL).map((v) => {
                      const selected = activePlanObj.values.includes(v)
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => toggleChip("values", v)}
                          className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
                            selected
                              ? "bg-green-500/20 border-green-500 text-green-500"
                              : "bg-muted/20 border-border text-muted-foreground hover:border-emerald-500/50"
                          }`}
                        >
                          {v} {selected ? "\u2713" : "+"}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[9px] text-muted-foreground italic flex items-center gap-1">
                    <AlertCircle className="h-2.5 w-2.5" />
                    Advisory only — tap a chip to add or remove it from your plan values.
                  </p>
                </div>
              )}
            </div>

            {/* ===== 🌿 BIBLICAL REFLECTION (OPTIONAL) ===== */}
            <div className="border-2 border-amber-200/40 dark:border-amber-800/40 rounded-xl bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10 p-4 mt-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    🌿 Biblical Reflection (Optional)
                  </h4>
                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 italic">Optional for Christian teachers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={biblicalVerseEnabled}
                    onChange={() => {
                      const next = !biblicalVerseEnabled
                      setBiblicalVerseEnabled(next)
                      console.log("Biblical Mode:", next)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 rounded-full bg-muted peer-checked:bg-amber-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500/30 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  <span className="ml-2 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    {biblicalVerseEnabled ? "On" : "Off"}
                  </span>
                </label>
              </div>

              {biblicalVerseEnabled && (
                <div className="space-y-3 pt-1">
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-amber-200/50 via-amber-300/30 to-transparent dark:from-amber-800/50 dark:via-amber-700/30" />

                  {/* 🌿 Suggest Verse for This Lesson Button */}
                  <button
                    type="button"
                    onClick={suggestVerseForLesson}
                    disabled={!activePlanObj.strand && !activePlanObj.subStrand && activePlanObj.values.length === 0}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/90 to-amber-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Auto-suggest a Bible verse based on your Strand, Sub-Strand, and selected Values"
                  >
                    🌿 Suggest Verse for This Lesson
                  </button>
                  {!activePlanObj.strand && activePlanObj.values.length === 0 && (
                    <p className="text-[9px] text-amber-500/70 text-center">Select a Strand or Values first for context-aware suggestions</p>
                  )}

                  {/* Verse Card — shown when a verse is selected */}
                  {biblicalVerse && (
                    <div className="rounded-lg border-2 border-amber-200/50 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/30 overflow-hidden">
                      {/* Verse Header */}
                      <div className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/30 px-3 py-2 border-b border-amber-200/50 dark:border-amber-800/50">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Selected Verse</span>
                      </div>

                      {/* Verse Reference */}
                      <div className="px-3 py-2 space-y-2">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Reference</p>
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{biblicalVerse.split(" — ")[0]}</p>
                        </div>

                        {/* Verse Text */}
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Verse</p>
                          <p className="text-[11px] italic text-amber-800 dark:text-amber-300 leading-relaxed">"{biblicalVerse.split(" — ").slice(1).join(" — ")}"</p>
                        </div>

                        {/* Curriculum Connection */}
                        {curriculumConnection && (
                          <div className="rounded-lg bg-amber-100/70 dark:bg-amber-900/30 px-2.5 py-2 border border-amber-200/40 dark:border-amber-800/40">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-0.5">Curriculum Connection</p>
                            <p className="text-[10px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">{curriculumConnection}</p>
                          </div>
                        )}

                        {/* Verse Explanation */}
                        {verseExplanation && (
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Verse Explanation</p>
                            <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 italic leading-relaxed">{verseExplanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual Verse Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span>Or choose a verse manually</span>
                      <span className="text-[9px] font-normal text-muted-foreground">(optional override)</span>
                    </label>
                    <select
                      value={biblicalVerse}
                      onChange={(e) => {
                        const verse = e.target.value
                        setBiblicalVerse(verse)
                        console.log("Selected Verse:", verse || "(none)")
                        // Clear auto-generated connection/explanation on manual override
                        if (verse) {
                          setCurriculumConnection("")
                          setVerseExplanation("")
                        }
                      }}
                      className="w-full rounded-lg border-2 border-amber-200/50 dark:border-amber-800/50 bg-white dark:bg-amber-950/40 px-3 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    >
                      <option value="">— Choose a verse —</option>
                      {BIBLE_VERSES.map((v) => (
                        <option key={v.ref} value={`${v.ref} — ${v.text}`}>
                          {v.ref} — {v.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reflection Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span>Teacher Reflection Notes</span>
                      <span className="text-[9px] font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      value={teacherReflectionNotes}
                      onChange={(e) => setTeacherReflectionNotes(e.target.value)}
                      placeholder="How does this verse connect with today's lesson? What can learners take away from this scripture?"
                      rows={3}
                      className="w-full rounded-lg border-2 border-amber-200/50 dark:border-amber-800/50 bg-white dark:bg-amber-950/40 px-3 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                    />
                  </div>

                  {/* Info */}
                  <div className="rounded-lg bg-amber-100/50 dark:bg-amber-950/30 px-3 py-2">
                    <p className="text-[9px] text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                      The verse, curriculum connection, and reflection will appear in the live preview and in PDF/DOCX exports. Does not affect CBC compliance scoring.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      // --- STEP 4: Activities ---
      case 4:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Workflow className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Learning Activities</h3>
            </div>

            <MultiSelect
              label="Teacher Activities *"
              options={TEACHER_ACTIVITIES}
              selected={activePlanObj.teacherActivities}
              onChange={(val) => updateField("teacherActivities", val)}
            />

            <MultiSelect
              label="Learner Activities *"
              options={LEARNER_ACTIVITIES}
              selected={activePlanObj.learnerActivities}
              onChange={(val) => updateField("learnerActivities", val)}
            />

            <MultiSelect
              label="Resources"
              options={RESOURCES}
              selected={activePlanObj.resources}
              onChange={(val) => updateField("resources", val)}
            />
          </div>
        )

      // --- STEP 5: Assessment & Remarks ---
      case 5:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Assessment & Remarks</h3>
            </div>

            <MultiSelect
              label="Assessment Methods"
              options={ASSESSMENT_METHODS}
              selected={activePlanObj.assessmentMethods}
              onChange={(val) => updateField("assessmentMethods", val)}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Remarks</label>
                <Button variant="ghost" size="xs" type="button" onClick={autoGenerateRemarks}>
                  <Sparkles className="h-3 w-3" /> Auto-generate
                </Button>
              </div>
              <select
                value={activePlanObj.remarks}
                onChange={(e) => updateField("remarks", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                <option value="">Select remarks...</option>
                {REMARKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )

      // --- STEP 6: Preview & Export ---
      case 6:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Preview & Export</h3>
            </div>

            {weeklyMode ? (
              <div className="space-y-6">
                {DAY_LABELS.map((day) => {
                  const p = weeklyPlans[day.toLowerCase() as DayKey]
                  return (
                    <div key={day} className="rounded-lg border bg-muted/20 p-4 text-sm space-y-2">
                      <div className="font-bold text-sm text-primary">{day}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{p.grade || "\u2014"} | {p.learningArea || "\u2014"}</span>
                        <span>Lesson {p.lessonNumber} | {p.duration} min</span>
                      </div>
                      {p.outcomes.length > 0 && (
                        <div className="text-xs">
                          <span className="font-medium">Outcomes:</span> {p.outcomes.slice(0, 2).join("; ")}{p.outcomes.length > 2 ? "..." : ""}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
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

                {biblicalVerseEnabled && biblicalVerse && (
                  <div className="border-t-2 border-amber-200/40 pt-3 mt-3">
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-amber-500 text-[10px]">🌿</span>
                      <span className="font-bold text-xs text-amber-700 dark:text-amber-400">Biblical Reflection (Optional)</span>
                    </div>
                    <div className="rounded-lg border border-amber-200/30 bg-amber-50/30 dark:bg-amber-950/30 p-2.5 space-y-1">
                      <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500">Scripture</p>
                      <p className="text-[10px] font-bold text-amber-900 dark:text-amber-200">{biblicalVerse.split(" — ")[0]}</p>
                      <p className="text-xs italic text-amber-800 dark:text-amber-300 leading-relaxed">"{biblicalVerse.split(" — ").slice(1).join(" — ")}"</p>
                      {curriculumConnection && (
                        <div className="rounded bg-amber-100/60 dark:bg-amber-900/30 px-2 py-1.5 border border-amber-200/30 dark:border-amber-800/30">
                          <p className="text-[8px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Curriculum Connection</p>
                          <p className="text-[9px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">{curriculumConnection}</p>
                        </div>
                      )}
                      {verseExplanation && (
                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Verse Explanation</p>
                          <p className="text-[9px] text-amber-700/80 dark:text-amber-300/80 italic leading-relaxed">{verseExplanation}</p>
                        </div>
                      )}
                      {teacherReflectionNotes && (
                        <>
                          <div className="h-px bg-amber-200/30 dark:bg-amber-800/30 my-1" />
                          <p className="text-[9px] font-semibold text-amber-600 dark:text-amber-500">Teacher Reflection</p>
                          <p className="text-[9px] text-amber-700/80 dark:text-amber-300/80 italic">— {teacherReflectionNotes}</p>
                        </>
                      )}
                    </div>
                    <p className="text-[8px] text-amber-500/60 mt-1 italic">Optional for Christian teachers</p>
                  </div>
                )}

                {includeNotesInExport && teacherPrivateNotes.trim() && (
                  <div className="border-t pt-2 mt-2">
                    <span className="font-semibold text-muted-foreground text-xs">Teacher Notes (Private):</span>
                    <p className="text-muted-foreground text-xs mt-0.5 whitespace-pre-wrap">{teacherPrivateNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Teacher Reflection Notes (private) */}
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <StickyNote className="h-3 w-3" />
                  Teacher Reflection Notes (Private)
                </label>
                <span className="text-[9px] text-muted-foreground italic border px-1.5 py-0.5 rounded">PRIVATE</span>
              </div>
              <textarea
                value={teacherPrivateNotes}
                onChange={(e) => setTeacherPrivateNotes(e.target.value)}
                placeholder="Jot down your personal reflections, observations, or notes for improvement. These are not part of the KICD plan."
                rows={3}
                className="w-full rounded-md border bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeNotesExport"
                  checked={includeNotesInExport}
                  onChange={(e) => setIncludeNotesInExport(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="includeNotesExport" className="text-[10px] text-muted-foreground">
                  Include in download (PDF/DOCX)
                </label>
              </div>
              <p className="text-[9px] text-muted-foreground italic">
                Auto-saved to browser storage. Not shared or uploaded.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Export Options</label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handlePDF}>
                  <FileDown className="h-3.5 w-3.5" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDOCX}>
                  <FileText className="h-3.5 w-3.5" /> DOCX
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="default" size="sm" onClick={() => setSaveDialogOpen(true)}>
                <Save className="h-3.5 w-3.5" /> Save Plan
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLoadDialogOpen(true)}>
                <Upload className="h-3.5 w-3.5" /> Load Saved
              </Button>
              <Button variant="outline" size="sm" onClick={duplicatePlan}>
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 print:space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 print:hidden">
        <h2 className="text-2xl font-bold tracking-tight">CBC Lesson Plan Builder</h2>
        <p className="text-sm text-muted-foreground">
          KICD-compliant step-by-step lesson plan wizard with live preview, export, and CBC compliance tracking
        </p>
      </div>

      {/* Weekly Mode + Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setWeeklyMode(!weeklyMode); setGenerated(false) }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              weeklyMode
                ? "bg-primary/20 border-primary text-primary"
                : "bg-muted/20 border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Weekly Mode
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-muted/20 text-muted-foreground hover:border-primary/50 transition-colors lg:hidden"
          >
            <Eye className="h-3.5 w-3.5" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ComplianceMeter plan={activePlanObj} />
        </div>
      </div>

      {/* Weekly Day Tabs */}
      {weeklyMode && (
        <div className="flex flex-wrap gap-1 print:hidden">
          {DAY_LABELS.map((day) => {
            const key = day.toLowerCase() as DayKey
            const p = weeklyPlans[key]
            const filled = !!p.grade && !!p.learningArea && !!p.strand
            return (
              <button
                key={day}
                type="button"
                onClick={() => setWeeklyDay(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  weeklyDay === key
                    ? "bg-primary/20 border-primary text-primary"
                    : filled
                      ? "bg-green-500/10 border-green-500/30 text-green-600"
                      : "bg-muted/20 border-border text-muted-foreground"
                }`}
              >
                {day} {filled && <Check className="h-3 w-3 inline ml-0.5" />}
              </button>
            )
          })}
        </div>
      )}

      {/* Main: Form + Preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Step Form */}
        <div className="flex-1 min-w-0">
          {/* Step Indicator */}
          <div className="print:hidden mb-5">
            <div className="flex items-center justify-between">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    currentStep === step.id
                      ? "text-primary"
                      : currentStep > step.id
                        ? "text-green-500"
                        : "text-muted-foreground"
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-colors ${
                    currentStep === step.id
                      ? "border-primary bg-primary/10 text-primary"
                      : currentStep > step.id
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : "border-border bg-muted/20 text-muted-foreground"
                  }`}>
                    {currentStep > step.id ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:block">{step.label}</span>
                </button>
              ))}
            </div>
            {/* Connecting line */}
            <div className="relative mt-2">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted" />
              <div
                className="absolute top-0 left-0 h-0.5 bg-primary transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content Card */}
          <Card>
            <CardContent className="p-5 space-y-4">
              {renderStep()}

              <Separator />

              {/* Navigation + Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button variant="outline" size="sm" onClick={goPrev}>
                      <ChevronLeft className="h-3.5 w-3.5" /> Back
                    </Button>
                  )}
                  {currentStep < 6 ? (
                    <Button size="sm" onClick={goNext} disabled={!canGoNext}>
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  {currentStep === 6 && (
                    <Button onClick={generate} size="sm">
                      <BookOpen className="h-4 w-4" /> {weeklyMode ? "Generate Weekly Plans" : "Generate KICD Plan"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    <RefreshCw className="h-3.5 w-3.5" /> Reset
                  </Button>
                </div>
              </div>

              {/* Step helper text */}
              <p className="text-[10px] text-muted-foreground text-center">
                {currentStep === 1 && "Select Grade and Learning Area to begin. Lesson Number and Duration have defaults."}
                {currentStep === 2 && "Choose Strand and Sub-Strand. Learning Outcomes auto-suggest based on your Sub-Strand selection."}
                {currentStep === 3 && "Competencies, Values, and PCIs are auto-suggested from your Sub-Strand. Tap to toggle any chip."}
                {currentStep === 4 && "Select teacher and learner activities from the lists. You can pick multiple."}
                {currentStep === 5 && "Choose assessment methods and optionally auto-generate remarks."}
                {currentStep === 6 && "Review your plan above, then export as Copy, PDF, DOCX, or Print. Save to browser for later."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview (desktop) */}
        {(showPreview || !generated) && (
          <div className={`lg:w-[380px] xl:w-[420px] shrink-0 print:hidden ${!showPreview ? 'hidden lg:block' : ''}`}>
            <div className="sticky top-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</h4>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: (() => {
                  const s = [!!activePlanObj.grade?8:0, !!activePlanObj.learningArea?8:0, !!activePlanObj.strand?12:0, !!activePlanObj.subStrand?10:0, activePlanObj.outcomes.length>=2?15:0, activePlanObj.competencies.length>=2?10:0, activePlanObj.values.length>=2?8:0, activePlanObj.pcis.length>=1?8:0, activePlanObj.teacherActivities.length>=2?6:0, activePlanObj.learnerActivities.length>=2?6:0, activePlanObj.assessmentMethods.length>=2?5:0, !!activePlanObj.remarks?4:0].reduce((a,b)=>a+b,0);
                  return Math.min(100,s) >= 80 ? '#22c55e' : Math.min(100,s) >= 50 ? '#eab308' : '#ef4444';
                })()}}>
                  {Math.min(100, [!!activePlanObj.grade?8:0, !!activePlanObj.learningArea?8:0, !!activePlanObj.strand?12:0, !!activePlanObj.subStrand?10:0, activePlanObj.outcomes.length>=2?15:0, activePlanObj.competencies.length>=2?10:0, activePlanObj.values.length>=2?8:0, activePlanObj.pcis.length>=1?8:0, activePlanObj.teacherActivities.length>=2?6:0, activePlanObj.learnerActivities.length>=2?6:0, activePlanObj.assessmentMethods.length>=2?5:0, !!activePlanObj.remarks?4:0].reduce((a,b)=>a+b,0))}%
                </span>
              </div>

              <div className="rounded-lg border bg-card text-xs shadow-sm overflow-hidden">
                {!activePlanObj.grade ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground px-4">
                    <FileText className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">KICD CBC Lesson Plan</p>
                    <p className="text-[10px] mt-1 text-center">Preview will appear here as you fill in the form</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {/* Header */}
                    <div className="bg-primary/5 px-4 py-3 text-center border-b-2 border-primary/20">
                      <div className="text-xs font-bold tracking-wider text-primary">KICD CBC LESSON PLAN</div>
                      <div className="h-px bg-primary/10 my-1.5" />
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-left mt-1">
                        <div className="flex justify-between"><span className="text-muted-foreground">Grade:</span><span className="font-medium">{activePlanObj.grade}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span><span className="font-medium">{activePlanObj.duration} min</span></div>
                        <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Learning Area:</span><span className="font-medium">{activePlanObj.learningArea || "\u2014"}</span></div>
                        <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Strand:</span><span className="font-medium">{activePlanObj.strand || "\u2014"}</span></div>
                        <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Sub-Strand:</span><span className="font-medium">{activePlanObj.subStrand || "\u2014"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Lesson No:</span><span className="font-medium">#{activePlanObj.lessonNumber}</span></div>
                      </div>
                    </div>

                    {/* SPECIFIC LEARNING OUTCOMES */}
                    <div className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-1 h-3.5 rounded-full bg-primary shrink-0" />
                        <span className="font-semibold text-[10px] uppercase tracking-wider text-primary">Specific Learning Outcomes</span>
                        {activePlanObj.outcomes.length > 0 && <span className="text-[9px] text-muted-foreground ml-auto">({activePlanObj.outcomes.length})</span>}
                      </div>
                      {activePlanObj.outcomes.length > 0 ? (
                        <ul className="space-y-0.5">
                          {activePlanObj.outcomes.slice(0, 3).map((o, i) => (
                            <li key={i} className="text-[10px] text-muted-foreground flex gap-1.5">
                              <span className="text-primary shrink-0">\u2022</span>
                              <span>{o}</span>
                            </li>
                          ))}
                          {activePlanObj.outcomes.length > 3 && (
                            <li className="text-[9px] text-primary font-medium">+{activePlanObj.outcomes.length - 3} more outcomes</li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic">Not yet defined</p>
                      )}
                    </div>

                    {/* CORE COMPETENCIES / VALUES / PCIs */}
                    {(activePlanObj.competencies.length > 0 || activePlanObj.values.length > 0 || activePlanObj.pcis.length > 0) && (
                      <div className="px-4 py-2.5 space-y-2">
                        {activePlanObj.competencies.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-1 h-3.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="font-semibold text-[10px] uppercase tracking-wider text-blue-600">Core Competencies</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {activePlanObj.competencies.slice(0, 4).map((c) => (
                                <span key={c} className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[9px]">{c}</span>
                              ))}
                              {activePlanObj.competencies.length > 4 && <span className="text-[9px] text-muted-foreground">+{activePlanObj.competencies.length - 4}</span>}
                            </div>
                          </div>
                        )}
                        {activePlanObj.values.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-1 h-3.5 rounded-full bg-green-500 shrink-0" />
                              <span className="font-semibold text-[10px] uppercase tracking-wider text-green-600">Values</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {activePlanObj.values.slice(0, 4).map((v) => (
                                <span key={v} className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[9px]">{v}</span>
                              ))}
                              {activePlanObj.values.length > 4 && <span className="text-[9px] text-muted-foreground">+{activePlanObj.values.length - 4}</span>}
                            </div>
                          </div>
                        )}
                        {activePlanObj.pcis.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-1 h-3.5 rounded-full bg-purple-500 shrink-0" />
                              <span className="font-semibold text-[10px] uppercase tracking-wider text-purple-600">PCIs</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {activePlanObj.pcis.slice(0, 3).map((p) => (
                                <span key={p} className="px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[9px]">{p}</span>
                              ))}
                              {activePlanObj.pcis.length > 3 && <span className="text-[9px] text-muted-foreground">+{activePlanObj.pcis.length - 3}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACTIVITIES */}
                    {(activePlanObj.teacherActivities.length > 0 || activePlanObj.learnerActivities.length > 0) && (
                      <div className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-1 h-3.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="font-semibold text-[10px] uppercase tracking-wider text-amber-600">Learning Activities</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md bg-amber-500/5 p-1.5">
                            <p className="text-[9px] font-medium text-amber-600 mb-0.5">Teacher</p>
                            <p className="text-[10px] text-muted-foreground">{activePlanObj.teacherActivities.length} activities</p>
                            {activePlanObj.teacherActivities.length > 0 && (
                              <p className="text-[9px] text-muted-foreground truncate">{activePlanObj.teacherActivities[0]}</p>
                            )}
                          </div>
                          <div className="rounded-md bg-amber-500/5 p-1.5">
                            <p className="text-[9px] font-medium text-amber-600 mb-0.5">Learner</p>
                            <p className="text-[10px] text-muted-foreground">{activePlanObj.learnerActivities.length} activities</p>
                            {activePlanObj.learnerActivities.length > 0 && (
                              <p className="text-[9px] text-muted-foreground truncate">{activePlanObj.learnerActivities[0]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ASSESSMENT + REMARKS */}
                    <div className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-1 h-3.5 rounded-full bg-red-500 shrink-0" />
                        <span className="font-semibold text-[10px] uppercase tracking-wider text-red-600">Assessment & Remarks</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                        <div>
                          <span className="font-medium">Methods:</span> {activePlanObj.assessmentMethods.length || 0}
                        </div>
                        <div>
                          <span className="font-medium">Resources:</span> {activePlanObj.resources.length || 0}
                        </div>
                      </div>
                      {activePlanObj.remarks && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic truncate">"{activePlanObj.remarks}"</p>
                      )}
                    </div>

                    {/* 🌿 Biblical Reflection (if enabled) */}
                    {biblicalVerseEnabled && biblicalVerse && (
                      <div className="px-4 py-3 border-t-2 border-amber-200/40 bg-gradient-to-r from-amber-50/40 to-transparent dark:from-amber-950/20 dark:to-transparent">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-amber-500 text-xs">🌿</span>
                          <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">Biblical Reflection (Optional)</span>
                        </div>
                        <div className="rounded-lg border border-amber-200/30 bg-amber-50/30 dark:bg-amber-950/30 p-2.5 space-y-1.5">
                          {/* Verse Reference + Text */}
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Scripture</p>
                          <p className="text-[10px] font-bold text-amber-900 dark:text-amber-200">{biblicalVerse.split(" — ")[0]}</p>
                          <p className="text-[10px] italic text-amber-800 dark:text-amber-300 leading-relaxed">"{biblicalVerse.split(" — ").slice(1).join(" — ")}"</p>

                          {/* Curriculum Connection */}
                          {curriculumConnection && (
                            <div className="rounded bg-amber-100/60 dark:bg-amber-900/30 px-2 py-1.5 border border-amber-200/30 dark:border-amber-800/30">
                              <p className="text-[8px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Curriculum Connection</p>
                              <p className="text-[9px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">{curriculumConnection}</p>
                            </div>
                          )}

                          {/* Verse Explanation */}
                          {verseExplanation && (
                            <div>
                              <p className="text-[8px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Verse Explanation</p>
                              <p className="text-[9px] text-amber-700/80 dark:text-amber-300/80 italic leading-relaxed">{verseExplanation}</p>
                            </div>
                          )}

                          {/* Teacher Reflection */}
                          {teacherReflectionNotes && (
                            <>
                              <div className="h-px bg-amber-200/30 dark:bg-amber-800/30 my-1" />
                              <p className="text-[8px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Teacher Reflection</p>
                              <p className="text-[9px] text-amber-700/80 dark:text-amber-300/80 italic">— {teacherReflectionNotes}</p>
                            </>
                          )}
                        </div>
                        <p className="text-[8px] text-amber-500/60 mt-1 italic">Optional for Christian teachers — does not affect CBC scoring</p>
                      </div>
                    )}

                    {/* Teacher Private Notes (if included in export) */}
                    {includeNotesInExport && teacherPrivateNotes.trim() && (
                      <div className="px-4 py-2.5 border-t border-border/50 bg-muted/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <StickyNote className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Teacher Notes</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{teacherPrivateNotes}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-4 py-2 bg-muted/20 flex items-center justify-between text-[9px] text-muted-foreground">
                      <span>Lesson #{activePlanObj.lessonNumber}</span>
                      <span>{activePlanObj.outcomes.length} outcomes · {activePlanObj.assessmentMethods.length || 0} assessments</span>
                    </div>

                    {/* Smart Generate Button */}
                    {!generated && (
                      <div className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const p = activePlanObj
                            const updates: Partial<KICDPlan> = {}
                            if (p.outcomes.length === 0 && p.strand) {
                              updates.outcomes = getSmartFallbackOutcomes(p.strand).slice(0, 3)
                            }
                            if (p.teacherActivities.length === 0) {
                              updates.teacherActivities = [
                                "Guides learners through examples using real objects",
                                "Asks probing questions to promote critical thinking",
                                "Facilitates class discussion on key concepts",
                              ]
                            }
                            if (p.learnerActivities.length === 0) {
                              updates.learnerActivities = [
                                "Participates actively in class discussions",
                                "Works in groups to solve problems and tasks",
                                "Completes worksheets and written exercises",
                              ]
                            }
                            if (p.assessmentMethods.length === 0) {
                              updates.assessmentMethods = ["Observation", "Oral questioning", "Written exercise"]
                            }
                            if (!p.remarks) {
                              updates.remarks = "Lesson well received. Learners demonstrated understanding."
                            }
                            Object.entries(updates).forEach(([key, value]) => {
                              updateField(key as keyof KICDPlan, value)
                            })
                            toast.success("Missing sections auto-generated")
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/90 to-purple-600/90 text-white text-[10px] font-medium hover:from-primary hover:to-purple-600 transition-all shadow-sm"
                        >
                          <Sparkles className="h-3 w-3" />
                          Auto-Generate Missing Sections
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              {activePlanObj.grade && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border bg-muted/20 p-2">
                    <div className="text-lg font-bold text-primary">{activePlanObj.outcomes.length}</div>
                    <div className="text-[9px] text-muted-foreground">Outcomes</div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-2">
                    <div className="text-lg font-bold text-green-500">{(activePlanObj.competencies.length + activePlanObj.values.length + activePlanObj.pcis.length)}</div>
                    <div className="text-[9px] text-muted-foreground">Tags</div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-2">
                    <div className="text-lg font-bold text-purple-500">{(activePlanObj.teacherActivities.length + activePlanObj.learnerActivities.length)}</div>
                    <div className="text-[9px] text-muted-foreground">Activities</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ====== SAVE DIALOG ====== */}
      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSaveDialogOpen(false)}>
          <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-sm mb-3">Save Lesson Plan</h3>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Enter plan name..."
              className="mb-3"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveToStorage(planName) } }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => saveToStorage(planName)} disabled={!planName.trim()}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== LOAD DIALOG ====== */}
      {loadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setLoadDialogOpen(false)}>
          <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-sm mb-3">Saved Lesson Plans</h3>
            {savedPlans.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No saved plans yet</p>
            ) : (
              <div className="space-y-2">
                {savedPlans.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{entry.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()} |{" "}
                        {entry.plan.grade} | {entry.plan.learningArea}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="xs" onClick={() => loadFromStorage(entry)}>
                        <Upload className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => deleteSaved(entry.id)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setLoadDialogOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== GENERATED OUTPUT (below wizard, for print) ====== */}
      {generated && !weeklyMode && (
        <div className="print:block hidden print:mt-4">
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

            {biblicalVerseEnabled && biblicalVerse && (
              <div className="border-t-2 border-amber-200/40 pt-3 mt-3">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-400">🌿 Biblical Reflection (Optional):</span>
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mt-1">{biblicalVerse.split(" — ")[0]}</p>
                <p className="text-muted-foreground text-xs italic">"{biblicalVerse.split(" — ").slice(1).join(" — ")}"</p>
                {curriculumConnection && (
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 mt-1 leading-relaxed"><span className="font-semibold">Curriculum Connection:</span> {curriculumConnection}</p>
                )}
                {verseExplanation && (
                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 italic mt-0.5 leading-relaxed">{verseExplanation}</p>
                )}
                {teacherReflectionNotes && (
                  <p className="text-muted-foreground text-[10px] italic mt-1">— {teacherReflectionNotes}</p>
                )}
              </div>
            )}

            {includeNotesInExport && teacherPrivateNotes.trim() && (
              <div className="border-t pt-2 mt-2">
                <span className="font-semibold text-muted-foreground text-xs">Teacher Notes (Private):</span>
                <p className="text-muted-foreground text-xs mt-0.5 whitespace-pre-wrap">{teacherPrivateNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {generated && weeklyMode && (
        <div className="print:block hidden print:mt-4 space-y-6">
          {DAY_LABELS.map((day) => {
            const p = weeklyPlans[day.toLowerCase() as DayKey]
            return (
              <div key={day} className="rounded-lg border bg-muted/20 p-4 text-sm space-y-3 leading-relaxed">
                <div className="font-bold text-base text-primary">{day.toUpperCase()}</div>
                <div className="font-bold text-sm">KICD COMPETENCY-BASED LESSON PLAN</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div><span className="font-semibold">Grade:</span> {p.grade}</div>
                  <div><span className="font-semibold">Learning Area:</span> {p.learningArea}</div>
                  <div><span className="font-semibold">Strand:</span> {p.strand}</div>
                  <div><span className="font-semibold">Sub-Strand:</span> {p.subStrand || "\u2014"}</div>
                  <div><span className="font-semibold">Lesson No:</span> {p.lessonNumber}</div>
                  <div><span className="font-semibold">Duration:</span> {p.duration} min</div>
                </div>
                <Separator />
                <div>
                  <span className="font-semibold">1. Outcomes</span>
                  <ul className="list-disc list-inside text-muted-foreground mt-0.5">{p.outcomes.map((o, i) => <li key={i}>{o}</li>)}</ul>
                </div>
                {p.remarks && <div><span className="font-semibold">Remarks:</span> {p.remarks}</div>}
                {biblicalVerseEnabled && biblicalVerse && (
                  <div className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-0.5">
                    <p><span className="font-semibold">🌿 Biblical Reflection:</span> "{biblicalVerse.split(" — ")[0]}"</p>
                    {curriculumConnection && <p className="text-[10px] leading-relaxed"><span className="font-semibold">Curriculum Connection:</span> {curriculumConnection}</p>}
                    {verseExplanation && <p className="text-[10px] italic leading-relaxed">{verseExplanation}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
