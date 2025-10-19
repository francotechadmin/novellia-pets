import { z } from 'zod'

// Animal type enum
export const animalTypeSchema = z.enum(['dog', 'cat', 'bird', 'rabbit', 'other'], {
  message: 'Please select a valid animal type'
})

// Pet validation schema
export const petSchema = z.object({
  name: z.string()
    .min(1, 'Pet name is required')
    .max(50, 'Pet name must be 50 characters or less'),
  animalType: animalTypeSchema,
  ownerName: z.string()
    .min(1, 'Owner name is required')
    .max(100, 'Owner name must be 100 characters or less'),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine(
      (date) => {
        const birthDate = new Date(date)
        const today = new Date()
        return birthDate <= today
      },
      { message: 'Date of birth cannot be in the future' }
    )
})

export type PetFormData = z.infer<typeof petSchema>
