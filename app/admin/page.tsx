import Link from 'next/link'
import { getPetsWithCounts, getStats } from '@/app/actions/pets'
import { PetCard } from '@/components/pets/PetCard'
import { AddPetDialog } from '@/components/pets/AddPetDialog'
import { AdminStats } from '@/components/AdminStats'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const petsResult = await getPetsWithCounts()
  const statsResult = await getStats()

  const petsWithCounts = petsResult.data || []
  const stats = statsResult.data

  return (
    <div className="flex flex-col h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Homepage</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Admin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <AddPetDialog />
        </div>

        {stats && <AdminStats stats={stats} className="mb-4 sm:mb-6 flex-shrink-0" />}

        {petsWithCounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No pet accounts yet</p>
            <AddPetDialog />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 py-4 px-0 md:px-4">
                {petsWithCounts.map(({ pet, recordCounts }) => (
                  <PetCard key={pet.id} pet={pet} recordCounts={recordCounts} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
