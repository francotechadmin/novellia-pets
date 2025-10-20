// Seed script to populate database with sample data
import { getDb } from '../lib/db/client'

const pets = [
  { name: 'Buddy', animal_type: 'dog', owner_name: 'John Smith', date_of_birth: '2020-05-15' },
  { name: 'Whiskers', animal_type: 'cat', owner_name: 'Jane Doe', date_of_birth: '2019-08-22' },
  { name: 'Tweety', animal_type: 'bird', owner_name: 'Bob Johnson', date_of_birth: '2022-01-10' },
  { name: 'Max', animal_type: 'dog', owner_name: 'Sarah Williams', date_of_birth: '2021-03-20' },
  { name: 'Luna', animal_type: 'cat', owner_name: 'Mike Brown', date_of_birth: '2020-11-05' },
  { name: 'Charlie', animal_type: 'rabbit', owner_name: 'Emily Davis', date_of_birth: '2023-02-14' },
  { name: 'Rocky', animal_type: 'dog', owner_name: 'Chris Miller', date_of_birth: '2019-12-01' },
  { name: 'Bella', animal_type: 'cat', owner_name: 'Lisa Anderson', date_of_birth: '2022-06-30' },
  { name: 'Polly', animal_type: 'bird', owner_name: 'David Wilson', date_of_birth: '2021-09-18' },
  { name: 'Snowball', animal_type: 'rabbit', owner_name: 'Jessica Taylor', date_of_birth: '2023-04-25' },
  { name: 'Duke', animal_type: 'dog', owner_name: 'Robert Martinez', date_of_birth: '2018-07-08' },
  { name: 'Mittens', animal_type: 'cat', owner_name: 'Patricia Garcia', date_of_birth: '2020-03-12' },
  { name: 'Fluffy', animal_type: 'rabbit', owner_name: 'Michael Rodriguez', date_of_birth: '2022-11-20' },
  { name: 'Shadow', animal_type: 'cat', owner_name: 'Jennifer Lee', date_of_birth: '2019-05-30' },
  { name: 'Cooper', animal_type: 'dog', owner_name: 'William Walker', date_of_birth: '2021-08-14' },
]

const vaccines = [
  // Buddy (Pet 1) - Dog with extensive vaccine history
  { petId: 1, vaccineName: 'Rabies', administeredDate: '2021-06-15' },
  { petId: 1, vaccineName: 'DHPP', administeredDate: '2021-06-15' },
  { petId: 1, vaccineName: 'Bordetella', administeredDate: '2021-06-15' },
  { petId: 1, vaccineName: 'Rabies', administeredDate: '2022-06-15' },
  { petId: 1, vaccineName: 'DHPP', administeredDate: '2022-06-15' },
  { petId: 1, vaccineName: 'Bordetella', administeredDate: '2022-06-15' },
  { petId: 1, vaccineName: 'Rabies', administeredDate: '2023-06-15' },
  { petId: 1, vaccineName: 'DHPP', administeredDate: '2023-06-15' },
  { petId: 1, vaccineName: 'Leptospirosis', administeredDate: '2023-06-15' },
  { petId: 1, vaccineName: 'Rabies', administeredDate: '2024-06-15' },
  { petId: 1, vaccineName: 'DHPP', administeredDate: '2024-06-15' },
  { petId: 1, vaccineName: 'Bordetella', administeredDate: '2024-10-01' },

  // Whiskers (Pet 2) - Cat
  { petId: 2, vaccineName: 'FVRCP', administeredDate: '2020-09-22' },
  { petId: 2, vaccineName: 'Rabies', administeredDate: '2020-09-22' },
  { petId: 2, vaccineName: 'FVRCP', administeredDate: '2021-09-22' },
  { petId: 2, vaccineName: 'Rabies', administeredDate: '2021-09-22' },
  { petId: 2, vaccineName: 'FVRCP', administeredDate: '2022-09-22' },
  { petId: 2, vaccineName: 'Rabies', administeredDate: '2023-09-22' },
  { petId: 2, vaccineName: 'FVRCP', administeredDate: '2024-09-22' },

  // Tweety (Pet 3) - Bird
  { petId: 3, vaccineName: 'Avian Polyomavirus', administeredDate: '2022-02-10' },
  { petId: 3, vaccineName: 'Avian Polyomavirus', administeredDate: '2023-02-10' },
  { petId: 3, vaccineName: 'Avian Polyomavirus', administeredDate: '2024-02-10' },

  // Max (Pet 4) - Dog
  { petId: 4, vaccineName: 'Rabies', administeredDate: '2022-04-20' },
  { petId: 4, vaccineName: 'DHPP', administeredDate: '2022-04-20' },
  { petId: 4, vaccineName: 'Rabies', administeredDate: '2023-04-20' },
  { petId: 4, vaccineName: 'DHPP', administeredDate: '2023-04-20' },
  { petId: 4, vaccineName: 'Leptospirosis', administeredDate: '2023-04-20' },
  { petId: 4, vaccineName: 'Rabies', administeredDate: '2024-04-20' },
  { petId: 4, vaccineName: 'DHPP', administeredDate: '2024-04-20' },

  // Luna (Pet 5) - Cat
  { petId: 5, vaccineName: 'FVRCP', administeredDate: '2021-12-05' },
  { petId: 5, vaccineName: 'Rabies', administeredDate: '2021-12-05' },
  { petId: 5, vaccineName: 'FVRCP', administeredDate: '2022-12-05' },
  { petId: 5, vaccineName: 'Rabies', administeredDate: '2023-12-05' },
  { petId: 5, vaccineName: 'FVRCP', administeredDate: '2024-12-05' },

  // Charlie (Pet 6) - Rabbit (limited vaccines)
  { petId: 6, vaccineName: 'Rabbit Hemorrhagic Disease', administeredDate: '2023-03-14' },
  { petId: 6, vaccineName: 'Rabbit Hemorrhagic Disease', administeredDate: '2024-03-14' },

  // Rocky (Pet 7) - Older dog with long history
  { petId: 7, vaccineName: 'Rabies', administeredDate: '2020-01-01' },
  { petId: 7, vaccineName: 'DHPP', administeredDate: '2020-01-01' },
  { petId: 7, vaccineName: 'Rabies', administeredDate: '2021-01-01' },
  { petId: 7, vaccineName: 'DHPP', administeredDate: '2021-01-01' },
  { petId: 7, vaccineName: 'Rabies', administeredDate: '2022-01-01' },
  { petId: 7, vaccineName: 'DHPP', administeredDate: '2022-01-01' },
  { petId: 7, vaccineName: 'Rabies', administeredDate: '2023-01-01' },
  { petId: 7, vaccineName: 'DHPP', administeredDate: '2023-01-01' },
  { petId: 7, vaccineName: 'Rabies', administeredDate: '2024-01-01' },
  { petId: 7, vaccineName: 'DHPP', administeredDate: '2024-01-01' },

  // Bella (Pet 8) - Cat
  { petId: 8, vaccineName: 'FVRCP', administeredDate: '2022-07-30' },
  { petId: 8, vaccineName: 'Rabies', administeredDate: '2022-07-30' },
  { petId: 8, vaccineName: 'FVRCP', administeredDate: '2023-07-30' },
  { petId: 8, vaccineName: 'Rabies', administeredDate: '2024-07-30' },

  // Polly (Pet 9) - Bird
  { petId: 9, vaccineName: 'Avian Polyomavirus', administeredDate: '2022-10-18' },
  { petId: 9, vaccineName: 'Avian Polyomavirus', administeredDate: '2023-10-18' },
  { petId: 9, vaccineName: 'Avian Polyomavirus', administeredDate: '2024-10-18' },

  // Snowball (Pet 10) - Rabbit
  { petId: 10, vaccineName: 'Rabbit Hemorrhagic Disease', administeredDate: '2023-05-25' },
  { petId: 10, vaccineName: 'Rabbit Hemorrhagic Disease', administeredDate: '2024-05-25' },

  // Duke (Pet 11) - Older dog with extensive history
  { petId: 11, vaccineName: 'Rabies', administeredDate: '2019-08-08' },
  { petId: 11, vaccineName: 'DHPP', administeredDate: '2019-08-08' },
  { petId: 11, vaccineName: 'Bordetella', administeredDate: '2019-08-08' },
  { petId: 11, vaccineName: 'Rabies', administeredDate: '2020-08-08' },
  { petId: 11, vaccineName: 'DHPP', administeredDate: '2020-08-08' },
  { petId: 11, vaccineName: 'Rabies', administeredDate: '2021-08-08' },
  { petId: 11, vaccineName: 'DHPP', administeredDate: '2021-08-08' },
  { petId: 11, vaccineName: 'Leptospirosis', administeredDate: '2021-08-08' },
  { petId: 11, vaccineName: 'Rabies', administeredDate: '2022-08-08' },
  { petId: 11, vaccineName: 'DHPP', administeredDate: '2022-08-08' },
  { petId: 11, vaccineName: 'Rabies', administeredDate: '2023-08-08' },
  { petId: 11, vaccineName: 'DHPP', administeredDate: '2023-08-08' },
  { petId: 11, vaccineName: 'Rabies', administeredDate: '2024-08-08' },
  { petId: 11, vaccineName: 'DHPP', administeredDate: '2024-08-08' },

  // Mittens (Pet 12) - Cat
  { petId: 12, vaccineName: 'FVRCP', administeredDate: '2021-04-12' },
  { petId: 12, vaccineName: 'Rabies', administeredDate: '2021-04-12' },
  { petId: 12, vaccineName: 'FVRCP', administeredDate: '2022-04-12' },
  { petId: 12, vaccineName: 'Rabies', administeredDate: '2023-04-12' },
  { petId: 12, vaccineName: 'FVRCP', administeredDate: '2024-04-12' },

  // Fluffy (Pet 13) - Rabbit
  { petId: 13, vaccineName: 'Rabbit Hemorrhagic Disease', administeredDate: '2023-01-20' },
  { petId: 13, vaccineName: 'Rabbit Hemorrhagic Disease', administeredDate: '2024-01-20' },

  // Shadow (Pet 14) - Cat
  { petId: 14, vaccineName: 'FVRCP', administeredDate: '2020-06-30' },
  { petId: 14, vaccineName: 'Rabies', administeredDate: '2020-06-30' },
  { petId: 14, vaccineName: 'FVRCP', administeredDate: '2021-06-30' },
  { petId: 14, vaccineName: 'Rabies', administeredDate: '2022-06-30' },
  { petId: 14, vaccineName: 'FVRCP', administeredDate: '2023-06-30' },
  { petId: 14, vaccineName: 'Rabies', administeredDate: '2024-06-30' },

  // Cooper (Pet 15) - Dog
  { petId: 15, vaccineName: 'Rabies', administeredDate: '2022-09-14' },
  { petId: 15, vaccineName: 'DHPP', administeredDate: '2022-09-14' },
  { petId: 15, vaccineName: 'Rabies', administeredDate: '2023-09-14' },
  { petId: 15, vaccineName: 'DHPP', administeredDate: '2023-09-14' },
  { petId: 15, vaccineName: 'Rabies', administeredDate: '2024-09-14' },
  { petId: 15, vaccineName: 'DHPP', administeredDate: '2024-09-14' },
]

const allergies = [
  // Multiple allergies for some pets to show lengthy records
  { petId: 1, allergyName: 'Peanuts', reactions: ['Hives', 'Swelling', 'Difficulty breathing'], severity: 'severe' },
  { petId: 1, allergyName: 'Chicken', reactions: ['Itching', 'Rash'], severity: 'mild' },
  { petId: 1, allergyName: 'Wheat', reactions: ['Vomiting', 'Diarrhea'], severity: 'mild' },

  { petId: 2, allergyName: 'Chicken', reactions: ['Itching', 'Rash', 'Vomiting'], severity: 'mild' },
  { petId: 2, allergyName: 'Beef', reactions: ['Hives'], severity: 'mild' },

  { petId: 3, allergyName: 'Dust', reactions: ['Sneezing', 'Watery eyes'], severity: 'mild' },

  { petId: 4, allergyName: 'Beef', reactions: ['Vomiting', 'Diarrhea', 'Lethargy'], severity: 'severe' },
  { petId: 4, allergyName: 'Soy', reactions: ['Itching', 'Rash'], severity: 'mild' },
  { petId: 4, allergyName: 'Corn', reactions: ['Hives'], severity: 'mild' },

  { petId: 5, allergyName: 'Fish', reactions: ['Itching', 'Hives', 'Swelling'], severity: 'mild' },
  { petId: 5, allergyName: 'Dairy', reactions: ['Vomiting'], severity: 'mild' },

  { petId: 6, allergyName: 'Hay', reactions: ['Sneezing', 'Watery eyes', 'Itching'], severity: 'mild' },
  { petId: 6, allergyName: 'Timothy Grass', reactions: ['Sneezing', 'Watery eyes'], severity: 'mild' },

  { petId: 7, allergyName: 'Corn', reactions: ['Rash', 'Itching', 'Vomiting'], severity: 'mild' },
  { petId: 7, allergyName: 'Wheat', reactions: ['Diarrhea', 'Lethargy'], severity: 'mild' },
  { petId: 7, allergyName: 'Chicken', reactions: ['Hives'], severity: 'mild' },

  { petId: 8, allergyName: 'Dairy', reactions: ['Vomiting', 'Diarrhea', 'Difficulty breathing'], severity: 'severe' },
  { petId: 8, allergyName: 'Fish', reactions: ['Hives', 'Swelling'], severity: 'severe' },

  { petId: 11, allergyName: 'Beef', reactions: ['Itching', 'Rash', 'Hives'], severity: 'mild' },
  { petId: 11, allergyName: 'Pollen', reactions: ['Sneezing', 'Watery eyes'], severity: 'mild' },
  { petId: 11, allergyName: 'Flea Saliva', reactions: ['Itching', 'Rash', 'Swelling'], severity: 'severe' },

  { petId: 12, allergyName: 'Tuna', reactions: ['Vomiting', 'Diarrhea'], severity: 'mild' },

  { petId: 14, allergyName: 'Chicken', reactions: ['Itching', 'Hives', 'Vomiting'], severity: 'mild' },
  { petId: 14, allergyName: 'Dust Mites', reactions: ['Sneezing', 'Watery eyes', 'Itching'], severity: 'mild' },

  { petId: 15, allergyName: 'Lamb', reactions: ['Rash', 'Itching'], severity: 'mild' },
]

async function seed() {
  console.log('🌱 Seeding database...\n')

  const db = getDb()

  try {
    // Clear existing data
    console.log('Clearing existing data...')
    db.prepare('DELETE FROM medical_records').run()
    db.prepare('DELETE FROM pets').run()
    db.prepare('DELETE FROM sqlite_sequence').run()
    console.log('✅ Cleared existing data\n')

    // Insert pets
    console.log('Inserting pets...')
    const petStmt = db.prepare(`
      INSERT INTO pets (name, animal_type, owner_name, date_of_birth)
      VALUES (?, ?, ?, ?)
    `)

    for (const pet of pets) {
      petStmt.run(pet.name, pet.animal_type, pet.owner_name, pet.date_of_birth)
      console.log(`  ✅ Added ${pet.name} (${pet.animal_type})`)
    }
    console.log(`\n✅ Inserted ${pets.length} pets\n`)

    // Insert vaccine records
    console.log('Inserting vaccine records...')
    const vaccineStmt = db.prepare(`
      INSERT INTO medical_records (pet_id, record_type, data)
      VALUES (?, 'vaccine', ?)
    `)

    for (const vaccine of vaccines) {
      const data = JSON.stringify({
        vaccineName: vaccine.vaccineName,
        administeredDate: vaccine.administeredDate,
      })
      vaccineStmt.run(vaccine.petId, data)
      console.log(`  💉 Added ${vaccine.vaccineName} for pet #${vaccine.petId}`)
    }
    console.log(`\n✅ Inserted ${vaccines.length} vaccine records\n`)

    // Insert allergy records
    console.log('Inserting allergy records...')
    const allergyStmt = db.prepare(`
      INSERT INTO medical_records (pet_id, record_type, data)
      VALUES (?, 'allergy', ?)
    `)

    for (const allergy of allergies) {
      const data = JSON.stringify({
        allergyName: allergy.allergyName,
        reactions: allergy.reactions,
        severity: allergy.severity,
      })
      allergyStmt.run(allergy.petId, data)
      console.log(`  ⚠️  Added ${allergy.allergyName} (${allergy.severity}) for pet #${allergy.petId}`)
    }
    console.log(`\n✅ Inserted ${allergies.length} allergy records\n`)

    // Show summary
    const totalPets = db.prepare('SELECT COUNT(*) as count FROM pets').get() as { count: number }
    const totalVaccines = db.prepare("SELECT COUNT(*) as count FROM medical_records WHERE record_type = 'vaccine'").get() as { count: number }
    const totalAllergies = db.prepare("SELECT COUNT(*) as count FROM medical_records WHERE record_type = 'allergy'").get() as { count: number }

    console.log('📊 Database Summary:')
    console.log(`   🐾 Total Pets: ${totalPets.count}`)
    console.log(`   💉 Total Vaccines: ${totalVaccines.count}`)
    console.log(`   ⚠️  Total Allergies: ${totalAllergies.count}`)
    console.log('\n✅ Seeding complete!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()
