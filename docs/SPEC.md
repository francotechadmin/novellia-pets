# Novellia Pets - MVP Specification

## Executive Summary

Novellia Pets is a medical record management system for pets, allowing pet owners to track vaccinations and allergies. This MVP focuses on core CRUD operations with a simple admin mode for viewing all records.

---

## 1. Product Overview

### 1.1 Core Features
1. **Pet Registration** - Create new pet profiles with owner information
2. **Medical Record Management** - Add and view vaccination and allergy records
3. **Dashboard** - View all pets and their medical records
4. **Admin Mode** - Toggle to view enhanced details and statistics
5. **Additional Feature** - (See Section 7 for proposals)

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

### 2.3 Design Rationale

**Why a unified `medical_records` table?**
- **Extensibility**: Easy to add new record types (lab results, vitals, visits) without schema changes
- **Consistency**: All records share common patterns (pet association, timestamps, type)
- **Querying**: Simple to get all records for a pet chronologically
- **Type Safety**: TypeScript discriminated unions work well with `record_type` field

**Why JSON for record-specific data?**
- **Flexibility**: Different record types have different fields
- **Future-proofing**: New record types don't require migrations
- **SQLite Support**: JSON functions available (json_extract, json_each)
- **Validation**: Handled at application layer with Zod schemas

**Alternative Considered**: Separate tables (vaccines, allergies) - rejected due to:
- Requires new table + migration for each record type
- Harder to query all records chronologically
- More complex API layer

---

## 3. API Design (Next.js Server Actions)

### 3.1 Why Server Actions?
- **Simplicity**: Direct function calls from React components
- **Type Safety**: Full TypeScript integration, no API contract mismatch
- **Progressive Enhancement**: Works without JavaScript
- **Security**: Automatic CSRF protection, server-only execution
- **Colocation**: Actions near components that use them

### 3.2 API Structure

```
app/
├── actions/
│   ├── pets.ts          # Pet CRUD operations
│   ├── records.ts       # Medical record operations
│   └── admin.ts         # Admin-specific operations
```

#### Pet Actions (`app/actions/pets.ts`)
```typescript
'use server'

// Create new pet
export async function createPet(data: CreatePetInput): Promise<Pet>

// Get all pets (with optional filtering)
export async function getPets(filters?: PetFilters): Promise<Pet[]>

// Get single pet with all medical records
export async function getPetById(id: number): Promise<PetWithRecords>

// Get statistics (for admin view)
export async function getStats(): Promise<Stats>
```

#### Medical Record Actions (`app/actions/records.ts`)
```typescript
'use server'

// Add vaccine record
export async function addVaccineRecord(
  petId: number,
  data: VaccineInput
): Promise<MedicalRecord>

// Add allergy record
export async function addAllergyRecord(
  petId: number,
  data: AllergyInput
): Promise<MedicalRecord>

// Get all records for a pet
export async function getPetRecords(
  petId: number,
  type?: RecordType
): Promise<MedicalRecord[]>

// Future: addLabResultRecord, addVitalRecord, etc.
```

### 3.3 Error Handling Strategy
- **Validation Errors**: Return `{ error: string, field?: string }` for user input issues
- **Database Errors**: Log server-side, return generic "Something went wrong"
- **Not Found**: Return `{ error: 'Pet not found' }` with 404 semantics
- **Success**: Return data object or `{ success: true, data: ... }`

---

## 4. UI/UX Design

### 4.1 Page Structure

#### 4.1.1 Homepage/Dashboard (`/`)
**Purpose**: Central hub for viewing all pets and accessing key features

**Layout**:
- Header with app title and admin mode toggle
- Quick action buttons: "Add New Pet", "View All Records"
- Pet cards grid with search/filter capabilities
- Summary statistics (admin mode only)

**Components** (shadcn/ui):
- `Card` - Pet information cards
- `Button` - Actions and navigation
- `Input` + `Select` - Search and filter controls
- `Badge` - Pet type, record counts
- `Switch` - Admin mode toggle
- `Skeleton` - Loading states

#### 4.1.2 Add Pet Page (`/pets/new`)
**Purpose**: Form to register a new pet

**Layout**:
- Breadcrumb navigation
- Form with validation
- Success state with "Add Medical Record" CTA

**Components**:
- `Form` - Form wrapper with validation
- `Input` - Text fields (name, owner, date of birth)
- `Select` - Animal type dropdown
- `Button` - Submit with loading state

**Note**: Use native `<input type="date">` for date of birth (simpler than Calendar + Popover for MVP)

#### 4.1.3 Pet Detail Page (`/pets/[id]`)
**Purpose**: View pet profile and all medical records

**Layout**:
- Pet profile header (name, type, owner, age calculation)
- Tab navigation: "All Records", "Vaccines", "Allergies"
- Add record buttons (floating action or top bar)
- Timeline/list view of records
- Empty state when no records

**Components**:
- `Tabs` - Record type filtering
- `Table` or `Card` - Record display
- `Dialog` - Add record modal
- `Badge` - Severity indicators, record types
- `Separator` - Visual grouping

#### 4.1.4 Admin View (dashboard with admin mode enabled)
**Purpose**: View all pets with statistics

**Layout**:
- Stat cards showing total pets, total vaccine records, total allergy records
- Same pet cards grid as user view (no filtering needed)
- Expanded details visible on cards (full record counts, owner names)

**Components**:
- `Card` - Stat cards and pet cards
- `Badge` - Enhanced indicators for severe allergies

### 4.2 Why This Page Structure?

**Single Dashboard vs. Multiple Pages**:
- **Homepage Dashboard**: Quick overview, easy access to all pets
- **Dedicated Pet Pages**: Deep dive into individual pet records
- **Form Pages**: Focused, distraction-free data entry

**Alternative Considered**: Single-page app with modal-only interactions
- **Rejected**: Harder to bookmark/share specific pets, less accessible

### 4.3 Loading State Management

**Strategy**: Optimistic UI with React Suspense + Server Actions

1. **Skeleton Screens**: Show layout while data loads
2. **Optimistic Updates**: Immediately show new data, rollback on error
3. **Loading Indicators**: Spinner on buttons during submission
4. **Error Boundaries**: Catch and display errors gracefully

**Implementation**:
```typescript
// Page-level loading
<Suspense fallback={<PetCardsSkeleton />}>
  <PetCards />
</Suspense>

// Action-level loading
const [isPending, startTransition] = useTransition()

function handleSubmit(data: PetInput) {
  startTransition(async () => {
    const result = await createPet(data)
    if (result.error) {
      toast.error(result.error)
    } else {
      router.push(`/pets/${result.id}`)
    }
  })
}
```

### 4.4 Admin Mode Toggle

**Implementation**: Simple UI toggle (Switch component) that:
1. Stores state in localStorage (persists across page loads)
2. No password/authentication (per requirements)
3. Shows/hides admin-only features:
   - Statistics dashboard
   - All pets view (vs. owner-filtered in user mode)
   - Enhanced record details
   - Export capabilities (if implemented)

**UI Location**: Top-right header, labeled "Admin View"

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
├── (routes)/
│   ├── page.tsx                 # Dashboard
│   ├── pets/
│   │   ├── new/
│   │   │   └── page.tsx         # Add pet form
│   │   └── [id]/
│   │       └── page.tsx         # Pet detail
│   └── layout.tsx               # Root layout
├── actions/
│   ├── pets.ts                  # Pet server actions
│   └── records.ts               # Record server actions
├── components/
│   ├── ui/                      # shadcn components
│   ├── pets/
│   │   ├── PetCard.tsx
│   │   ├── PetForm.tsx
│   │   └── PetList.tsx
│   ├── records/
│   │   ├── RecordTimeline.tsx
│   │   ├── VaccineForm.tsx
│   │   └── AllergyForm.tsx
│   ├── AdminToggle.tsx
│   └── AdminStats.tsx
lib/
├── db/
│   ├── schema.ts                # Type definitions
│   ├── client.ts                # SQLite connection
│   └── migrations/
│       └── 001_initial.sql      # Schema creation
├── validations/
│   ├── pet.ts                   # Zod schemas for pets
│   └── record.ts                # Zod schemas for records
└── utils/
    ├── format.ts                # Date formatting, etc.
    └── constants.ts             # Enums, constants
```

### 5.3 Database Connection Pattern
- Single connection instance (`lib/db/client.ts`)
- Connection pooling not needed for SQLite (single file)
- Graceful error handling with connection retries
- Auto-create database file on first run

---

## 6. User Stories & Acceptance Criteria

### 6.1 User Story: Add a New Pet
**As a** pet owner
**I want to** register my pet in the system
**So that** I can track their medical records

**Acceptance Criteria**:
- ✅ Form includes: name, animal type, owner name, date of birth
- ✅ All fields are required with validation
- ✅ Date of birth cannot be in the future
- ✅ Animal type is selectable from predefined list (Dog, Cat, Bird, Rabbit, Other)
- ✅ Success message shown after creation
- ✅ Redirect to pet detail page after creation
- ✅ Error messages displayed for invalid input

### 6.2 User Story: Add Medical Record
**As a** pet owner
**I want to** add vaccination and allergy records
**So that** I have a complete medical history

**Acceptance Criteria**:
- ✅ Can add vaccine with name and date
- ✅ Can add allergy with name, reactions (multi-select), and severity
- ✅ Records immediately appear in pet's timeline
- ✅ Form validation prevents invalid data
- ✅ Can add multiple records to same pet
- ✅ Vaccine date cannot be before pet's birth date

### 6.3 User Story: View All Pets (Admin)
**As an** admin
**I want to** see all registered pets and their records
**So that** I can monitor system usage

**Acceptance Criteria**:
- ✅ Admin toggle enables admin view
- ✅ Dashboard shows total count of pets
- ✅ Can see all pets regardless of owner
- ✅ Statistics show: total pets, total vaccines, total allergies
- ✅ Can click any pet to view full details
- ✅ Loading states shown during data fetch

---

## 7. Additional Feature Proposals

### Option A: Medical History Timeline ⭐ (Recommended)
**What**: Visual timeline showing all medical events chronologically

**Why**:
- Aligns with core use case (viewing medical history)
- Helps identify patterns (e.g., vaccine schedules)
- Differentiates from basic CRUD app

**Implementation**:
- Vertical timeline component with date markers
- Color-coded by record type (vaccines = blue, allergies = red)
- Grouped by month/year for readability
- Uses shadcn `Card` + custom CSS for timeline lines

**Complexity**: Medium (1-2 hours)

---

### Option B: Quick Pet Health Summary
**What**: At-a-glance health indicators on pet cards

**Why**:
- Surfaces critical info (severe allergies) immediately
- Reduces clicks to find important details
- Admin-friendly for quick triage

**Implementation**:
- Badge showing "⚠️ Severe Allergy" if any severe allergies exist
- Count of total vaccines
- "Last updated" timestamp
- Age calculation (years + months)

**Complexity**: Low (30 mins - 1 hour)

---

### Option C: Search & Filter
**What**: Search pets by name/owner, filter by animal type

**Why**:
- Essential as database grows beyond 10-20 pets
- Improves admin workflow significantly
- Easy to implement with Server Actions

**Implementation**:
- Search input with debounced server action
- Animal type filter dropdown
- URL state preservation (searchParams)
- Clear filters button

**Complexity**: Medium (1-2 hours)

---

**Recommendation**: **Option A (Timeline)** for MVP wow factor, **Option C (Search)** for production readiness

---

## 8. Error Handling & Validation

### 8.1 User Input Validation
**Where**: Client + Server (double validation)

**Client-side** (React Hook Form + Zod):
- Instant feedback on field blur
- Prevent form submission with invalid data
- Clear error messages under each field

**Server-side** (Zod):
- Validate all inputs before database operations
- Protect against direct API calls bypassing client validation
- Return structured error objects

**Example Validation**:
```typescript
const petSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  animalType: z.enum(["dog", "cat", "bird", "rabbit", "other"]),
  ownerName: z.string().min(1, "Owner name is required"),
  dateOfBirth: z.string().refine(
    (date) => new Date(date) <= new Date(),
    "Date cannot be in the future"
  )
})
```

### 8.2 Error Scenarios
1. **Empty required fields**: Inline error message
2. **Invalid dates**: "Date must be in the past"
3. **Database errors**: Toast notification with retry option
4. **Pet not found**: Redirect to 404 page
5. **Network errors**: "Please check your connection" with retry

### 8.3 Success Feedback
- **Toast notifications**: Confirm successful actions
- **Optimistic updates**: Show new data immediately
- **Success pages**: Redirect with confirmation message

---

## 9. Future Improvements (Post-MVP)

### 9.1 If Building for Production

**Authentication & Multi-Tenancy**:
- User accounts with Clerk or NextAuth
- Pet ownership enforcement
- Role-based access (owner vs. admin)

**Enhanced Records**:
- Edit/delete existing records
- File attachments (vaccine certificates, X-rays)
- Medication tracking with dosage schedules
- Appointment scheduling

**Notifications**:
- Email reminders for upcoming vaccines
- Annual checkup reminders
- Export records as PDF

**Data & Analytics**:
- Charts for vaccine coverage over time
- Export data to CSV
- Print-friendly medical record format

**Mobile Experience**:
- PWA with offline support
- Mobile-optimized forms
- Camera integration for document uploads

**Performance**:
- Pagination for large pet lists
- Lazy loading for records
- Database indexing optimization
- Migration to PostgreSQL for scalability

**Quality Assurance**:
- Unit tests for server actions (Vitest)
- E2E tests for critical paths (Playwright)
- Accessibility audit (WCAG 2.1 AA)
- Security audit (SQL injection, XSS)

### 9.2 Scalability Considerations

**Database**:
- Current: SQLite (good for <10k records)
- Next: PostgreSQL with Prisma ORM
- Add database connection pooling
- Implement read replicas for admin queries

**Caching**:
- Add Redis for frequently accessed pet data
- Cache admin statistics (regenerate hourly)
- Implement stale-while-revalidate pattern

**Monitoring**:
- Add error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Database query optimization

---

## 10. Testing Strategy (Optional)

### 10.1 Approach for MVP

**Philosophy**: Manual testing for MVP, with optional validation tests if time permits.

**Why minimal testing for MVP?**
- Task doesn't require automated tests
- 8-10 hour timeline needs to focus on features
- Manual testing catches obvious bugs
- Zod validation provides runtime safety

### 10.2 Manual Testing Checklist

**Critical Flows**:
- [ ] Create a new pet with all fields
- [ ] Create pet with invalid data (empty name, future birth date)
- [ ] Add vaccine record to a pet
- [ ] Add allergy record with multiple reactions
- [ ] View all pets on dashboard
- [ ] Toggle admin mode on/off
- [ ] View pet detail page with all records
- [ ] Test on mobile viewport

**Edge Cases**:
- [ ] Pet with no records (empty state)
- [ ] Very long names (truncation/wrapping)
- [ ] Multiple pets with same owner name
- [ ] Birth date = today

### 10.3 Optional: Critical Validation Tests

**If time permits**, add these high-value tests to catch data integrity bugs:

```typescript
// lib/validations/__tests__/pet.test.ts
import { describe, it, expect } from 'vitest'
import { petSchema, allergySchema } from '../schemas'

describe('Critical Validation', () => {
  it('should reject future birth dates', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)

    const result = petSchema.safeParse({
      name: 'Buddy',
      animalType: 'dog',
      ownerName: 'John',
      dateOfBirth: futureDate.toISOString().split('T')[0]
    })

    expect(result.success).toBe(false)
  })

  it('should require allergy severity to be mild or severe', () => {
    const result = allergySchema.safeParse({
      allergyName: 'Peanuts',
      reactions: ['hives'],
      severity: 'medium' // invalid
    })

    expect(result.success).toBe(false)
  })
})
```

**Setup** (only if adding tests):
```bash
npm install -D vitest
```

```json
// package.json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

### 10.4 Production Testing (Future)

When building for production, add:
- Unit tests for server actions (80%+ coverage)
- Integration tests for database operations
- E2E tests for critical flows (Playwright)
- CI/CD pipeline with automated test runs

See Section 9.1 for full testing strategy.

---

## 11. Development Plan

### Phase 1: Setup & Database (1.5-2 hours)
1. Install dependencies (shadcn/ui, better-sqlite3, zod)
2. Initialize shadcn/ui with essential components
3. Create database schema and migrations
4. Set up TypeScript types and Zod schemas

### Phase 2: Core Features (4-5 hours)
1. Implement pet creation (form + server action)
2. Build pet dashboard with card layout
3. Create pet detail page
4. Add vaccine/allergy record forms
5. Implement admin toggle with localStorage
6. Add statistics for admin view

### Phase 3: Polish & Additional Feature (2-2.5 hours)
1. Add loading states and skeletons
2. Implement error handling and toasts
3. Build additional feature (Timeline recommended)
4. Responsive design testing
5. Empty states and edge cases

### Phase 4: Final Polish & Documentation (1-1.5 hours)
1. Manual testing checklist (see Section 10.2)
2. Seed sample data (5-10 pets with records)
3. Write README with setup instructions
4. Final QA and bug fixes
5. Prepare discussion points for interview

**Total Estimated Time**: 9-11 hours

**Optional** (+30 min): Add 2-3 critical validation tests if time permits

---

## 12. Discussion Points (For Interview)

### Data Structure
**Decision**: Unified `medical_records` table with JSON data column

**Rationale**:
- Extensible for new record types without migrations
- Consistent querying patterns
- Type safety via TypeScript discriminated unions

**Trade-offs**:
- Less efficient queries on record-specific fields (mitigated by indexes)
- Requires application-layer validation (good practice anyway)

**Alternative**: Separate tables per record type → rejected due to inflexibility

---

### API Structure
**Decision**: Next.js Server Actions instead of REST API

**Rationale**:
- Type-safe end-to-end (no API contract drift)
- Simpler mental model (direct function calls)
- Automatic CSRF protection
- Progressive enhancement

**Trade-offs**:
- Harder to consume from non-Next.js clients
- Less familiar to developers from REST backgrounds

**Alternative**: tRPC or REST API → unnecessary complexity for MVP

---

### Page Structure
**Decision**: Multi-page app with dedicated routes

**Rationale**:
- Better UX for bookmarking/sharing
- Clearer navigation hierarchy
- SEO-friendly (future consideration)

**Trade-offs**:
- More navigation vs. single-page app
- Slightly more code for routing

**Alternative**: Modal-based SPA → worse accessibility and UX

---

### Testing Strategy
**Decision**: Vitest for unit/integration, optional Playwright for E2E

**Rationale**:
- Vitest is fast, ESM-native, and works great with Next.js
- Focus on high-value tests: validation, database ops, server actions
- In-memory SQLite for isolated, fast tests
- 100% coverage on validation schemas (data integrity critical)

**Trade-offs**:
- Time investment (adds ~2-3 hours to MVP)
- E2E tests can be flaky (kept optional for MVP)

**Alternative**: Manual testing only → risky for data integrity bugs

---

### Why This Tech Stack?
- **SQLite**: Zero config, perfect for MVP, easy migration path
- **Server Actions**: Modern, type-safe, aligned with Next.js best practices
- **shadcn/ui**: Customizable, accessible, Tailwind-native
- **Zod**: Runtime validation matches TypeScript types
- **Vitest**: Fast, modern testing framework that works seamlessly with TypeScript

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
- Sample data seeded (5-10 pets with records)
- All pages accessible from navigation
- Admin mode toggle functional
- Loading states visible (throttle network if needed)
- Ready to discuss design decisions and extensibility

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

export interface PetWithRecords extends Pet {
  records: MedicalRecord[]
}

export interface Stats {
  totalPets: number
  totalVaccines: number
  totalAllergies: number
}
```

---

## Appendix B: Component Inventory (shadcn/ui)

**Install Commands**:
```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add switch
npx shadcn@latest add toast
```

**Usage Summary**:
- Forms: `Form`, `Input`, `Label`, `Select` (use native `<input type="date">` for dates)
- Layout: `Card`, `Separator`, `Tabs`, `Dialog`
- Feedback: `Toast`, `Skeleton`, `Badge`
- Actions: `Button`, `Switch`

**Removed from MVP** (can add later if needed):
- `Table` - Card layout is sufficient for MVP
- `Calendar` + `Popover` - Native date input is simpler
- `Checkbox` - Can use if adding multi-select reactions UI

---

## Appendix C: Database Seed Data

```sql
-- Sample pets
INSERT INTO pets (name, animal_type, owner_name, date_of_birth) VALUES
  ('Buddy', 'dog', 'John Smith', '2020-05-15'),
  ('Whiskers', 'cat', 'Jane Doe', '2019-08-22'),
  ('Tweety', 'bird', 'Bob Johnson', '2022-01-10');

-- Sample vaccine records
INSERT INTO medical_records (pet_id, record_type, data) VALUES
  (1, 'vaccine', '{"vaccineName": "Rabies", "administeredDate": "2024-01-15"}'),
  (1, 'vaccine', '{"vaccineName": "DHPP", "administeredDate": "2024-01-15"}'),
  (2, 'vaccine', '{"vaccineName": "FVRCP", "administeredDate": "2024-02-20"}');

-- Sample allergy records
INSERT INTO medical_records (pet_id, record_type, data) VALUES
  (1, 'allergy', '{"allergyName": "Peanuts", "reactions": ["hives", "swelling"], "severity": "severe"}'),
  (2, 'allergy', '{"allergyName": "Chicken", "reactions": ["itching"], "severity": "mild"}');
```

---

**End of Specification**

This spec provides a comprehensive blueprint for building the Novellia Pets MVP. It balances technical detail with flexibility, allowing for iterative development while keeping the interview discussion points front and center.
