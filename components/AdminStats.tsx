import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Stats } from '@/lib/db/schema'

interface AdminStatsProps {
  stats: Stats
  className?: string
}

export function AdminStats({ stats, className }: AdminStatsProps) {
  return (
    <Card className={cn("", className)}>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          <div className="text-center">
            <div className="text-xl sm:text-2xl mb-1">🐾</div>
            <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalPets}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Pets</p>
          </div>

          <div className="text-center">
            <div className="text-xl sm:text-2xl mb-1">💉</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{stats.totalVaccines}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Vaccines</p>
          </div>

          <div className="text-center">
            <div className="text-xl sm:text-2xl mb-1">⚠️</div>
            <div className="text-2xl sm:text-3xl font-bold text-destructive">{stats.totalAllergies}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Allergies</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
