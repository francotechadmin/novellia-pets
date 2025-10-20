'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, QrCode } from 'lucide-react'

interface PetQRCodeProps {
  petId: number
  petName: string
}

export function PetQRCode({ petId, petName }: PetQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrUrl, setQrUrl] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return

      // Generate URL to pet's profile
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const petUrl = `${baseUrl}/pets/${petId}`
      setQrUrl(petUrl)

      try {
        await QRCode.toCanvas(canvasRef.current, petUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    }

    generateQR()
  }, [petId])

  const downloadQR = () => {
    if (!canvasRef.current) return

    // Convert canvas to blob and download
    canvasRef.current.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${petName}-medical-records-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5" />
          QR Code
        </CardTitle>
        <CardDescription>
          Scan to access {petName}'s medical records
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <canvas
          ref={canvasRef}
          className="border rounded-md"
        />
        <div className="text-xs text-muted-foreground text-center">
          <p className="font-mono text-[10px] break-all">{qrUrl}</p>
        </div>
        <Button
          onClick={downloadQR}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Print and attach to {petName}'s collar for emergency access
        </p>
      </CardContent>
    </Card>
  )
}
