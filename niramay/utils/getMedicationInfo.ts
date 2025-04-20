// Common medication information database
const medicationDatabase: Record<
  string,
  {
    commonUses: string[];
    simplifiedExplanation: string;
    commonSideEffects: string[];
    commonWarnings: string[];
  }
> = {
  // Antibiotics
  amoxicillin: {
    commonUses: [
      "Bacterial infections",
      "Respiratory infections",
      "Ear infections",
      "Urinary tract infections",
    ],
    simplifiedExplanation:
      "An antibiotic that fights bacteria in your body by preventing them from building cell walls, which they need to survive.",
    commonSideEffects: [
      "Nausea",
      "Vomiting",
      "Diarrhea",
      "Rash",
      "Stomach pain",
    ],
    commonWarnings: [
      "Take the full course even if you feel better",
      "May cause allergic reactions",
      "Take with food to reduce stomach upset",
      "Tell your doctor if you have any allergies to penicillin",
    ],
  },
  ciprofloxacin: {
    commonUses: [
      "Urinary tract infections",
      "Skin infections",
      "Respiratory infections",
      "Bone and joint infections",
    ],
    simplifiedExplanation:
      "An antibiotic that stops bacteria from multiplying by preventing them from copying their DNA.",
    commonSideEffects: [
      "Nausea",
      "Diarrhea",
      "Headache",
      "Dizziness",
      "Tendon pain",
    ],
    commonWarnings: [
      "Avoid sunlight exposure",
      "Take with plenty of water",
      "Don't take with dairy products",
      "May cause tendon damage",
      "Not recommended for children",
    ],
  },
  azithromycin: {
    commonUses: [
      "Respiratory infections",
      "Skin infections",
      "Ear infections",
      "Sexually transmitted infections",
    ],
    simplifiedExplanation:
      "An antibiotic that stops bacteria from growing by interfering with their protein production.",
    commonSideEffects: ["Diarrhea", "Stomach pain", "Nausea", "Headache"],
    commonWarnings: [
      "May cause heart rhythm problems",
      "Take on an empty stomach",
      "Don't take with antacids",
      "Finish the full course even if you feel better",
    ],
  },

  // Pain relievers
  ibuprofen: {
    commonUses: [
      "Pain relief",
      "Inflammation",
      "Fever reduction",
      "Menstrual cramps",
    ],
    simplifiedExplanation:
      "A pain reliever that works by reducing hormones that cause inflammation and pain in your body.",
    commonSideEffects: [
      "Stomach upset",
      "Heartburn",
      "Dizziness",
      "Mild headache",
    ],
    commonWarnings: [
      "Don't take on an empty stomach",
      "Avoid alcohol",
      "May increase risk of heart attack or stroke",
      "Not recommended for long-term use without doctor supervision",
    ],
  },
  acetaminophen: {
    commonUses: ["Pain relief", "Fever reduction", "Headaches", "Muscle aches"],
    simplifiedExplanation:
      "A pain reliever that works by blocking pain signals in your brain.",
    commonSideEffects: ["Rare when taken as directed", "Nausea", "Rash"],
    commonWarnings: [
      "Don't exceed recommended dose",
      "Liver damage can occur with excessive use",
      "Avoid alcohol",
      "May be in other medications, so check combinations carefully",
    ],
  },
  naproxen: {
    commonUses: [
      "Pain relief",
      "Inflammation",
      "Arthritis",
      "Menstrual cramps",
    ],
    simplifiedExplanation:
      "A pain reliever that reduces substances in the body that cause inflammation and pain.",
    commonSideEffects: [
      "Stomach upset",
      "Heartburn",
      "Drowsiness",
      "Dizziness",
    ],
    commonWarnings: [
      "Take with food",
      "Avoid alcohol",
      "May increase risk of heart attack or stroke",
      "May cause stomach bleeding",
    ],
  },

  // Blood pressure medications
  lisinopril: {
    commonUses: [
      "High blood pressure",
      "Heart failure",
      "Kidney protection",
      "After heart attack",
    ],
    simplifiedExplanation:
      "A medication that relaxes blood vessels, making it easier for your heart to pump blood through your body.",
    commonSideEffects: ["Dry cough", "Dizziness", "Headache", "Fatigue"],
    commonWarnings: [
      "May cause dizziness when standing up",
      "Can harm an unborn baby",
      "Don't use salt substitutes",
      "Monitor your blood pressure regularly",
    ],
  },
  amlodipine: {
    commonUses: [
      "High blood pressure",
      "Chest pain (angina)",
      "Coronary artery disease",
    ],
    simplifiedExplanation:
      "A medication that relaxes blood vessels so blood can flow more easily, reducing the work your heart has to do.",
    commonSideEffects: [
      "Swelling in ankles or feet",
      "Flushing",
      "Headache",
      "Dizziness",
    ],
    commonWarnings: [
      "May cause dizziness",
      "Don't stop taking suddenly",
      "Avoid grapefruit juice",
      "Tell doctor if swelling becomes severe",
    ],
  },

  // Diabetes medications
  metformin: {
    commonUses: [
      "Type 2 diabetes",
      "Prediabetes",
      "Polycystic ovary syndrome (PCOS)",
    ],
    simplifiedExplanation:
      "A medication that helps control blood sugar by improving how your body responds to insulin and reducing sugar produced by your liver.",
    commonSideEffects: [
      "Stomach upset",
      "Diarrhea",
      "Nausea",
      "Metallic taste",
    ],
    commonWarnings: [
      "Take with meals",
      "Start with low dose to minimize side effects",
      "Don't drink excessive alcohol",
      "May need to be temporarily stopped before certain medical procedures",
    ],
  },

  // Allergy medications
  loratadine: {
    commonUses: ["Allergies", "Hay fever", "Hives", "Runny nose"],
    simplifiedExplanation:
      "An antihistamine that reduces the effects of histamine, a natural substance that causes allergy symptoms.",
    commonSideEffects: [
      "Headache",
      "Drowsiness (rare)",
      "Dry mouth",
      "Fatigue",
    ],
    commonWarnings: [
      "Less drowsiness than other antihistamines",
      "May still affect alertness",
      "Avoid alcohol",
      "Tell doctor about any other medications you're taking",
    ],
  },
  cetirizine: {
    commonUses: ["Allergies", "Hay fever", "Hives", "Itchy skin"],
    simplifiedExplanation:
      "An antihistamine that blocks the effects of histamine, which causes allergy symptoms.",
    commonSideEffects: ["Drowsiness", "Dry mouth", "Fatigue", "Headache"],
    commonWarnings: [
      "May cause drowsiness",
      "Avoid alcohol",
      "Don't drive until you know how it affects you",
      "Tell doctor about other medications",
    ],
  },

  // Default for unknown medications
  default: {
    commonUses: [
      "Treatment of medical conditions as prescribed by your doctor",
    ],
    simplifiedExplanation:
      "This medication is prescribed for specific health conditions. Always follow your doctor's instructions.",
    commonSideEffects: [
      "Side effects vary - consult medication information leaflet",
      "Report any unusual symptoms to your doctor",
    ],
    commonWarnings: [
      "Take as directed by your doctor",
      "Don't stop taking without consulting your doctor",
      "Keep out of reach of children",
      "Check for interactions with other medications you take",
    ],
  },
};

// Function to find medication info from database (case insensitive)
export const getMedicationInfo = (medicationName: string) => {
  const normalizedName = medicationName.toLowerCase().trim();

  // Check for exact matches first
  for (const [key, value] of Object.entries(medicationDatabase)) {
    if (normalizedName === key.toLowerCase()) {
      return value;
    }
  }

  // Then check for partial matches
  for (const [key, value] of Object.entries(medicationDatabase)) {
    if (
      normalizedName.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedName)
    ) {
      return value;
    }
  }

  // Return default if no match found
  return medicationDatabase.default;
};
