'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createPet } from '@/app/actions/pets'
import { addPetToUser } from '@/app/actions/user'
import { petSchema, type PetFormData } from '@/lib/validations/pet'
import { ANIMAL_TYPES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PetFormProps {
  className?: string
  onSuccess?: (petId: number) => void
}

export function PetForm({ className, onSuccess }: PetFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    animalType: 'dog',
    ownerName: '',
    dateOfBirth: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    const validation = petSchema.safeParse(formData)
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
      const result = await createPet(formData)

      if (result.error) {
        setErrors({ form: result.error })
      } else if (result.data) {
        // Add the pet to user's pet collection
        await addPetToUser(result.data.id)

        toast.success("Pet account created successfully!", {
          description: `${result.data.name}'s profile is ready.`
        })
        if (onSuccess) {
          onSuccess(result.data.id)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <Label htmlFor="name">Pet Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter pet name"
          disabled={isPending}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="animalType">Animal Type *</Label>
        <Select
          value={formData.animalType}
          onValueChange={(value) => setFormData({ ...formData, animalType: value as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other' })}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select animal type" />
          </SelectTrigger>
          <SelectContent>
            {ANIMAL_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.animalType && <p className="text-sm text-red-500">{errors.animalType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerName">Owner Name *</Label>
        <Input
          id="ownerName"
          value={formData.ownerName}
          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
          placeholder="Enter owner name"
          disabled={isPending}
        />
        {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          disabled={isPending}
        />
        {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
      </div>

      {errors.form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Creating...' : 'Create Pet'}
      </Button>
    </form>
  )
}
