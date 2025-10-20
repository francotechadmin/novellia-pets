import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAge } from '@/lib/utils/format'
import type { Pet } from '@/lib/db/schema'

interface PetCardProps {
  pet: Pet
  recordCounts?: {
    vaccines: number
    allergies: number
  }
  fromAdmin?: boolean
}

export function PetCard({ pet, recordCounts, fromAdmin = false }: PetCardProps) {
  const age = formatAge(pet.dateOfBirth)
  const href = fromAdmin ? `/pets/${pet.id}?from=admin` : `/pets/${pet.id}`

  return (
    <Link href={href}>
      <Card className="hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-1">{pet.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{age} old</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {pet.animalType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-foreground">{pet.ownerName}</span>
            </div>
            {recordCounts && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Badge variant="secondary">
                  💉 {recordCounts.vaccines}
                </Badge>
                <Badge variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/30">
                  ⚠️ {recordCounts.allergies}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
