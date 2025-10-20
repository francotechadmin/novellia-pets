import { NextRequest, NextResponse } from 'next/server'
import { getPetsWithCounts, createPet } from '@/app/actions/pets'

/**
 * GET /api/pets
 * Returns all pets with their record counts
 * Reuses the existing getPetsWithCounts server action
 */
export async function GET() {
  try {
    const result = await getPetsWithCounts()

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('GET /api/pets error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pets',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pets
 * Creates a new pet
 * Reuses the existing createPet server action
 *
 * Request body:
 * {
 *   "name": "Buddy",
 *   "animalType": "dog",
 *   "ownerName": "John Smith",
 *   "dateOfBirth": "2020-03-15"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Leverage existing server action (includes Zod validation)
    const result = await createPet(body)

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/pets error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create pet',
      },
      { status: 500 }
    )
  }
}
