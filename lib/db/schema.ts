// Type definitions for Novellia Pets database schema

export type AnimalType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'

export type RecordType = 'vaccine' | 'allergy' | 'lab_result' | 'vital'

export type Severity = 'mild' | 'severe'

export interface Pet {
  id: number
  name: string
  animalType: AnimalType
  ownerName: string
  dateOfBirth: string // ISO 8601 format (YYYY-MM-DD)
  createdAt: string
  updatedAt: string
}

export interface MedicalRecord {
  id: number
  petId: number
  recordType: RecordType
  data: VaccineData | AllergyData | LabResultData
  createdAt: string
}

export interface VaccineData {
  vaccineName: string
  administeredDate: string
}

export interface AllergyData {
  allergyName: string
  reactions: string[]
  severity: Severity
}

export interface LabResultData {
  testName: string
  testDate: string
  results: Record<string, unknown>
}

export interface PetWithRecords extends Pet {
  records: MedicalRecord[]
}

export interface Stats {
  totalPets: number
  totalVaccines: number
  totalAllergies: number
}

// Input types for creating new records
export interface CreatePetInput {
  name: string
  animalType: AnimalType
  ownerName: string
  dateOfBirth: string
}

export interface VaccineInput {
  vaccineName: string
  administeredDate: string
}

export interface AllergyInput {
  allergyName: string
  reactions: string[]
  severity: Severity
}
