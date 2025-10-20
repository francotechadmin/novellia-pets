'use server'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'currentPetId'

export async function getCurrentPetId(): Promise<number | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE_NAME)?.value
  return value ? parseInt(value, 10) : null
}

export async function setCurrentPetId(petId: number | null) {
  const cookieStore = await cookies()

  if (petId === null) {
    cookieStore.delete(COOKIE_NAME)
  } else {
    cookieStore.set(COOKIE_NAME, petId.toString(), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    })
  }
}
