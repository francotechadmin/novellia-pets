import Link from 'next/link'
import { getUserPetIds } from '@/app/actions/user'
import { getPetsByIds } from '@/app/actions/pets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AddPetDialog } from '@/components/pets/AddPetDialog'
import { PetCard } from '@/components/pets/PetCard'
import { QrCode, Syringe, AlertCircle, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const userPetIds = await getUserPetIds()
  const hasPets = userPetIds.length > 0

  let userPets: Array<{ pet: any; recordCounts: { vaccines: number; allergies: number } }> = []
  if (hasPets) {
    const result = await getPetsByIds(userPetIds)
    userPets = result.data || []
  }

  if (!hasPets) {
    // Landing page for users with no pets
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-2">
        <Card className="max-w-7xl w-full">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-4xl font-bold tracking-tight">
              Novellia Pets
            </CardTitle>
            <CardDescription className="text-lg">
              Medical records management for your pets
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Features Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Syringe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Track Vaccinations</h4>
                    <p className="text-sm text-muted-foreground">
                      Record vaccine history with dates
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Manage Allergies</h4>
                    <p className="text-sm text-muted-foreground">
                      Document allergies with severity levels
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <QrCode className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">QR Code Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Emergency access via collar tag
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Admin Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      View all pets with statistics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Tech Stack</h3>
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">Next.js 15</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">App Router with Turbopack for fast development and production builds</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">React 19</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Server Components for better performance and reduced client-side JavaScript</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">TypeScript</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Type safety throughout the stack with strict mode enabled</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">SQLite</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Zero-config file-based database with JSON support for flexible schema design</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">Server Components</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">All pages are server-rendered for optimal performance and SEO</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">Server Actions</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Type-safe server mutations without REST boilerplate or API routes</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">Tailwind CSS</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Utility-first CSS framework for rapid UI development</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">shadcn/ui</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">High-quality, accessible components built with Radix UI primitives</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              <p className="text-sm text-muted-foreground mt-3">
                Polymorphic medical records table with JSON data column for extensibility.
                REST API demo endpoint at <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/pets</code>.
              </p>
            </div>

            {/* Demo Info Section */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">Demo Information</h3>
              <p className="text-sm text-muted-foreground">
                Pre-seeded with <strong>15 sample pets</strong>, 88 vaccines, and 25 allergies.
                Create your own pet or explore the admin dashboard.
              </p>
            </div>

            {/* Actions Section */}
            <div className="space-y-4">
              <AddPetDialog isFirstPet={true} buttonSize="lg" buttonClassName="w-full" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Or{' '}
                  <Link href="/admin" className="text-primary hover:underline font-medium">
                    view all pets in Admin Dashboard
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pet dashboard for users with pets
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Pets</h1>
            <p className="text-muted-foreground mt-1">
              {userPets.length} {userPets.length === 1 ? 'pet' : 'pets'} in your account
            </p>
          </div>
          <div className="flex gap-3">
            <AddPetDialog isFirstPet={false} />
            <Button asChild variant="outline">
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userPets.map(({ pet, recordCounts }) => (
            <PetCard key={pet.id} pet={pet} recordCounts={recordCounts} />
          ))}
        </div>
      </div>
    </div>
  )
}
