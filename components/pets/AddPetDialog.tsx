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

export function AddPetDialog() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const router = useRouter()

  const handleSuccess = (petId: number) => {
    setOpen(false)
    router.push(`/pets/${petId}`)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Pet Account</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create Pet Account</DialogTitle>
            <DialogDescription>
              Each pet gets their own account to track medical records
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
        <Button>Create Pet Account</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Pet Account</DrawerTitle>
          <DrawerDescription>
            Each pet gets their own account to track medical records
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
