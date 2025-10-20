import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPetById } from '@/app/actions/pets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RecordsList } from '@/components/records/RecordsList'
import { AddRecordButtons } from '@/components/records/AddRecordButtons'
import { formatDate, formatAge } from '@/lib/utils/format'

export const dynamic = 'force-dynamic'

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const petId = parseInt(resolvedParams.id)

  if (isNaN(petId)) {
    notFound()
  }

  const result = await getPetById(petId)

  if (result.error || !result.data) {
    notFound()
  }

  const pet = result.data
  const vaccines = pet.records.filter((r) => r.recordType === 'vaccine')
  const allergies = pet.records.filter((r) => r.recordType === 'allergy')

  return (
    <div className="flex flex-col h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col overflow-hidden">
        <Breadcrumb className="mb-6 flex-shrink-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">My Pet</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pet.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-8 flex-shrink-0">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{pet.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {pet.animalType}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{formatAge(pet.dateOfBirth)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Owner</dt>
              <dd className="mt-1 text-sm">{pet.ownerName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
              <dd className="mt-1 text-sm">{formatDate(pet.dateOfBirth)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold">Medical Records</h2>
        <AddRecordButtons petId={pet.id} petName={pet.name} />
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
          <TabsTrigger value="all">All Records ({pet.records.length})</TabsTrigger>
          <TabsTrigger value="vaccines">Vaccines ({vaccines.length})</TabsTrigger>
          <TabsTrigger value="allergies">Allergies ({allergies.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <RecordsList records={pet.records} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="vaccines" className="mt-6 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <RecordsList records={vaccines} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="allergies" className="mt-6 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <RecordsList records={allergies} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
