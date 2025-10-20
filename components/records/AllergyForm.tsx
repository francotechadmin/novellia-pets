'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addAllergyRecord } from '@/app/actions/records'
import { allergySchema, type AllergyFormData } from '@/lib/validations/record'
import { SEVERITY_LEVELS, COMMON_REACTIONS } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AllergyFormProps {
  petId: number
  onSuccess: () => void
  onCancel: () => void
}

export function AllergyForm({ petId, onSuccess, onCancel }: AllergyFormProps) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<AllergyFormData>({
    allergyName: '',
    reactions: [],
    severity: 'mild',
  })
  const [reactionInput, setReactionInput] = useState('')

  const addReaction = (reaction: string) => {
    if (reaction && !formData.reactions.includes(reaction)) {
      setFormData({
        ...formData,
        reactions: [...formData.reactions, reaction],
      })
    }
  }

  const removeReaction = (reaction: string) => {
    setFormData({
      ...formData,
      reactions: formData.reactions.filter((r) => r !== reaction),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    const validation = allergySchema.safeParse(formData)
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
      const result = await addAllergyRecord(petId, formData)

      if (result.error) {
        setErrors({ form: result.error })
      } else if (result.data) {
        toast.success("Allergy record added!", {
          description: `${formData.allergyName} allergy has been recorded.`
        })
        onSuccess()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="allergyName">Allergy Name *</Label>
        <Input
          id="allergyName"
          value={formData.allergyName}
          onChange={(e) => setFormData({ ...formData, allergyName: e.target.value })}
          placeholder="e.g., Peanuts, Chicken"
          disabled={isPending}
        />
        {errors.allergyName && <p className="text-sm text-red-500">{errors.allergyName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">Severity *</Label>
        <Select
          value={formData.severity}
          onValueChange={(value) => setFormData({ ...formData, severity: value as 'mild' | 'severe' })}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.severity && <p className="text-sm text-red-500">{errors.severity}</p>}
      </div>

      <div className="space-y-3">
        <Label>Common Reactions *</Label>
        <div className="grid grid-cols-2 gap-3">
          {COMMON_REACTIONS.map((reaction) => (
            <div key={reaction} className="flex items-center space-x-2">
              <Checkbox
                id={reaction}
                checked={formData.reactions.includes(reaction)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addReaction(reaction)
                  } else {
                    removeReaction(reaction)
                  }
                }}
                disabled={isPending}
              />
              <label
                htmlFor={reaction}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {reaction}
              </label>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Label htmlFor="custom-reaction">Custom Reaction</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="custom-reaction"
              value={reactionInput}
              onChange={(e) => setReactionInput(e.target.value)}
              placeholder="Type custom reaction"
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (reactionInput.trim()) {
                    addReaction(reactionInput.trim())
                    setReactionInput('')
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (reactionInput.trim()) {
                  addReaction(reactionInput.trim())
                  setReactionInput('')
                }
              }}
              disabled={isPending || !reactionInput.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {formData.reactions.filter(r => !(COMMON_REACTIONS as readonly string[]).includes(r)).length > 0 && (
          <div className="pt-2">
            <Label className="text-sm text-muted-foreground">Custom Reactions</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.reactions
                .filter(r => !(COMMON_REACTIONS as readonly string[]).includes(r))
                .map((reaction) => (
                  <div
                    key={reaction}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-secondary rounded-md"
                  >
                    {reaction}
                    <button
                      type="button"
                      onClick={() => removeReaction(reaction)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      disabled={isPending}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
        {errors.reactions && <p className="text-sm text-red-500">{errors.reactions}</p>}
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
          {isPending ? 'Adding...' : 'Add Allergy'}
        </Button>
      </div>
    </form>
  )
}
