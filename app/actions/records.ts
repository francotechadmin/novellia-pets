'use server'

import { getDb } from '@/lib/db/client'
import { vaccineSchema, allergySchema } from '@/lib/validations/record'
import type { MedicalRecord, VaccineInput, AllergyInput, PetRow, MedicalRecordRow } from '@/lib/db/schema'

export async function addVaccineRecord(
  petId: number,
  data: VaccineInput
): Promise<{ data?: MedicalRecord; error?: string }> {
  try {
    // Validate input
    const validation = vaccineSchema.safeParse(data)
    if (!validation.success) {
      return { error: validation.error.issues[0].message }
    }

    const db = getDb()

    // Check if pet exists and get birth date
    const pet = db.prepare('SELECT date_of_birth FROM pets WHERE id = ?').get(petId) as Pick<PetRow, 'date_of_birth'> | undefined

    if (!pet) {
      return { error: 'Pet not found' }
    }

    // Validate vaccine date is not before birth date
    const birthDate = new Date(pet.date_of_birth)
    const vaccineDate = new Date(data.administeredDate)

    if (vaccineDate < birthDate) {
      return { error: 'Vaccine date cannot be before the pet\'s birth date' }
    }

    // Insert vaccine record
    const stmt = db.prepare(`
      INSERT INTO medical_records (pet_id, record_type, data)
      VALUES (?, 'vaccine', ?)
    `)

    const result = stmt.run(petId, JSON.stringify({
      vaccineName: data.vaccineName,
      administeredDate: data.administeredDate,
    }))

    // Retrieve the created record
    const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(result.lastInsertRowid) as MedicalRecordRow | undefined

    if (!record) {
      return { error: 'Failed to create vaccine record' }
    }

    const transformedRecord: MedicalRecord = {
      id: record.id,
      petId: record.pet_id,
      recordType: record.record_type as MedicalRecord['recordType'],
      data: JSON.parse(record.data),
      createdAt: record.created_at,
    }

    return { data: transformedRecord }
  } catch (error) {
    console.error('Error adding vaccine record:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function addAllergyRecord(
  petId: number,
  data: AllergyInput
): Promise<{ data?: MedicalRecord; error?: string }> {
  try {
    // Validate input
    const validation = allergySchema.safeParse(data)
    if (!validation.success) {
      return { error: validation.error.issues[0].message }
    }

    const db = getDb()

    // Check if pet exists
    const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(petId)

    if (!pet) {
      return { error: 'Pet not found' }
    }

    // Insert allergy record
    const stmt = db.prepare(`
      INSERT INTO medical_records (pet_id, record_type, data)
      VALUES (?, 'allergy', ?)
    `)

    const result = stmt.run(petId, JSON.stringify({
      allergyName: data.allergyName,
      reactions: data.reactions,
      severity: data.severity,
    }))

    // Retrieve the created record
    const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(result.lastInsertRowid) as MedicalRecordRow | undefined

    if (!record) {
      return { error: 'Failed to create allergy record' }
    }

    const transformedRecord: MedicalRecord = {
      id: record.id,
      petId: record.pet_id,
      recordType: record.record_type as MedicalRecord['recordType'],
      data: JSON.parse(record.data),
      createdAt: record.created_at,
    }

    return { data: transformedRecord }
  } catch (error) {
    console.error('Error adding allergy record:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function getPetRecords(
  petId: number,
  type?: string
): Promise<{ data?: MedicalRecord[]; error?: string }> {
  try {
    const db = getDb()

    let query = 'SELECT * FROM medical_records WHERE pet_id = ?'
    const params: any[] = [petId]

    if (type) {
      query += ' AND record_type = ?'
      params.push(type)
    }

    query += ' ORDER BY created_at DESC'

    const rows = db.prepare(query).all(...params) as MedicalRecordRow[]

    const records: MedicalRecord[] = rows.map(row => ({
      id: row.id,
      petId: row.pet_id,
      recordType: row.record_type as MedicalRecord['recordType'],
      data: JSON.parse(row.data),
      createdAt: row.created_at,
    }))

    return { data: records }
  } catch (error) {
    console.error('Error fetching records:', error)
    return { error: 'Failed to load records' }
  }
}
