'use server'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'userPetIds'

export async function getUserPetIds(): Promise<number[]> {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE_NAME)?.value

  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function addPetToUser(petId: number): Promise<void> {
  const cookieStore = await cookies()
  const currentPetIds = await getUserPetIds()

  // Avoid duplicates
  if (currentPetIds.includes(petId)) {
    return
  }

  const updatedPetIds = [...currentPetIds, petId]

  cookieStore.set(COOKIE_NAME, JSON.stringify(updatedPetIds), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  })
}

export async function removePetFromUser(petId: number): Promise<void> {
  const cookieStore = await cookies()
  const currentPetIds = await getUserPetIds()
  const updatedPetIds = currentPetIds.filter(id => id !== petId)

  if (updatedPetIds.length === 0) {
    cookieStore.delete(COOKIE_NAME)
  } else {
    cookieStore.set(COOKIE_NAME, JSON.stringify(updatedPetIds), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    })
  }
}

export async function clearUserPets(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Backward compatibility: get first pet ID if exists
export async function getCurrentPetId(): Promise<number | null> {
  const petIds = await getUserPetIds()
  return petIds.length > 0 ? petIds[0] : null
}
