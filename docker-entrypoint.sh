#!/bin/sh
set -e

# Path to database file
DB_PATH="${DATABASE_PATH:-/app/data/novellia-pets.db}"
SEED_DB="${SEED_DB:-true}"

# Check if we should seed
if [ "$SEED_DB" = "true" ]; then
  if [ ! -f "$DB_PATH" ]; then
    echo "📦 Database not found, seeding with sample data..."
    npm run seed
    echo "✅ Database seeded successfully with 15 pets!"
  else
    echo "ℹ️  Database already exists, skipping seed"
  fi
else
  echo "ℹ️  DB seeding disabled (SEED_DB=false)"
fi

# Start the application
echo "🚀 Starting Novellia Pets..."
exec npm start
