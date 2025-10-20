import Link from 'next/link'
import { getCurrentPetId } from '@/app/actions/user'
import { getPetById } from '@/app/actions/pets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AddPetDialog } from '@/components/pets/AddPetDialog'
import { RecordsList } from '@/components/records/RecordsList'
import { AddRecordButtons } from '@/components/records/AddRecordButtons'
import { PetQRCode } from '@/components/pets/PetQRCode'
import { formatDate, formatAge } from '@/lib/utils/format'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const currentPetId = await getCurrentPetId()

  // No pet - show create prompt
  if (!currentPetId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Novellia Pets</h1>
            <p className="text-muted-foreground text-lg">
              Create your pet account to get started
            </p>
          </div>
          <div className="space-y-4">
            <AddPetDialog />
            <p className="text-sm text-muted-foreground">
              Or{' '}
              <Link href="/admin" className="text-primary hover:underline">
                go to Admin Dashboard
              </Link>{' '}
              to view all pets
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Load pet data
  const result = await getPetById(currentPetId)

  if (result.error || !result.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Pet Not Found</h1>
            <p className="text-muted-foreground">
              {result.error || 'The pet you are looking for does not exist.'}
            </p>
          </div>
          <div className="space-y-4">
            <AddPetDialog />
            <p className="text-sm text-muted-foreground">
              Or{' '}
              <Link href="/admin" className="text-primary hover:underline">
                go to Admin Dashboard
              </Link>{' '}
              to view all pets
            </p>
          </div>
        </div>
      </div>
    )
  }

  const pet = result.data
  const vaccines = pet.records.filter((r) => r.recordType === 'vaccine')
  const allergies = pet.records.filter((r) => r.recordType === 'allergy')

  return (
    <div className="flex flex-col h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{pet.name}'s Dashboard</h1>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin Dashboard →
          </Link>
        </div>
        {/* Pet Profile and QR Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
          <Card className="md:col-span-2">
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
          <div className="hidden md:block">
            <PetQRCode petId={pet.id} petName={pet.name} />
          </div>
        </div>

        {/* Medical Records Section */}
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
