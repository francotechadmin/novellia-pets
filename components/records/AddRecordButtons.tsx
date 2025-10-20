'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { VaccineForm } from './VaccineForm'
import { AllergyForm } from './AllergyForm'

interface AddRecordButtonsProps {
  petId: number
  petName: string
}

export function AddRecordButtons({ petId, petName }: AddRecordButtonsProps) {
  const router = useRouter()
  const [isVaccineOpen, setIsVaccineOpen] = useState(false)
  const [isAllergyOpen, setIsAllergyOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const handleSuccess = () => {
    setIsVaccineOpen(false)
    setIsAllergyOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setIsVaccineOpen(true)}>Add Vaccine</Button>
        <Button variant="outline" onClick={() => setIsAllergyOpen(true)}>
          Add Allergy
        </Button>
      </div>

      {/* Vaccine Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={isVaccineOpen} onOpenChange={setIsVaccineOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Vaccine Record</DialogTitle>
              <DialogDescription>
                Add a new vaccination record for {petName}
              </DialogDescription>
            </DialogHeader>
            <VaccineForm
              petId={petId}
              onSuccess={handleSuccess}
              onCancel={() => setIsVaccineOpen(false)}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isVaccineOpen} onOpenChange={setIsVaccineOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Add Vaccine Record</DrawerTitle>
              <DrawerDescription>
                Add a new vaccination record for {petName}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <VaccineForm
                petId={petId}
                onSuccess={handleSuccess}
                onCancel={() => setIsVaccineOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Allergy Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={isAllergyOpen} onOpenChange={setIsAllergyOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Allergy Record</DialogTitle>
              <DialogDescription>
                Add a new allergy record for {petName}
              </DialogDescription>
            </DialogHeader>
            <AllergyForm
              petId={petId}
              onSuccess={handleSuccess}
              onCancel={() => setIsAllergyOpen(false)}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isAllergyOpen} onOpenChange={setIsAllergyOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Add Allergy Record</DrawerTitle>
              <DrawerDescription>
                Add a new allergy record for {petName}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
              <AllergyForm
                petId={petId}
                onSuccess={handleSuccess}
                onCancel={() => setIsAllergyOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
