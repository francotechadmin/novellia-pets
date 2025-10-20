# Novellia Pets - MVP Specification

## Executive Summary

Novellia Pets is a medical record management system for pets, allowing pet owners to track vaccinations and allergies. This MVP uses a **multi-pet support** model where users can create and manage multiple pets under a single cookie-based session. Users can view their pets on a personal dashboard, add medical records to each pet, and view individual pet profiles. Admins can view all pet accounts system-wide.

---

## 1. Product Overview

### 1.1 Core Features
1. **Pet Account Creation** - Create multiple pets under one user account
2. **Medical Record Management** - Add and view vaccination and allergy records
3. **Pet Dashboard** - View individual pet's profile and medical records at `/pets/[id]`
4. **User Dashboard** - View all your pets at homepage (`/`)
5. **Admin Dashboard** - View all pet accounts system-wide with statistics at `/admin`
6. **QR Code for Emergency Access** - Downloadable QR code linking to pet's medical records for emergency responders

### 1.1.1 Account Model: Multi-Pet Support

**Simplified User Model (Cookie-Based):**
- No traditional authentication/login system for MVP
- User tracked via HTTP-only cookie storing array of pet IDs
- User can create and manage multiple pets
- Cookie persists across sessions

**Approach:**
- `userPetIds` cookie stores JSON array: `[1, 3, 5]`
- Homepage (`/`) displays grid of user's pets (personal dashboard)
- Creating a pet adds ID to cookie array and shows updated pet list
- Admin dashboard (`/admin`) shows ALL pets system-wide (not just user's pets)

**Rationale:**
- Meets requirement: "Dashboard to view existing pets" (plural)
- Simpler than full auth system for MVP
- Clearly separates "my pets" (homepage) vs "all pets" (admin)

### 1.2 Out of Scope (MVP)
- Authentication/login system
- Multi-user sessions
- Record editing/deletion
- File attachments (images, PDFs)
- Email notifications
- Mobile app

---

## 2. Data Model

### 2.1 Database Choice: SQLite
**Why SQLite?**
- Zero configuration, file-based persistence
- Sufficient for MVP scale (hundreds to low thousands of records)
- Easy deployment (no separate DB server)
- ACID compliant for data integrity
- Simple migration path to PostgreSQL if needed

### 2.2 Schema Design

#### Pets Table
```sql
CREATE TABLE pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,  -- ISO 8601 format (YYYY-MM-DD)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Medical Records Table (Unified)
```sql
CREATE TABLE medical_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id INTEGER NOT NULL,
  record_type TEXT NOT NULL,  -- 'vaccine' | 'allergy' | future types
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  -- Common fields (JSON or separate columns)
  data TEXT NOT NULL,  -- JSON blob for flexibility

  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE INDEX idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
```

**Data JSON Structure:**
```typescript
// Vaccine record
{
  "vaccine_name": "Rabies",
  "administered_date": "2024-03-15"
}

// Allergy record
{
  "allergy_name": "Peanuts",
  "reactions": ["hives", "swelling"],
  "severity": "severe"  // 'mild' | 'severe'
}

// Future: Lab result (extensible)
{
  "test_name": "Blood Panel",
  "test_date": "2024-03-20",
  "results": {...}
}
```


---

## 3. Server Actions

Server Actions in `app/actions/`:
- `user.ts` - getUserPetIds, addPetToUser (manage `userPetIds` cookie array)
- `pets.ts` - createPet, getPetById, getPetsWithCounts, getStats
- `records.ts` - addVaccineRecord, addAllergyRecord, getPetRecords

---

## 4. UI/UX Design

### 4.0 Quick Reference - User Flow

```
┌─────────────────────────────────────────────────────────┐
│  User loads app → Homepage (/)                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─ No Pets (userPetIds = []) ─┐                        │
│  │                                │                       │
│  │  📝 Welcome + Create Pet       │                       │
│  │  🔧 Admin Dashboard link       │                       │
│  │                                │                       │
│  └─ Has Pets (userPetIds = [1,3,5]) ─┐                  │
│     │                                  │                  │
│     │  🐾 Grid of Your Pets (3 cards) │                  │
│     │  ➕ "Add Another Pet" button     │                  │
│     │  🔧 "Admin Dashboard" link       │                  │
│     │                                  │                  │
│     │  Click pet card → /pets/[id]    │                  │
│     └──────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Pet Dashboard (/pets/[id])                              │
├─────────────────────────────────────────────────────────┤
│  🐾 Pet Profile + QR Code                                │
│  📋 Medical Records (Tabs)                               │
│  ➕ Add Vaccine/Allergy                                  │
│  ← "Back to My Pets" → Returns to /                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Admin Dashboard (/admin)                                │
├─────────────────────────────────────────────────────────┤
│  📊 Statistics (ALL pets system-wide)                    │
│  🐾 Grid of ALL pet cards (not just user's)             │
│  ← "Back to My Pets" → Returns to /                      │
└─────────────────────────────────────────────────────────┘
```

### 4.1 Page Structure

#### 4.1.1 Homepage (`/`) - User's Pet Dashboard
**Purpose**: Personal dashboard showing all pets owned by the user

**No Pets State** (userPetIds = []):
- Welcome message with app info and feature highlights
- "Create Your First Pet" button (opens dialog)
- "Go to Admin Dashboard" link
- Tech stack badges with tooltips
- Demo information (15 sample pets available)

**With Pets State** (userPetIds = [1, 3, 5]):
- Page header: "My Pets" with count
- Responsive grid of user's pet cards (similar to admin but filtered)
- Each card shows: pet name, type, age, owner, vaccine/allergy counts
- Click card → Navigate to `/pets/[id]`
- "Add Another Pet" button
- "Go to Admin Dashboard" link

**Components** (shadcn/ui):
- `Card` - Pet cards for grid
- `Button` - Add pet, navigation actions
- `Badge` - Pet type, tech stack, record counts
- `Dialog` - Pet creation modal
- `Tooltip` - Tech stack rationale

**On Pet Creation**:
- Add pet ID to `userPetIds` cookie array
- Refresh homepage to show updated pet grid (stays on `/`)

#### 4.1.2 Add Pet Dialog
**Purpose**: Create a new pet and add it to user's pet collection

**Layout**:
- Triggered by "Create Your First Pet" button (no pets) or "Add Another Pet" button (existing pets)
- Dialog component (centered modal)
- Form with validation
- On success, closes modal, adds pet ID to `userPetIds` cookie array

**Components**:
- `Dialog` - Modal wrapper
- `Form` - Form wrapper with validation
- `Input` - Text fields (name, owner, date of birth)
- `Select` - Animal type dropdown
- `Button` - Submit with loading state

**Behavior**:
- **First pet (userPetIds = [])**: Redirects to `/pets/[id]` after creation
- **Additional pet (userPetIds = [1, 3])**: Stays on homepage, refreshes to show updated pet grid with new pet card
- Uses native `<input type="date">` for date of birth

#### 4.1.3 Pet Dashboard (`/pets/[id]`)
**Purpose**: View and manage a specific pet's profile and medical records

**Layout**:
- Pet profile card (name, type, owner, age, DOB)
- QR code card (desktop only, hidden on mobile)
- Quick actions: "Add Vaccine", "Add Allergy"
- Tabs: "All Records", "Vaccines", "Allergies"
- Timeline/list view of medical records
- ScrollArea for records list

**Components**:
- `Card` - Pet profile and QR code
- `Button` - Add record actions
- `Tabs` - Record type filtering
- `Badge` - Severity indicators, record types
- `Dialog`/`Drawer` - Add vaccine/allergy forms (responsive)
- `ScrollArea` - Medical records list

**Note**: This page is used for both the user's own pet and for viewing pets from the admin dashboard.

#### 4.1.4 Admin Dashboard (`/admin`)
**Purpose**: View all pet accounts with system statistics

**Layout**:
- Header with "Admin Dashboard" title
- Summary statistics cards (total pets, vaccines, allergies)
- Pet cards grid showing ALL pet accounts
- "Add New Pet Account" button (for demo purposes)
- Each pet card links to that pet's full view

**Components**:
- `Card` - Stat cards and pet cards
- `Button` - Actions and navigation ("Back to My Pets")
- `Badge` - Pet type, record counts, severity indicators
- `Skeleton` - Loading states

**Note**: Admin dashboard shows all pets in the system. Users can return to their pets dashboard via "Back to My Pets" button or navigating to `/`.

#### 4.1.5 Page Flow Summary

**User Journey**:
1. User loads app → Homepage (`/`) - Landing page with app info
2. **If no pets (userPetIds = [])**: Click "Create Your First Pet" → Opens dialog → Create pet → Redirects to `/pets/[id]`
3. **If pets exist (userPetIds = [1, 3, 5])**: Homepage shows grid of user's 3 pet cards
4. Click pet card from grid → Navigate to `/pets/[id]` for that specific pet
5. Click "Add Another Pet" → Opens dialog → Create pet → Refreshes homepage with new pet card added to grid
6. On pet dashboard: View medical records, add vaccines/allergies, download QR code
7. Click "Go to Admin Dashboard" → `/admin` to view all pets system-wide
8. On admin dashboard: View stats, browse all pet cards, click pet card → `/pets/[id]`
9. Click "Back to My Pets" → Returns to `/` (user's personal pet dashboard)

### 4.2 Navigation

- `/` - User's pet dashboard (personal pet grid when pets exist, landing page when no pets)
- `/pets/[id]` - Individual pet dashboard with medical records
- `/admin` - All pets system-wide + statistics
- `userPetIds` array stored in HTTP-only cookie (e.g., `[1, 3, 5]`)

---

## 5. Technical Architecture

### 5.1 Tech Stack Summary
- **Framework**: Next.js 15.5.6 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: SQLite with better-sqlite3
- **Validation**: Zod schemas
- **Forms**: React Hook Form + Zod resolver
- **State**: React Server Components + Server Actions (no global state needed)
- **QR Code**: qrcode library for emergency access

### 5.2 API Design

**Primary: Server Actions**
All API logic uses Next.js Server Actions for type-safe, server-side operations:
- `app/actions/pets.ts` - Pet CRUD operations
- `app/actions/records.ts` - Medical record operations
- `app/actions/user.ts` - Cookie-based session management (manages `userPetIds` array)

**Demo: REST API Endpoint**
For demonstration purposes, `/api/pets` route shows how to expose REST endpoints for external clients:

```bash
# GET all pets with record counts
GET /api/pets

# POST create new pet
POST /api/pets
Content-Type: application/json
{
  "name": "Buddy",
  "animalType": "dog",
  "ownerName": "John Smith",
  "dateOfBirth": "2020-01-01"
}
```

**Why Both Approaches:**
- Server Actions: Primary interface for Next.js app (type-safe, no REST boilerplate)
- REST API: Demonstrates extensibility for mobile apps, webhooks, third-party integrations
- API routes leverage existing server actions (no code duplication)

**Response Format:**
```typescript
{ success: true, data: T } | { success: false, error: string }
```

### 5.3 File Structure
```
app/
├── page.tsx                     # User's pet dashboard (landing page when no pets)
├── pets/
│   └── [id]/
│       ├── page.tsx             # Pet dashboard (individual pet view)
│       └── not-found.tsx        # Pet not found page
├── admin/
│   └── page.tsx                 # Admin dashboard (all pets)
├── api/
│   └── pets/
│       └── route.ts             # REST API demo endpoint
├── layout.tsx                   # Root layout
├── not-found.tsx                # Global 404 page
├── actions/
│   ├── user.ts                  # Cookie-based multi-pet management (userPetIds array)
│   ├── pets.ts                  # Pet server actions
│   └── records.ts               # Record server actions
components/
├── ui/                          # shadcn components
├── pets/
│   ├── PetCard.tsx             # Pet card for admin grid
│   ├── PetProfile.tsx          # Pet profile display
│   ├── PetQRCode.tsx           # QR code for emergency access
│   ├── AddPetDialog.tsx        # Create pet modal
│   └── PetDashboard.tsx        # Pet dashboard with tabs/records
├── records/
│   ├── RecordList.tsx          # Timeline/list of records
│   ├── AddVaccineDialog.tsx    # Add vaccine modal
│   └── AddAllergyDialog.tsx    # Add allergy modal
└── AdminStats.tsx              # Statistics cards
lib/
├── db/
│   ├── schema.ts               # Type definitions
│   ├── client.ts               # SQLite connection
│   └── migrations/
│       └── 001_initial.sql     # Schema creation
├── validations/
│   ├── pet.ts                  # Zod schemas for pets
│   └── record.ts               # Zod schemas for records
└── utils/
    ├── format.ts               # Date formatting
    └── constants.ts            # Enums, constants
```

---

## 6. User Stories

1. **Create First Pet** - Load homepage (no pets) → click "Create Your First Pet" → fill form → save to cookie array → redirect to `/pets/[id]`
2. **View My Pets** - Load homepage (with existing pets) → see grid of your pet cards → click any pet card → navigate to `/pets/[id]`
3. **Add Another Pet** - On homepage → click "Add Another Pet" → fill form → save to cookie array → homepage refreshes with new pet card in grid
4. **Add Medical Records** - On pet dashboard → click "Add Vaccine/Allergy" → form → appears in tabs immediately
5. **View Admin Dashboard** - Click "Go to Admin Dashboard" → see all pets system-wide + stats → click pet card to view details
6. **Download QR Code** - On pet dashboard → click "Download QR Code" → get PNG file → print and attach to collar

---

## 7. Additional Feature: QR Code

**What:** Downloadable QR code on each pet profile that links to `/pets/[id]`

**Why:** Safety feature for lost pets. Finder can scan collar QR code to instantly view allergies, vaccines, and owner info.

**Implementation:** Client component using `qrcode` library, displayed next to pet profile card with download button.

---

## 8. Success Metrics

### MVP Success Criteria
- ✅ All user stories completed
- ✅ Zero breaking bugs in happy path
- ✅ Responsive design (mobile + desktop)
- ✅ <3 second page load times
- ✅ Clear code with TypeScript types
- ✅ Graceful error handling for common issues
- ✅ Zod validation preventing invalid data

### Demo Readiness
- Sample data seeded (15 pets, 88 vaccines, 25 allergies)
- Cookie cleared at start for fresh demo
- Homepage shows landing page with app info
- Admin dashboard accessible via homepage
- Loading states and error handling visible
- Ready to discuss design decisions and extensibility

### Demo Script
1. **Landing Page** (First Visit - No Pets):
   - Load homepage → See app title, tagline, and feature descriptions
   - Show tech stack badges (hover to see rationale)
   - Show "Create Your First Pet" button
   - Show "Go to Admin Dashboard" link

2. **Create First Pet**:
   - Click "Create Your First Pet" → Opens dialog
   - Fill form (e.g., "Buddy", Dog, "John Smith", DOB)
   - Submit → Redirects to `/pets/1` (Buddy's dashboard)

3. **Pet Dashboard**:
   - Show pet profile card with info
   - Show QR code (desktop only)
   - Click "Add Vaccine" → Add Rabies vaccine
   - Click "Add Allergy" → Add Peanuts allergy (severe)
   - View records in tabs

4. **QR Code Feature**:
   - Point to QR code next to pet profile
   - Click "Download QR Code" → PNG file downloads
   - Explain: "Print and attach to collar for emergency access"

5. **Return to Homepage** (Now Has Pets):
   - Navigate to `/` or click breadcrumb "Homepage"
   - Now shows grid with Buddy's pet card
   - Show "Add Another Pet" button
   - Show "Admin Dashboard" link

6. **Add Second Pet**:
   - Click "Add Another Pet" → Opens dialog
   - Fill form (e.g., "Whiskers", Cat, "John Smith", DOB)
   - Submit → Homepage refreshes, now shows grid with 2 pet cards

7. **Navigate Between Pets**:
   - Click Whiskers card → Navigate to `/pets/2`
   - Click breadcrumb "Homepage" → Return to grid
   - Click Buddy card → Navigate to `/pets/1`

8. **Admin Dashboard**:
   - Click "Admin Dashboard"
   - See statistics cards (17 pets, 90 vaccines, 27 allergies)
   - Browse ALL pet cards in grid (includes sample data + your 2 pets)
   - Click any pet card → View that pet's dashboard with breadcrumb "Homepage > Admin > {Pet Name}"

9. **Return to My Pets**:
   - Click breadcrumb "Homepage" or "Back to My Pets"
   - Returns to personal pet grid showing only your 2 pets

---

## Appendix A: Type Definitions

```typescript
// lib/db/schema.ts

export type AnimalType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'

export type RecordType = 'vaccine' | 'allergy'  // MVP scope; extensible to 'lab_result', 'vital', etc.

export type Severity = 'mild' | 'severe'

export interface Pet {
  id: number
  name: string
  animalType: AnimalType
  ownerName: string
  dateOfBirth: string  // ISO 8601
  createdAt: string
  updatedAt: string
}

export interface MedicalRecord {
  id: number
  petId: number
  recordType: RecordType
  data: VaccineData | AllergyData  // Union type makes adding new types easy
  createdAt: string
}

export interface VaccineData {
  vaccineName: string
  administeredDate: string
}

export interface AllergyData {
  allergyName: string
  reactions: string[]
  severity: Severity
}

// Future extensibility example (not implemented in MVP):
// export interface LabResultData {
//   testName: string
//   testDate: string
//   results: Record<string, unknown>
// }
```

---

**End of Specification**
