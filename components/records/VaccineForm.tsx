'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addVaccineRecord } from '@/app/actions/records'
import { vaccineSchema, type VaccineFormData } from '@/lib/validations/record'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface VaccineFormProps {
  petId: number
  onSuccess: () => void
  onCancel: () => void
}

export function VaccineForm({ petId, onSuccess, onCancel }: VaccineFormProps) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<VaccineFormData>({
    vaccineName: '',
    administeredDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    const validation = vaccineSchema.safeParse(formData)
    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(newErrors)
      return
    }

    startTransition(async () => {
      const result = await addVaccineRecord(petId, formData)

      if (result.error) {
        setErrors({ form: result.error })
      } else if (result.data) {
        toast.success("Vaccine record added!", {
          description: `${formData.vaccineName} has been recorded.`
        })
        onSuccess()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vaccineName">Vaccine Name *</Label>
        <Input
          id="vaccineName"
          value={formData.vaccineName}
          onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
          placeholder="e.g., Rabies, DHPP"
          disabled={isPending}
        />
        {errors.vaccineName && <p className="text-sm text-red-500">{errors.vaccineName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="administeredDate">Administered Date *</Label>
        <Input
          id="administeredDate"
          type="date"
          value={formData.administeredDate}
          onChange={(e) => setFormData({ ...formData, administeredDate: e.target.value })}
          disabled={isPending}
        />
        {errors.administeredDate && <p className="text-sm text-red-500">{errors.administeredDate}</p>}
      </div>

      {errors.form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add Vaccine'}
        </Button>
      </div>
    </form>
  )
}
