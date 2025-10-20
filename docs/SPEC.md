# Novellia Pets - MVP Specification

## Executive Summary

Novellia Pets is a medical record management system for pets, allowing pet owners to track vaccinations and allergies. This MVP uses a **1 pet = 1 account** model where each pet represents a separate account/profile. Users can create a pet account, add medical records to it, and view their pet's information. Admins can view all pet accounts across the system.

---

## 1. Product Overview

### 1.1 Core Features
1. **Pet Account Creation** - Create a new pet account (1 pet = 1 account)
2. **Medical Record Management** - Add and view vaccination and allergy records
3. **Pet Dashboard** - View your pet's profile and medical records on homepage
4. **Admin Dashboard** - View all pet accounts with statistics at `/admin`
5. **QR Code for Emergency Access** - Downloadable QR code linking to pet's medical records for emergency responders

### 1.1.1 Account Model: 1 Pet = 1 Account
This MVP uses a unique approach where **each pet represents a separate account**:
- Creating a new pet = creating a new account
- User is "signed in" on app load (simulated with localStorage)
- If user has no pet yet, they're prompted to create one
- Once created, the pet becomes their account
- "Go to Admin Dashboard" button allows viewing all pets
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
│  │  📝 "Create Pet Account" prompt │                     │
│  │  └─ Create → Save ID → Refresh  │                     │
│  │                                  │                     │
│  └─ Pet Exists (currentPetId set) ─┤                     │
│     │                               │                     │
│     │  🐾 Pet Profile               │                     │
│     │  📋 Medical Records (Tabs)    │                     │
│     │  ➕ Add Vaccine/Allergy       │                     │
│     │  🔧 Go to Admin Dashboard ────┼──┐                 │
│     │                               │  │                 │
│     └───────────────────────────────┘  │                 │
│                                         │                 │
│                                         ↓                 │
│                              ┌──────────────────┐        │
│                              │  Admin (/admin)  │        │
│                              ├──────────────────┤        │
│                              │  📊 Statistics   │        │
│                              │  🐾 All Pets     │        │
│                              │  ← Back to My Pet│        │
│                              └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 4.1 Page Structure

#### 4.1.1 Homepage (`/`) - User's Pet Dashboard
**Purpose**: Show the user's pet account or prompt to create one

**No Pet State**:
- Welcome message: "Welcome! Create your pet account to get started"
- Large "Create Pet Account" button
- Optional: "Go to Admin Dashboard" link in header

**With Pet State**:
- Pet profile header (name, type, owner, age)
- Quick actions: "Add Vaccine", "Add Allergy"
- Tabs: "All Records", "Vaccines", "Allergies"
- Timeline/list view of medical records
- "Go to Admin Dashboard" button in header

**Components** (shadcn/ui):
- `Card` - Pet profile card and record cards
- `Button` - Actions and navigation
- `Tabs` - Record type filtering
- `Badge` - Severity indicators, record types
- `Dialog` - Add vaccine/allergy modals
- `Skeleton` - Loading states

**Note**: Homepage shows the current user's pet. If no pet exists, prompts creation.

#### 4.1.2 Add Pet Dialog
**Purpose**: Create a new pet account (becomes user's account)

**Layout**:
- Triggered by "Create Pet Account" button on homepage (when no pet exists)
- Dialog component (centered modal)
- Form with validation
- On success, closes modal, saves pet ID to localStorage, refreshes homepage to show pet

**Components**:
- `Dialog` - Modal wrapper
- `Form` - Form wrapper with validation
- `Input` - Text fields (name, owner, date of birth)
- `Select` - Animal type dropdown
- `Button` - Submit with loading state

**Note**: Use native `<input type="date">` for date of birth. After creation, pet ID is stored in localStorage as the user's "account".

#### 4.1.3 Admin Dashboard (`/admin`)
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

#### 4.1.4 Page Flow Summary

**User Journey**:
1. User loads app → Homepage (`/`)
2. **If no pet exists**: "Create Pet Account" prompt
3. **If pet exists**: Pet dashboard with medical records
4. User can click "Go to Admin Dashboard" → `/admin`
5. On admin dashboard, can view all pets and stats
6. Click "Back to My Pet" → Returns to `/`

### 4.2 Navigation

- `/` - User's pet dashboard (or create prompt if no pet)
- `/admin` - All pets + statistics
- `currentPetId` stored in localStorage

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

### 5.2 File Structure
```
app/
├── page.tsx                     # Homepage (user's pet dashboard)
├── admin/
│   └── page.tsx                 # Admin dashboard (all pets)
├── layout.tsx                   # Root layout
├── actions/
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
    ├── pet-context.ts          # localStorage helpers for currentPetId
    └── constants.ts            # Enums, constants
```

---

## 6. User Stories

1. **Create Pet Account** - First load shows create prompt → form → save to localStorage → show dashboard
2. **Add Medical Records** - Add vaccines/allergies from dashboard → appear in tabs immediately
3. **View Admin Dashboard** - Click button → see all pets + stats → return to my pet
4. **Download QR Code** - Click download button on pet profile → get QR code PNG → print and attach to collar

---

## 7. Additional Feature: QR Code

**What:** Downloadable QR code on each pet profile that links to `/pets/[id]`

**Why:** Safety feature for lost pets. Finder can scan collar QR code to instantly view allergies, vaccines, and owner info.

**Implementation:** Client component using `qrcode` library, displayed next to pet profile card with download button.

---

## 13. Success Metrics

### MVP Success Criteria
- ✅ All user stories completed
- ✅ Zero breaking bugs in happy path
- ✅ Manual testing checklist completed (Section 10.2)
- ✅ Responsive design (mobile + desktop)
- ✅ <3 second page load times
- ✅ Clear code with TypeScript types
- ✅ Graceful error handling for common issues
- ✅ Zod validation preventing invalid data

### Demo Readiness
- Sample data seeded (15 pets, 88 vaccines, 25 allergies)
- localStorage cleared at start for fresh demo
- Homepage shows "Create Pet" prompt initially
- Admin dashboard accessible via button
- Loading states and error handling visible
- Ready to discuss design decisions and extensibility

### Demo Script
1. **First Visit** (No Pet):
   - Load homepage → See "Create Pet Account" prompt
   - Fill form (e.g., "Buddy", Dog, "John Smith", DOB)
   - Submit → Pet dashboard appears with tabs

2. **Add Medical Records**:
   - Click "Add Vaccine" → Add Rabies vaccine
   - Click "Add Allergy" → Add Peanuts allergy (severe)
   - View records in tabs

3. **QR Code Feature**:
   - Show QR code next to pet profile
   - Click "Download QR Code" → PNG file downloads
   - Explain: "Print and attach to collar for emergency access"

4. **Admin Dashboard**:
   - Click "Go to Admin Dashboard"
   - See statistics cards (15 pets, 89 vaccines, 26 allergies)
   - Browse all pet cards
   - Click "Back to My Pet" → Return to Buddy's dashboard

---

## Appendix A: Type Definitions

```typescript
// lib/db/schema.ts

export type AnimalType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'

export type RecordType = 'vaccine' | 'allergy' | 'lab_result' | 'vital'

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
  data: VaccineData | AllergyData | LabResultData
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

export interface LabResultData {
  testName: string
  testDate: string
  results: Record<string, unknown>
}


---

## 7. Type Definitions (Key Types)

```typescript
export type AnimalType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
export type RecordType = 'vaccine' | 'allergy'
export type Severity = 'mild' | 'severe'

export interface Pet {
  id: number
  name: string
  animalType: AnimalType
  ownerName: string
  dateOfBirth: string
  createdAt: string
  updatedAt: string
}

export interface MedicalRecord {
  id: number
  petId: number
  recordType: RecordType
  data: VaccineData | AllergyData
  createdAt: string
}
```

---

**End of Specification**
