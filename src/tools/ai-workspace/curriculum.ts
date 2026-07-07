export type CurriculumData = Record<string, Record<string, Record<string, string[]>>>

export const KICD_CURRICULUM: CurriculumData = {
  "Pre-Primary 1": {
    "Language Activities": {
      "Listening": ["Listening comprehension", "Phonological awareness", "Following instructions"],
      "Speaking": ["Oral expression", "Vocabulary building", "Conversation skills"],
      "Pre-Reading": ["Print awareness", "Letter recognition", "Picture reading"],
      "Pre-Writing": ["Fine motor skills", "Tracing", "Pattern writing"],
    },
    "Mathematical Activities": {
      "Number Work": ["Number recognition 1-10", "Counting objects", "Number formation"],
      "Measurement": ["Size comparison", "Length", "Mass"],
      "Shapes": ["2D shapes", "Shape sorting", "Shape patterns"],
    },
    "Environmental Activities": {
      "Social Environment": ["Self-awareness", "Family", "School"],
      "Natural Environment": ["Weather", "Plants", "Animals"],
    },
    "Psychomotor Activities": {
      "Gross Motor": ["Walking", "Running", "Jumping", "Balancing"],
      "Fine Motor": ["Manipulation", "Hand-eye coordination"],
    },
    "Religious Education": {
      "CRE": ["God's creation", "The family", "Prayer"],
      "IRE": ["Allah the creator", "Thanking Allah", "Cleanliness"],
      "HRE": ["Hindu values", "Family values", "Prayer"],
    },
  },
  "Pre-Primary 2": {
    "Language Activities": {
      "Listening": ["Listening comprehension", "Rhymes and poems", "Story listening"],
      "Speaking": ["Story telling", "Descriptive language", "Asking questions"],
      "Pre-Reading": ["Letter-sound association", "Syllable reading", "Simple words"],
      "Pre-Writing": ["Letter formation", "Word writing", "Sentence writing"],
    },
    "Mathematical Activities": {
      "Number Work": ["Numbers 1-20", "Counting and cardinality", "Simple addition", "Simple subtraction"],
      "Measurement": ["Length", "Mass", "Capacity", "Time"],
      "Shapes and Space": ["2D and 3D shapes", "Position and direction"],
    },
    "Environmental Activities": {
      "Social Environment": ["Community helpers", "Transport", "Our country"],
      "Natural Environment": ["Weather patterns", "Plant growth", "Animal care"],
    },
    "Psychomotor Activities": {
      "Gross Motor": ["Locomotor skills", "Manipulative skills", "Rhythmic activities"],
      "Fine Motor": ["Cutting and pasting", "Molding", "Drawing and coloring"],
    },
    "Religious Education": {
      "CRE": ["Jesus Christ", "The church", "Christian values"],
      "IRE": ["Prophets", "The Quran", "Islamic values"],
      "HRE": ["Festivals", "Temple", "Hindu values"],
    },
  },
  "Grade 1": {
    "English": {
      "Listening and Speaking": ["Listening comprehension", "Pronunciation", "Oral vocabulary"],
      "Reading": ["Letter sounds", "Word recognition", "Reading simple sentences"],
      "Writing": ["Letter formation", "Spelling", "Writing simple sentences"],
      "Grammar": ["Nouns", "Verbs", "Adjectives", "Simple tenses"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Ufahamu wa kusikiliza", "Matamshi", "Msamiati"],
      "Kusoma": ["Sauti za herufi", "Kusoma maneno", "Kusoma sentensi"],
      "Kuandika": ["Uandishi wa herufi", "Tahajia", "Kuandika sentensi"],
    },
    "Mathematics": {
      "Numbers": ["Number concepts 1-100", "Addition", "Subtraction", "Place value"],
      "Measurement": ["Length", "Mass", "Capacity", "Time", "Money"],
      "Geometry": ["2D shapes", "3D shapes", "Position and direction"],
      "Data Handling": ["Collecting data", "Representing data"],
    },
    "Environmental Activities": {
      "Social Environment": ["Our school", "Our home", "Our neighborhood"],
      "Natural Environment": ["Weather", "Soil", "Water", "Plants", "Animals"],
      "Care for the Environment": ["Cleaning", "Waste management", "Tree planting"],
    },
    "Hygiene and Nutrition": {
      "Personal Hygiene": ["Hand washing", "Oral hygiene", "Bathing"],
      "Food and Nutrition": ["Food groups", "Healthy eating", "Food safety"],
    },
    "Religious Education": {
      "CRE": ["God's love", "The birth of Jesus", "Christian living"],
      "IRE": ["Faith in Allah", "Prayer (Salah)", "Islamic manners"],
      "HRE": ["Hindu gods", "Festivals", "Moral values"],
    },
    "Creative Arts": {
      "Art and Craft": ["Drawing", "Painting", "Modeling", "Paper craft"],
      "Music": ["Singing", "Rhythm", "Musical instruments"],
    },
    "Physical Education": {
      "Basic Motor Skills": ["Running", "Jumping", "Throwing", "Catching"],
      "Games": ["Traditional games", "Team games", "Relay races"],
    },
  },
  "Grade 2": {
    "English": {
      "Listening and Speaking": ["Listening comprehension", "Oral narratives", "Vocabulary development"],
      "Reading": ["Phonics", "Reading fluency", "Reading comprehension"],
      "Writing": ["Sentence writing", "Paragraph writing", "Spelling"],
      "Grammar": ["Nouns and pronouns", "Verbs and tenses", "Conjunctions"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Ufahamu", "Hadithi simulizi", "Msamiati"],
      "Kusoma": ["Sauti na silabi", "Kusoma kwa fasaha", "Ufahamu wa kusoma"],
      "Kuandika": ["Kuandika aya", "Tahajia", "Sarufi"],
    },
    "Mathematics": {
      "Numbers": ["Numbers 1-500", "Addition with regrouping", "Subtraction with regrouping", "Multiplication"],
      "Measurement": ["Length", "Mass", "Capacity", "Time", "Money problems"],
      "Geometry": ["2D shapes", "3D objects", "Symmetry", "Patterns"],
      "Data Handling": ["Pictographs", "Tallies", "Simple graphs"],
    },
    "Environmental Activities": {
      "Social Environment": ["Our district", "Occupations", "Cultural events"],
      "Natural Environment": ["Weather seasons", "Water conservation", "Soil conservation"],
      "Care for the Environment": ["Pollution", "Conservation", "Disaster preparedness"],
    },
    "Hygiene and Nutrition": {
      "Personal Hygiene": ["Body hygiene", "Dental care", "Proper toileting"],
      "Food and Nutrition": ["Balanced diet", "Meal planning", "Food preservation"],
    },
    "Religious Education": {
      "CRE": ["The life of Jesus", "Parables", "Christian values in daily life"],
      "IRE": ["The life of Prophet Muhammad", "The Quran", "Islamic values"],
      "HRE": ["Puranas", "Hindu practices", "Moral stories"],
    },
    "Creative Arts": {
      "Art and Craft": ["Painting techniques", "Weaving", "Beadwork"],
      "Music": ["Melody", "Dynamics", "Traditional songs"],
    },
    "Physical Education": {
      "Basic Motor Skills": ["Locomotor skills", "Non-locomotor skills", "Manipulative skills"],
      "Games and Sports": ["Ball games", "Athletics", "Swimming basics"],
    },
  },
  "Grade 3": {
    "English": {
      "Listening and Speaking": ["Active listening", "Oral presentations", "Vocabulary in context"],
      "Reading": ["Reading comprehension", "Inference", "Reading different texts"],
      "Writing": ["Creative writing", "Descriptive writing", "Punctuation"],
      "Grammar": ["Parts of speech", "Sentence structure", "Tenses"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Ufahamu wa kina", "Mazungumzo", "Msamiati mpana"],
      "Kusoma": ["Kusoma kwa ufasaha", "Ufahamu", "Sarufi katika kusoma"],
      "Kuandika": ["Insha fupi", "Sarufi", "Tahajia sahihi"],
    },
    "Mathematics": {
      "Numbers": ["Numbers 1-1000", "Addition and subtraction", "Multiplication tables", "Division"],
      "Measurement": ["Length", "Mass", "Capacity", "Time", "Area", "Perimeter"],
      "Geometry": ["Angles", "2D shapes properties", "3D objects", "Symmetry"],
      "Data Handling": ["Bar graphs", "Data interpretation", "Probability"],
    },
    "Science and Technology": {
      "Living Things": ["Plants", "Animals", "Human body"],
      "Environment": ["Weather", "Water", "Soil"],
      "Energy": ["Light", "Sound", "Heat"],
      "Technology": ["Simple machines", "Computers"],
    },
    "Social Studies": {
      "Our Country": ["Physical features", "Counties", "Our capital city"],
      "Our Resources": ["Natural resources", "Human resources"],
      "Citizenship": ["Rights and responsibilities", "National symbols", "Our constitution"],
    },
    "Religious Education": {
      "CRE": ["The early church", "Christian living in community"],
      "IRE": ["Islamic teachings", "Moral conduct in Islam"],
      "HRE": ["Hindu scriptures", "Ethical living"],
    },
  },
  "Grade 4": {
    "English": {
      "Listening and Speaking": ["Critical listening", "Oral reports", "Debates"],
      "Reading": ["Reading independently", "Critical reading", "Reading for information"],
      "Writing": ["Narrative writing", "Expository writing", "Grammar in writing"],
      "Grammar": ["Complex sentences", "Parts of speech in depth", "Punctuation"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Ufahamu wa kina", "Mjadala", "Mawasilisho"],
      "Kusoma": ["Kusoma kwa uelewa", "Fasihi", "Sarufi"],
      "Kuandika": ["Insha", "Barua", "Tahajia na sarufi"],
    },
    "Mathematics": {
      "Numbers": ["Place value to millions", "Operations", "Fractions", "Decimals"],
      "Measurement": ["Length, mass, capacity", "Perimeter and area", "Time and speed"],
      "Geometry": ["Angles and lines", "2D shapes", "3D objects", "Construction"],
      "Data Handling": ["Line graphs", "Mean, mode, median", "Probability"],
    },
    "Science and Technology": {
      "Living Things": ["Classification of plants", "Classification of animals", "Human systems"],
      "Environment": ["Ecosystems", "Weather patterns", "Natural disasters"],
      "Energy": ["Forms of energy", "Energy transformation", "Electricity"],
      "Technology": ["Digital devices", "Programming basics", "Internet safety"],
    },
    "Social Studies": {
      "People and Relationships": ["Culture", "Social organizations", "Conflict resolution"],
      "Resources and Economic Activities": ["Natural resources", "Agriculture", "Trade"],
      "Political Systems": ["Government of Kenya", "Devolution", "The constitution"],
    },
    "CRE": {
      "Creation and Covenant": ["The biblical creation", "God's covenant with Abraham"],
      "Life of Jesus": ["The ministry of Jesus", "The passion and resurrection"],
      "Christian Living": ["The church", "Christian values in society"],
    },
    "Agriculture": {
      "Soil": ["Soil types", "Soil preparation", "Soil conservation"],
      "Crops": ["Crop production", "Crop pests", "Crop diseases"],
      "Animals": ["Animal production", "Animal health", "Animal products"],
    },
    "Home Science": {
      "Food and Nutrition": ["Meal planning", "Cooking methods", "Food preservation"],
      "Textiles": ["Fabric types", "Sewing basics", "Clothing care"],
      "Home Management": ["Cleaning", "Home safety", "Budgeting"],
    },
  },
  "Grade 5": {
    "English": {
      "Listening and Speaking": ["Listening for details", "Oral presentations", "Dialogue"],
      "Reading": ["Comprehension strategies", "Reading for analysis", "Literary devices"],
      "Writing": ["Essay writing", "Letter writing", "Creative composition"],
      "Grammar": ["Advanced grammar", "Sentence combining", "Figurative language"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Ufahamu wa makala", "Hotuba", "Majadiliano"],
      "Kusoma": ["Uchambuzi wa kazi za fasihi", "Usomaji bora"],
      "Kuandika": ["Insha za kueleza", "Insha za kubuni", "Barua rasmi"],
    },
    "Mathematics": {
      "Numbers": ["Place value", "Operations on whole numbers", "Fractions and decimals", "Percentages"],
      "Measurement": ["Area of triangles", "Volume", "Circumference", "Speed"],
      "Geometry": ["Angles on a line", "Coordinate geometry", "Scale drawing"],
      "Data Handling": ["Data collection methods", "Data presentation", "Data interpretation"],
    },
    "Science and Technology": {
      "Living Things": ["Plant and animal cells", "Reproduction", "Health education"],
      "Environment": ["Conservation", "Pollution control", "Climate change"],
      "Energy": ["Electric circuits", "Magnetism", "Light and optics"],
      "Technology": ["Coding", "Digital content creation", "Online collaboration"],
    },
    "Social Studies": {
      "Natural and Built Environments": ["Physical features of Kenya", "Map reading", "Settlement patterns"],
      "Resources": ["Agriculture", "Wildlife and tourism", "Mining and forestry"],
      "Governance": ["The three arms of government", "The judiciary", "Human rights"],
    },
    "CRE": {
      "Creation and Covenant": ["God's creation and human responsibility"],
      "Life of Jesus": ["The teachings of Jesus", "The early church"],
      "Christian Living": ["Christian ethics", "Community service"],
    },
    "Agriculture": {
      "Soil and Water": ["Soil conservation", "Water harvesting", "Irrigation"],
      "Crop Production": ["Crop rotation", "Organic farming", "Harvesting and storage"],
      "Animal Production": ["Animal breeds", "Feeds and feeding", "Animal diseases"],
    },
    "Home Science": {
      "Food and Nutrition": ["Nutrients and their functions", "Special diets", "Food hygiene"],
      "Textiles and Clothing": ["Fibers and fabrics", "Garment construction", "Fabric decoration"],
    },
  },
  "Grade 6": {
    "English": {
      "Listening and Speaking": ["Persuasive speaking", "Interviews", "Public speaking"],
      "Reading": ["Analytical reading", "Reading for values", "Reading plays and poetry"],
      "Writing": ["Report writing", "Speech writing", "Journal writing"],
      "Grammar": ["Complex and compound sentences", "Active and passive voice", "Reported speech"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Mahojiano", "Michoro ya mazungumzo", "Ushairi"],
      "Kusoma": ["Fasihi andishi", "Tathmini ya kazi za fasihi"],
      "Kuandika": ["Insha za hoja", "Ripoti", "Barua rasmi na nusu rasmi"],
    },
    "Mathematics": {
      "Numbers": ["Numbers beyond millions", "Operations on decimals", "Percentages and ratios", "Integers"],
      "Measurement": ["Area of quadrilaterals", "Volume and capacity", "Temperature", "Average"],
      "Geometry": ["Circles", "Triangles", "Quadrilaterals", "Construction"],
      "Algebra": ["Algebraic expressions", "Equations", "Inequalities"],
    },
    "Science and Technology": {
      "Living Things": ["Classification of living things", "Cells and tissues", "Reproduction in plants and animals"],
      "Environment": ["Ecosystems and habitats", "Environmental conservation", "Pollution"],
      "Energy and Forces": ["Forms of energy", "Work and power", "Simple machines"],
      "Technology": ["Computer networks", "Digital citizenship", "Programming"],
    },
    "Social Studies": {
      "Africa and the World": ["Physical features of Africa", "Historical events", "International relations"],
      "Resources and Development": ["Economic development", "Globalization", "Environmental sustainability"],
      "Governance and Democracy": ["Democracy and human rights", "Peace and conflict resolution"],
    },
    "CRE": {
      "Creation and Covenant": ["God's plan for creation", "Covenant and promise"],
      "Life of Jesus": ["The birth and childhood of Jesus", "The ministry", "The resurrection"],
      "Christian Living": ["The Holy Spirit", "The church in the world", "Christian morality"],
    },
    "Agriculture": {
      "Soil Fertility": ["Soil nutrients", "Organic and inorganic fertilizers", "Compost making"],
      "Crop Production": ["Land preparation", "Planting methods", "Crop management"],
      "Animal Production": ["Animal handling", "Animal health", "Animal products"],
    },
    "Home Science": {
      "Food and Nutrition": ["Balanced diets", "Food preparation methods", "Food storage"],
      "Textiles": ["Fabric selection", "Sewing techniques", "Clothing repair"],
    },
  },
  "Grade 7": {
    "English": {
      "Listening and Speaking": ["Critical listening", "Oral presentations", "Group discussions", "Debates"],
      "Reading": ["Reading poetry", "Reading drama", "Reading novels", "Critical analysis"],
      "Writing": ["Essays", "Creative writing", "Transactional writing", "Research writing"],
      "Grammar": ["Advanced sentence structure", "Stylistic devices", "Language and power"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Ufahamu wa dhana", "Majadiliano ya kiwango cha juu", "Tahakiki"],
      "Kusoma": ["Fasihi andishi", "Tahakiki ya fasihi", "Uchambuzi wa maandishi"],
      "Kuandika": ["Insha za kiwango cha juu", "Muhtasari", "Ripoti za utafiti"],
    },
    "Mathematics": {
      "Numbers": ["Number patterns", "Ratios and proportions", "Decimals and percentages"],
      "Measurement": ["Perimeter and area", "Volume and capacity", "Surface area"],
      "Geometry": ["Geometric constructions", "Angles and triangles", "Pythagoras theorem"],
      "Algebra": ["Linear equations", "Simultaneous equations", "Inequalities"],
    },
    "Integrated Science": {
      "Scientific Investigation": ["Scientific method", "Laboratory safety", "Measurement"],
      "Matter": ["States of matter", "Atoms and elements", "Compounds and mixtures"],
      "Life Science": ["Cells and organization", "Nutrition", "Transport systems"],
      "Physical Science": ["Forces and motion", "Energy transformations", "Electricity"],
    },
    "Social Studies": {
      "History and Government": ["Early man", "African civilizations", "Colonialism in Kenya"],
      "Geography": ["Map reading", "Weather and climate", "Vegetation"],
      "Citizenship": ["The constitution of Kenya", "Human rights", "National integration"],
    },
    "CRE": {
      "Biblical Concepts": ["Creation and fall of man", "Covenants in the Old Testament"],
      "Life and Teachings of Jesus": ["The kingdom of God", "The sermon on the mount"],
      "The Church": ["The early church in Acts", "The role of the church today"],
    },
    "Business Studies": {
      "Introduction to Business": ["Business and its environment", "Entrepreneurship"],
      "Business Operations": ["Goods and services", "Distribution", "Marketing"],
      "Financial Literacy": ["Money and banking", "Savings and investments", "Budgeting"],
    },
    "Agriculture": {
      "Land and Water Management": ["Soil conservation", "Water harvesting", "Drainage"],
      "Crop and Animal Production": ["Crop diseases and pests", "Animal breeds", "Farm records"],
    },
    "Life Skills": {
      "Self-awareness": ["Self-esteem", "Emotional intelligence", "Personal values"],
      "Social Skills": ["Communication", "Relationships", "Conflict resolution"],
      "Decision Making": ["Problem solving", "Critical thinking", "Goal setting"],
    },
    "Pre-Technical Studies": {
      "Safety and Tools": ["Workshop safety", "Hand tools", "Power tools"],
      "Materials": ["Wood", "Metal", "Plastics"],
      "Technical Drawing": ["Drawing instruments", "Geometric constructions", "Orthographic projection"],
    },
  },
  "Grade 8": {
    "English": {
      "Listening and Speaking": ["Listening for inference", "Oral literature", "Persuasive speaking"],
      "Reading": ["Reading for critical analysis", "Literature analysis", "Reading for values"],
      "Writing": ["Expository essays", "Persuasive writing", "Summaries", "Reports"],
      "Grammar": ["Stylistic devices", "Language manipulation", "Standard English"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Uchambuzi wa mawasiliano", "Fasihi simulizi", "Ushairi"],
      "Kusoma": ["Uchambuzi wa fasihi andishi", "Ulinganishi wa kazi za fasihi"],
      "Kuandika": ["Insha za kuelezea", "Insha za kusisimua", "Taarifa na ripoti"],
    },
    "Mathematics": {
      "Numbers": ["Indices", "Standard form", "Number sequences"],
      "Measurement": ["Area of circles", "Surface area of solids", "Volume of solids"],
      "Geometry": ["Angle properties", "Similarity and congruence", "Vectors"],
      "Algebra": ["Linear equations", "Simultaneous equations", "Quadratic expressions"],
    },
    "Integrated Science": {
      "Scientific Investigation": ["Experimental design", "Data analysis", "Scientific reporting"],
      "Matter and Energy": ["Chemical reactions", "Energy changes", "Waves"],
      "Life Science": ["Genetics", "Evolution", "Ecology and ecosystems"],
      "Physical Science": ["Pressure", "Machines and work", "Electricity and magnetism"],
    },
    "Social Studies": {
      "History and Government": ["Nationalism in Kenya", "The independence movement", "Modern Kenya"],
      "Geography": ["Map work", "Field work", "Environmental management"],
      "Citizenship": ["Devolution", "Governance", "Global citizenship"],
    },
    "CRE": {
      "Old Testament": ["The prophets of Israel", "Wisdom literature"],
      "Jesus and the Gospel": ["The gospel of Luke", "The Holy Spirit"],
      "Christian Ethics": ["Christian morality", "Social justice", "Environmental ethics"],
    },
    "Business Studies": {
      "Entrepreneurship": ["Business opportunities", "Business plans", "Business funding"],
      "Office Practice": ["Office equipment", "Communication", "Records management"],
    },
    "Agriculture": {
      "Farm Management": ["Farm planning", "Farm budgeting", "Marketing"],
      "Value Addition": ["Processing", "Preservation", "Packaging"],
    },
    "Life Skills": {
      "Coping with Challenges": ["Stress management", "Peer pressure", "Substance abuse"],
      "Career Development": ["Career exploration", "Career choices", "Work ethics"],
    },
    "Pre-Technical Studies": {
      "Materials Processing": ["Wood processing", "Metal processing", "Recycling"],
      "Energy and Power": ["Renewable energy", "Energy conservation"],
      "Technical Drawing": ["Isometric drawing", "Perspective drawing", "CAD basics"],
    },
  },
  "Grade 9": {
    "English": {
      "Listening and Speaking": ["Critical evaluation", "Oral literature analysis", "Public discourse"],
      "Reading": ["Reading for critical response", "Comparative literature", "Research reading"],
      "Writing": ["Analytical writing", "Research papers", "Journalistic writing"],
      "Grammar and Language": ["Advanced language study", "Language and identity", "Language and power"],
    },
    "Kiswahili": {
      "Kusikiliza na Kuzungumza": ["Uchanganuzi wa mawasiliano", "Mbinu za kusemera mbele ya hadhara"],
      "Kusoma": ["Fasihi linganishi", "Uhakiki wa kina", "Nadharia za fasihi"],
      "Kuandika": ["Insha za hoja", "Ripoti za utafiti", "Makala"],
    },
    "Mathematics": {
      "Numbers": ["Real numbers", "Surds", "Logarithms"],
      "Measurement": ["Area approximation", "Volume of complex solids"],
      "Geometry": ["Trigonometry", "Loci", "Matrices and transformations"],
      "Algebra": ["Quadratic equations", "Linear programming", "Sequences and series"],
    },
    "Integrated Science": {
      "Scientific Investigation": ["Research methods", "Scientific communication"],
      "Matter and Reactions": ["The periodic table", "Bonding and structure", "Chemical equations"],
      "Life Science": ["Human body systems", "Health and disease", "Biotechnology"],
      "Physics": ["Motion and forces", "Energy and work", "Electromagnetism"],
    },
    "Social Studies": {
      "History and Government": ["World wars", "International organizations", "Contemporary issues"],
      "Geography": ["Population studies", "Urbanization", "Regional integration"],
      "Citizenship": ["Global governance", "Environmental citizenship", "Peace education"],
    },
    "CRE": {
      "Biblical Concepts": ["The nature of God", "Salvation", "The second coming"],
      "Christian Ethics": ["Bioethics", "Sexuality and marriage", "Wealth and poverty"],
    },
    "Business Studies": {
      "Business Economics": ["Demand and supply", "Market structures", "National income"],
      "Accounting": ["Bookkeeping", "Financial statements", "Interpretation of accounts"],
    },
    "Agriculture": {
      "Agricultural Economics": ["Farm planning", "Agribusiness", "Agricultural policies"],
      "Sustainable Agriculture": ["Organic farming", "Climate-smart agriculture", "Biotechnology"],
    },
    "Life Skills": {
      "Self and Society": ["Identity and self-concept", "Social responsibility", "Community service"],
      "Future Planning": ["Career planning", "Financial planning", "Life goals"],
    },
    "Pre-Technical Studies": {
      "Design and Innovation": ["Design process", "Innovation", "Problem solving"],
      "Technology and Society": ["Technology and development", "ICT in society"],
    },
  },
}

export function getLearningAreas(grade: string): string[] {
  const gradeData = KICD_CURRICULUM[grade]
  if (!gradeData) return []
  return Object.keys(gradeData)
}

export function getStrands(grade: string, learningArea: string): string[] {
  const gradeData = KICD_CURRICULUM[grade]
  if (!gradeData) return []
  const areaData = gradeData[learningArea]
  if (!areaData) return []
  return Object.keys(areaData)
}

export function getSubStrands(grade: string, learningArea: string, strand: string): string[] {
  const gradeData = KICD_CURRICULUM[grade]
  if (!gradeData) return []
  const areaData = gradeData[learningArea]
  if (!areaData) return []
  const strandData = areaData[strand]
  if (!strandData) return []
  return strandData
}

export const PROMPT_TEMPLATES: Record<string, string> = {
  "lesson-planner": "Generate a detailed KICD-compliant CBC lesson plan for {grade} {learningArea} on the topic: ",
  "assessment": "Design a competency-based assessment for {grade} {learningArea} - {strand}. Include: ",
  "comment-generator": "Write professional CBC report card comments for a {grade} student in {learningArea}. ",
  "scheme-of-work": "Create a termly scheme of work for {grade} {learningArea} covering: ",
  "revision-planner": "Create a structured revision plan for {grade} {learningArea} focusing on: ",
  "generate-bulk-comments": "Generate 20 CBC report card comments for {grade} class in {learningArea}. ",
}
