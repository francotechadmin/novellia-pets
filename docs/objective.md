Novellia Pets — MVP task

Overview
Novellia Pets is a spin‑off service that stores and displays medical records for pets. Build an MVP that supports basic CRUD for pets and their medical records plus a small admin dashboard.

MVP features
1. Create a new pet (new account)
2. Add a new medical record to a pet
3. Dashboard to view all pets and their records (admin view)
4. One extra feature of your choice (justify why it’s useful)

Pet model
- name
- species (type of animal)
- owner_name
- date_of_birth

Medical record types (support at least two; design for adding more later)
1. Vaccine
    - vaccine_name
    - administered_date
2. Allergy
    - allergy_name
    - reactions (e.g., hives, rash)
    - severity (mild | severe)

User stories
- As a user, I can add a new pet.
- As a user, I can add a vaccination or allergy record to a pet.
- As an admin, I can view all pets and their records.

Requirements / Notes
- Explain how and why you modeled the data structures (schemas, relationships).
- Explain how and why you structured the API endpoints (routes, verbs, request/response shapes).
- Explain the pages you built and the UX choices.
- List improvements you'd make to productionize the app (authentication, validation, backups, scaling, testing, monitoring).
- Persistence can be in-memory, sqlite, Redis, or a SQL DB — it just needs to persist while the app is running.
- Design the data model to easily add a third record type (e.g., lab result, vitals, visit).
- Handle basic user errors gracefully and return helpful messages.
- Authentication/sessions are not required.

Acceptance criteria
- Basic create/read flows for pets and records work.
- Admin dashboard shows all pets and their records.
- Code is documented enough to explain modeling and API choices.
- App remains extensible to add new record types.

Deliverables
- Source code for backend and minimal frontend.
- README explaining:
  - data model rationale
  - API design
  - pages/routes built
  - suggested production improvements