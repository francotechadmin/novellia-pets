# Novellia Pets - MVP Specification

## Executive Summary

Novellia Pets is a medical record management system for pets, allowing pet owners to track vaccinations and allergies. This MVP uses a **1 pet = 1 account** model where each pet represents a separate account/profile. Users can create a pet account, add medical records to it, and view their pet's information. Admins can view all pet accounts across the system.

---

## 1. Product Overview

### 1.1 Core Features
1. **Pet Account Creation** - Create a new pet account (1 pet = 1 account)
2. **Medical Record Management** - Add and view vaccination and allergy records
3. **Pet Dashboard** - View individual pet's profile and medical records at `/pets/[id]`
4. **Admin Dashboard** - View all pet accounts with statistics at `/admin`
5. **QR Code for Emergency Access** - Downloadable QR code linking to pet's medical records for emergency responders

### 1.1.1 Account Model: 1 Pet = 1 Account
This MVP uses a unique approach where **each pet represents a separate account**:
- Creating a new pet = creating a new account
- User is "signed in" on app load (tracked via HTTP-only cookies)
- `currentPetId` stored in cookie identifies the active account
- Homepage (`/`) is a landing page with navigation options
- After creating a pet, user is redirected to `/pets/[id]` (their pet's dashboard)
- Admin dashboard at `/admin` shows all pet accounts

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
│  ┌─ No Pet (currentPetId = null) ─┐                     │
│  │                                  │                     │
│  │  📝 "Create Pet Account" button │                     │
│  │  🔧 "Go to Admin Dashboard"     │                     │
│  │                                  │                     │
│  └─ Pet Exists (currentPetId set) ─┤                     │
│     │                               │                     │
│     │  🐾 "View Your Pet" button    │                     │
│     │  🔧 "Go to Admin Dashboard"   │                     │
│     │                               │                     │
│     └───────────────────────────────┘                     │
│                                                           │
│  Click "Create Pet" → Redirects to /pets/[id]            │
│  Click "View Your Pet" → Redirects to /pets/[id]         │
│  Click "Go to Admin" → Redirects to /admin               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Pet Dashboard (/pets/[id])                              │
├─────────────────────────────────────────────────────────┤
│  🐾 Pet Profile + QR Code                                │
│  📋 Medical Records (Tabs)                               │
│  ➕ Add Vaccine/Allergy                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Admin Dashboard (/admin)                                │
├─────────────────────────────────────────────────────────┤
│  📊 Statistics (total pets, vaccines, allergies)         │
│  🐾 Grid of all pet cards                                │
│  ← "Back to My Pet" button                               │
└─────────────────────────────────────────────────────────┘
```

### 4.1 Page Structure

#### 4.1.1 Homepage (`/`) - Landing Page
**Purpose**: Navigation hub and demo information center

**Layout**:
- App title: "Novellia Pets"
- Tagline: "Medical records management for your pets"
- Feature highlights:
  - Track vaccinations and allergies
  - QR code for emergency access
  - Admin dashboard with statistics
- Technology stack showcase:
  - Next.js 15 with Server Components
  - SQLite with polymorphic medical records table
  - Server Actions + REST API demo endpoint
  - Tailwind CSS + shadcn/ui
- Demo information:
  - Pre-seeded with 15 sample pets
  - Create your own pet or explore admin dashboard

**No Pet State** (currentPetId = null):
- "Create Pet Account" button (opens dialog)
- "Go to Admin Dashboard" link

**With Pet State** (currentPetId exists):
- "View Your Pet" button → redirects to `/pets/[currentPetId]`
- "Go to Admin Dashboard" link

**Components** (shadcn/ui):
- `Card` - Centered landing card with sections
- `Button` - Navigation actions
- `Badge` - Technology tags
- `Dialog` - Pet creation modal

**On Pet Creation**:
- Save pet ID to cookie
- Redirect to `/pets/[id]` (newly created pet's dashboard)

#### 4.1.2 Add Pet Dialog
**Purpose**: Create a new pet account (becomes user's account)

**Layout**:
- Triggered by "Create Pet Account" button on homepage (when no pet exists)
- Dialog component (centered modal)
- Form with validation
- On success, closes modal, saves pet ID to cookie, and redirects to `/pets/[id]`

**Components**:
- `Dialog` - Modal wrapper
- `Form` - Form wrapper with validation
- `Input` - Text fields (name, owner, date of birth)
- `Select` - Animal type dropdown
- `Button` - Submit with loading state

**Note**: Use native `<input type="date">` for date of birth. After creation, pet ID is stored in cookie and user is redirected to `/pets/[id]`.

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
- `Button` - Actions and navigation ("Back to My Pet")
- `Badge` - Pet type, record counts, severity indicators
- `Skeleton` - Loading states

**Note**: Admin dashboard shows all pets in the system. Users can return to their pet via "Back to My Pet" button or navigating to `/`.

#### 4.1.5 Page Flow Summary

**User Journey**:
1. User loads app → Homepage (`/`) - Landing page with app info
2. **If no pet exists**: Click "Create Pet Account" → Opens dialog → Create pet → Redirects to `/pets/[id]`
3. **If pet exists**: Click "View Your Pet" → Redirects to `/pets/[id]`
4. On pet dashboard: View medical records, add vaccines/allergies, download QR code
5. Click "Go to Admin Dashboard" → `/admin` to view all pets
6. On admin dashboard: View stats, browse all pet cards, click pet card → `/pets/[id]`
7. Click "Back to My Pet" → Returns to `/` (homepage)

### 4.2 Navigation

- `/` - Landing page (navigation hub)
- `/pets/[id]` - Pet dashboard with medical records
- `/admin` - All pets + statistics
- `currentPetId` stored in HTTP-only cookie

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
- `app/actions/user.ts` - Cookie-based session management

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
├── page.tsx                     # Landing page (navigation hub)
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
│   ├── user.ts                  # Cookie-based session management
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

1. **Create Pet Account** - Load homepage → click "Create Pet Account" → fill form → save to cookie → redirect to `/pets/[id]`
2. **View My Pet** - Load homepage (with existing pet) → click "View Your Pet" → redirects to `/pets/[id]` dashboard
3. **Add Medical Records** - On pet dashboard → click "Add Vaccine/Allergy" → form → appears in tabs immediately
4. **View Admin Dashboard** - Click "Go to Admin Dashboard" → see all pets + stats → click pet card to view details
5. **Download QR Code** - On pet dashboard → click "Download QR Code" → get PNG file → print and attach to collar

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
1. **Landing Page**:
   - Load homepage → See app title, tagline, and feature description
   - Show "Create Pet Account" button
   - Show "Go to Admin Dashboard" link

2. **Create Pet** (First Visit):
   - Click "Create Pet Account" → Opens dialog
   - Fill form (e.g., "Buddy", Dog, "John Smith", DOB)
   - Submit → Redirects to `/pets/1` (Buddy's dashboard)

3. **Pet Dashboard**:
   - Show pet profile card with info
   - Show QR code (desktop)
   - Click "Add Vaccine" → Add Rabies vaccine
   - Click "Add Allergy" → Add Peanuts allergy (severe)
   - View records in tabs

4. **QR Code Feature**:
   - Point to QR code next to pet profile
   - Click "Download QR Code" → PNG file downloads
   - Explain: "Print and attach to collar for emergency access"

5. **Admin Dashboard**:
   - Click "Go to Admin Dashboard"
   - See statistics cards (15 pets, 89 vaccines, 26 allergies)
   - Browse all pet cards in grid
   - Click any pet card → View that pet's dashboard

6. **Return to Homepage**:
   - Navigate to `/` or click "Back to My Pet"
   - Now shows "View Your Pet" button (cookie exists)
   - Click "View Your Pet" → Returns to Buddy's dashboard

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
