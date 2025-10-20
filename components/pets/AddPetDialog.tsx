'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { PetForm } from './PetForm'

interface AddPetDialogProps {
  isFirstPet?: boolean
  buttonText?: string
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
  buttonClassName?: string
}

export function AddPetDialog({
  isFirstPet = false,
  buttonText,
  buttonVariant = 'default',
  buttonSize = 'default',
  buttonClassName
}: AddPetDialogProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const router = useRouter()

  const displayText = buttonText || (isFirstPet ? 'Create Your First Pet' : 'Add Another Pet')
  const dialogTitle = isFirstPet ? 'Create Your First Pet' : 'Add Pet'
  const dialogDescription = isFirstPet
    ? 'Start tracking medical records for your pet'
    : 'Add another pet to your account'

  const handleSuccess = (petId: number) => {
    setOpen(false)
    if (isFirstPet) {
      // First pet: redirect to pet dashboard
      router.push(`/pets/${petId}`)
    } else {
      // Additional pet: refresh homepage to show updated grid
      router.refresh()
    }
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={buttonVariant} size={buttonSize} className={buttonClassName}>
            {displayText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <PetForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={buttonClassName}>
          {displayText}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{dialogTitle}</DrawerTitle>
          <DrawerDescription>
            {dialogDescription}
          </DrawerDescription>
        </DrawerHeader>
        <PetForm className="px-4" onSuccess={handleSuccess} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
