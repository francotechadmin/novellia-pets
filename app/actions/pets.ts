'use server'

import { getDb } from '@/lib/db/client'
import { petSchema } from '@/lib/validations/pet'
import type { Pet, PetWithRecords, CreatePetInput, Stats, PetRow, MedicalRecordRow, MedicalRecord } from '@/lib/db/schema'

export async function createPet(data: CreatePetInput): Promise<{ data?: Pet; error?: string }> {
  try {
    // Validate input
    const validation = petSchema.safeParse(data)
    if (!validation.success) {
      return { error: validation.error.issues[0].message }
    }

    const db = getDb()

    // Insert pet into database
    const stmt = db.prepare(`
      INSERT INTO pets (name, animal_type, owner_name, date_of_birth)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(
      data.name,
      data.animalType,
      data.ownerName,
      data.dateOfBirth
    )

    // Retrieve the created pet
    const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(result.lastInsertRowid) as PetRow | undefined

    if (!pet) {
      return { error: 'Failed to create pet' }
    }

    // Transform database row to Pet object
    const transformedPet: Pet = {
      id: pet.id,
      name: pet.name,
      animalType: pet.animal_type as Pet['animalType'],
      ownerName: pet.owner_name,
      dateOfBirth: pet.date_of_birth,
      createdAt: pet.created_at,
      updatedAt: pet.updated_at,
    }

    return { data: transformedPet }
  } catch (error) {
    console.error('Error creating pet:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function getPets(ownerName?: string): Promise<{ data?: Pet[]; error?: string }> {
  try {
    const db = getDb()

    let query = 'SELECT * FROM pets'
    const params: string[] = []

    if (ownerName) {
      query += ' WHERE owner_name = ?'
      params.push(ownerName)
    }

    query += ' ORDER BY created_at DESC'

    const rows = db.prepare(query).all(...params) as PetRow[]

    const pets: Pet[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      animalType: row.animal_type as Pet['animalType'],
      ownerName: row.owner_name,
      dateOfBirth: row.date_of_birth,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return { data: pets }
  } catch (error) {
    console.error('Error fetching pets:', error)
    return { error: 'Failed to load pets' }
  }
}

export async function getPetById(id: number): Promise<{ data?: PetWithRecords; error?: string }> {
  try {
    const db = getDb()

    // Get pet
    const petRow = db.prepare('SELECT * FROM pets WHERE id = ?').get(id) as PetRow | undefined

    if (!petRow) {
      return { error: 'Pet not found' }
    }

    // Get all medical records for this pet
    const recordRows = db.prepare(`
      SELECT * FROM medical_records
      WHERE pet_id = ?
      ORDER BY created_at DESC
    `).all(id) as MedicalRecordRow[]

    const pet: Pet = {
      id: petRow.id,
      name: petRow.name,
      animalType: petRow.animal_type as Pet['animalType'],
      ownerName: petRow.owner_name,
      dateOfBirth: petRow.date_of_birth,
      createdAt: petRow.created_at,
      updatedAt: petRow.updated_at,
    }

    const records = recordRows.map(row => ({
      id: row.id,
      petId: row.pet_id,
      recordType: row.record_type as MedicalRecord['recordType'],
      data: JSON.parse(row.data),
      createdAt: row.created_at,
    }))

    const petWithRecords: PetWithRecords = {
      ...pet,
      records,
    }

    return { data: petWithRecords }
  } catch (error) {
    console.error('Error fetching pet:', error)
    return { error: 'Failed to load pet' }
  }
}

export async function getPetsWithCounts(ownerName?: string): Promise<{ data?: Array<{ pet: Pet; recordCounts: { vaccines: number; allergies: number } }>; error?: string }> {
  try {
    const db = getDb()

    // Single query with GROUP BY to get pets and their record counts
    let query = `
      SELECT
        p.*,
        COUNT(CASE WHEN mr.record_type = 'vaccine' THEN 1 END) as vaccine_count,
        COUNT(CASE WHEN mr.record_type = 'allergy' THEN 1 END) as allergy_count
      FROM pets p
      LEFT JOIN medical_records mr ON p.id = mr.pet_id`

    const params: string[] = []

    if (ownerName) {
      query += ' WHERE p.owner_name = ?'
      params.push(ownerName)
    }

    query += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

    const rows = db.prepare(query).all(...params) as Array<PetRow & { vaccine_count: number; allergy_count: number }>

    const petsWithCounts = rows.map(row => ({
      pet: {
        id: row.id,
        name: row.name,
        animalType: row.animal_type as Pet['animalType'],
        ownerName: row.owner_name,
        dateOfBirth: row.date_of_birth,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      recordCounts: {
        vaccines: row.vaccine_count,
        allergies: row.allergy_count,
      },
    }))

    return { data: petsWithCounts }
  } catch (error) {
    console.error('Error fetching pets with counts:', error)
    return { error: 'Failed to load pets' }
  }
}

export async function getStats(): Promise<{ data?: Stats; error?: string }> {
  try {
    const db = getDb()

    const totalPets = db.prepare('SELECT COUNT(*) as count FROM pets').get() as { count: number }

    const totalVaccines = db.prepare(
      "SELECT COUNT(*) as count FROM medical_records WHERE record_type = 'vaccine'"
    ).get() as { count: number }

    const totalAllergies = db.prepare(
      "SELECT COUNT(*) as count FROM medical_records WHERE record_type = 'allergy'"
    ).get() as { count: number }

    const stats: Stats = {
      totalPets: totalPets.count,
      totalVaccines: totalVaccines.count,
      totalAllergies: totalAllergies.count,
    }

    return { data: stats }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { error: 'Failed to load statistics' }
  }
}
