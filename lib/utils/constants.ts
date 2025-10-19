// Animal types
export const ANIMAL_TYPES = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'other', label: 'Other' },
] as const

// Severity levels
export const SEVERITY_LEVELS = [
  { value: 'mild', label: 'Mild' },
  { value: 'severe', label: 'Severe' },
] as const

// Common allergy reactions
export const COMMON_REACTIONS = [
  'Hives',
  'Itching',
  'Swelling',
  'Rash',
  'Vomiting',
  'Diarrhea',
  'Difficulty breathing',
  'Sneezing',
  'Watery eyes',
  'Lethargy',
] as const

// Record types
export const RECORD_TYPES = {
  VACCINE: 'vaccine',
  ALLERGY: 'allergy',
  LAB_RESULT: 'lab_result',
  VITAL: 'vital',
} as const
