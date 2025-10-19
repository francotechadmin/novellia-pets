import { z } from 'zod'

// Severity enum
export const severitySchema = z.enum(['mild', 'severe'], {
  message: 'Severity must be either mild or severe'
})

// Vaccine validation schema
export const vaccineSchema = z.object({
  vaccineName: z.string()
    .min(1, 'Vaccine name is required')
    .max(100, 'Vaccine name must be 100 characters or less'),
  administeredDate: z.string()
    .min(1, 'Administered date is required')
    .refine(
      (date) => {
        const adminDate = new Date(date)
        const today = new Date()
        return adminDate <= today
      },
      { message: 'Administered date cannot be in the future' }
    )
})

// Allergy validation schema
export const allergySchema = z.object({
  allergyName: z.string()
    .min(1, 'Allergy name is required')
    .max(100, 'Allergy name must be 100 characters or less'),
  reactions: z.array(z.string())
    .min(1, 'At least one reaction is required')
    .max(10, 'Maximum 10 reactions allowed'),
  severity: severitySchema
})

export type VaccineFormData = z.infer<typeof vaccineSchema>
export type AllergyFormData = z.infer<typeof allergySchema>
