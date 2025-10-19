import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'

const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'novellia-pets.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    // Create database connection
    db = new Database(DB_PATH)

    // Enable foreign keys
    db.pragma('foreign_keys = ON')

    // Run migrations
    initializeDatabase(db)
  }

  return db
}

function initializeDatabase(database: Database.Database) {
  // Check if tables exist
  const tables = database.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='pets'"
  ).get()

  if (!tables) {
    // Run initial migration
    const migrationPath = join(process.cwd(), 'lib', 'db', 'migrations', '001_initial.sql')
    const migration = readFileSync(migrationPath, 'utf-8')
    database.exec(migration)
    console.log('✅ Database initialized successfully')
  }
}

// Graceful shutdown
export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('exit', closeDb)
  process.on('SIGINT', () => {
    closeDb()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    closeDb()
    process.exit(0)
  })
}
