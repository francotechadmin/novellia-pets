# Novellia Pets

A pet medical records management application built with Next.js 15, TypeScript, SQLite, and server components with cookie-based state management.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Optional seed database with sample data (15 pets)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Docker Deployment

```bash
# Build and start with auto-seeding
docker-compose up

# Disable auto-seeding
SEED_DB=false docker-compose up
```

## Screenshots

### Pet Profile Dashboard
![Pet Profile Dashboard](public/profile.jpg)

### Admin Dashboard
![Admin Dashboard](public/dashboard.jpg)

## Data Model

### Database Schema

**pets table:**
```sql
CREATE TABLE pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,  -- ISO 8601 (YYYY-MM-DD)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**medical_records table:**
```sql
CREATE TABLE medical_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id INTEGER NOT NULL,
  record_type TEXT NOT NULL,  -- 'vaccine' | 'allergy' | 'lab_result' | 'vital'
  data TEXT NOT NULL,         -- JSON: type-specific fields
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE INDEX idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
```

### Design Rationale

- Polymorphic records
  - Single `medical_records` table with `record_type` (discriminator) and `data` (JSON) for type-specific fields.
  - Pros: add types without migrations; simple mixed-timeline queries; fewer joins.

- Integrity & indexes
  - `FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE` for referential integrity.
  - Indexes: `idx_medical_records_pet_id` (pet lookups), `idx_medical_records_type` (type filters). Add partial/type-specific indexes if needed.

- Migrations & type safety
  - Schema managed via explicit SQL migrations (.sql).
  - Mirror DB shapes with TypeScript types (lib/db/schema.ts) and Zod schemas for runtime validation.

- Storage: SQLite
  - Chosen for zero-config dev/CI, file-based persistence, and JSON query support. Plan migration to Postgres for production.

## API Design

### Server Actions (Next.js 15 App Router)

All API logic uses Next.js Server Actions instead of REST endpoints for type-safe, server-side operations.

**Pet Operations (`app/actions/pets.ts`):**
- `createPet(data)` - Create new pet account
- `getPetById(id)` - Get single pet with all medical records
- `getPetsWithCounts()` - Get all pets with record counts (admin dashboard)
- `getStats()` - Get system statistics (total pets, records)

**Medical Record Operations (`app/actions/records.ts`):**
- `addVaccineRecord(petId, data)` - Add vaccine record
- `addAllergyRecord(petId, data)` - Add allergy record
- `getPetRecords(petId, type?)` - Get records for pet, optionally filtered by type

**User Session (`app/actions/user.ts`):**
- `getCurrentPetId()` - Get current user's pet ID from HTTP-only cookie
- `setCurrentPetId(id)` - Set current user's pet ID in cookie

### Why Server Actions

- Type-safe end-to-end: TypeScript validation from client to database
- No need to define REST routes, request/response shapes
- Automatic error handling and serialization
- Progressive enhancement support
- Integrated with React Server Components

### REST API for External Clients

For demonstration, a REST API endpoint is included at `/api/pets` that **leverages the existing server actions**:
- `GET /api/pets` - List all pets with record counts (calls `getPetsWithCounts()`)
- `POST /api/pets` - Create new pet (calls `createPet()`)

This pattern avoids code duplication—API routes are thin wrappers around server actions. 
Extend to other resources for mobile apps, third-party integrations, or webhooks.

```bash
# Example usage

# List all pets
curl http://localhost:3000/api/pets

# Create a new pet
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -d '{"name":"Buddy","animalType":"dog","ownerName":"John","dateOfBirth":"2020-01-01"}'
```

### Request/Response Shapes

All actions return standardized response:
```typescript
{ success: true, data: T } | { success: false, error: string }
```

Validation handled by Zod schemas in `lib/validations/`.

## Pages and UX

### Page Structure

All pages are **React Server Components** for better performance and SEO.

1. **Homepage (`/`)** - Landing Page
   - **Purpose:** Navigation hub and demo information center
   - App title and tagline
   - Feature highlights (vaccinations, allergies, QR codes, admin dashboard)
   - Tech stack showcase with badges
   - Demo information (15 pre-seeded pets)
   - **No pet:** "Create Pet Account" button + "Admin Dashboard" link
   - **Has pet:** "View Your Pet" button + "Admin Dashboard" button
   - Creating a pet redirects to `/pets/[id]`

2. **Pet Dashboard (`/pets/[id]`)** - Individual Pet View
   - **Purpose:** View and manage specific pet's medical records
   - Pet profile card (name, type, owner, age, DOB)
   - QR code card (desktop only, hidden on mobile)
   - Medical records tabs (All/Vaccines/Allergies)
   - Add Vaccine/Allergy buttons (responsive drawer on mobile)
   - ScrollArea with flexbox layout for dynamic height
   - Used for both user's pet and admin viewing other pets

3. **Admin Dashboard (`/admin`)** - All Pets View
   - **Purpose:** System overview with all pet accounts
   - Breadcrumb: "My Pet / Admin Dashboard"
   - Compact statistics card (pets, vaccines, allergies with emojis)
   - Responsive grid of pet cards (1 col mobile, 2 tablet, 3 desktop)
   - ScrollArea fills remaining viewport
   - Each pet card links to `/pets/[id]`
   - "Back to My Pet" button returns to `/`

### Account Model

**1 Pet = 1 Account:**
- User is "signed in" on app load (tracked with HTTP-only cookies)
- Creating a pet = creating a new account
- `currentPetId` stored in server-side cookie identifies active account
- Cookie persists across sessions and devices
- More secure than localStorage approach
- No authentication required for MVP

## Features

### QR Code for Emergency Access

Each pet profile includes a downloadable QR code that links directly to their medical records.

**Use case:** Print and attach to pet collar for emergency access by vets, shelters, or finders.

**Implementation:**
- Generates QR code pointing to `/pets/[id]`
- Display on pet profile pages (homepage & detail view)
- Download button exports PNG file: `{PetName}-medical-records-qr.png`
- Uses `qrcode` library for client-side generation

**Why this feature:**
- **Safety:** Emergency responders can instantly access allergy/vaccination info
- **Practical:** Addresses real-world need (lost pets, vet visits, boarding)
ß

### UX Choices

**Server-First Architecture:**
- All pages are React Server Components
- Server Actions for mutations (type-safe, no REST endpoints)
- Cookie-based state management (more secure than localStorage)

**Shadcn UI:**
- Component library leverages Tailwind CSS
- Easy theming with CSS variables
- Consistent design across pages

**Responsive Design:**
- Media query hook (`use-media-query.ts`) determines layout
- Forms open as Dialogs on desktop (≥768px), Drawers on mobile

**Medical Records:**
- Tabs for All Records, Vaccines, Allergies
- Card-based list with badges for severity/type

**Feedback & Validation:**
- Toast notifications (Sonner) for all mutations
- Zod validation with inline error messages
- Loading states with React transitions

## Tech Stack

- **Next.js 15.5.6** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript** - Type safety (strict mode)
- **Tailwind CSS 4** - Styling
- **SQLite** (better-sqlite3) - Database
- **Zod** - Schema validation
- **shadcn/ui** - Component library (17 components)
- **Sonner** - Toast notifications
- **QRCode** - QR code generation for pet profiles
- **Cookies** - Server-side state management

## Project Structure

```
app/
├── page.tsx                    # Landing page (navigation hub + demo info) - SERVER COMPONENT
├── pets/
│   └── [id]/
│       ├── page.tsx            # Pet dashboard (individual pet view) - SERVER COMPONENT
│       └── not-found.tsx       # Pet not found page
├── admin/
│   └── page.tsx                # Admin dashboard (all pets) - SERVER COMPONENT
├── api/
│   └── pets/
│       └── route.ts            # REST API endpoint (demo)
├── layout.tsx                  # Root layout with theme provider
├── not-found.tsx               # Global 404 page
├── actions/
│   ├── user.ts                 # Cookie management (currentPetId)
│   ├── pets.ts                 # Pet CRUD operations
│   └── records.ts              # Medical record operations

components/
├── ui/                         # shadcn/ui components (17 total)
│   ├── breadcrumb.tsx
│   ├── dialog.tsx
│   ├── drawer.tsx
│   ├── scroll-area.tsx
│   └── ... (13 more)
├── pets/
│   ├── PetCard.tsx             # Pet card for admin grid
│   ├── PetQRCode.tsx           # QR code component for emergency access
│   ├── AddPetDialog.tsx        # Responsive pet creation dialog/drawer
│   └── PetForm.tsx             # Pet form with validation
├── records/
│   ├── RecordsList.tsx         # Medical records list
│   ├── AddRecordButtons.tsx    # Add vaccine/allergy buttons
│   ├── VaccineForm.tsx         # Vaccine form
│   └── AllergyForm.tsx         # Allergy form
├── AdminStats.tsx              # Compact statistics display
└── theme-provider.tsx          # Dark mode provider

lib/
├── db/
│   ├── schema.ts               # TypeScript types
│   ├── client.ts               # SQLite connection
│   └── migrations/
│       └── 001_initial.sql     # Schema + seed data
├── validations/
│   ├── pet.ts                  # Pet Zod schemas
│   └── record.ts               # Record Zod schemas
└── utils/
    ├── format.ts               # Date/age formatting
    └── constants.ts            # Animal types, severities

hooks/
└── use-media-query.ts          # Responsive layout hook

scripts/
└── seed-db.ts                  # Database seeding script
```

## Production Improvements

### Authentication & Authorization
- Implement proper user authentication (NextAuth.js, or Supabase Auth)
- Role-based access control (admin vs regular users)

### Database & Persistence
- Migrate from SQLite to PostgreSQL for production
- Database migrations management (Prisma, Drizzle)

### Monitoring & Observability
- Application performance monitoring (DataDog, CloudWatch, etc.)
- User analytics (Google Analytics)

### Testing
- Unit tests for server actions and utilities
- End-to-end tests for critical user flows
- API integration tests

### DevOps & Deployment
- CI/CD pipeline (GitHub Actions, Vercel)
- Staging and production environments
- Environment variable management

### Possible Features
- File upload for medical documents/images
- Export medical records to PDF
- Search and filtering in admin dashboard
- Audit logs for all changes
- Soft deletes with restore capability
- Multi-language support

## License

MIT
