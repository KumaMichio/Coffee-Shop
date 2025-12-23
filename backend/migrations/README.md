# Database Migrations

This directory contains database migration files and seed data for the Coffee Shop application.

## Quick Start (Recommended)

**All-in-one setup:** Use the consolidated `database.sql` file in the root directory which includes:
- Database creation
- All table schemas
- Admin user creation
- Seed data for cafes (25 cafes in Hanoi)
- Seed data for promotions

**To run everything at once:**
```bash
psql -U postgres -f database.sql
```

This will:
1. Drop and recreate the `coffee_app` database
2. Create all tables (users, cafes, favorites, reviews, promotions)
3. Create default admin user (email: `admin@admin.com`, password: `admin123`)
4. Seed 25 cafes in Hanoi with real coordinates
5. Seed sample promotions for cafes

## How to Run Migrations

1. Make sure you have PostgreSQL installed and running
2. Connect to your database
3. Run the migration files using `psql`:

```bash
psql -U postgres -d coffee_app -f migration_file.sql
```

## Seed Data Files

### Consolidated File (Recommended)
- **`database.sql`** (in root directory) - Contains everything: schema + seed data

### Individual Seed Files (Legacy)
The following files are kept for reference but their content has been integrated into `database.sql`:

#### 1. Seed Cafes (`seed_cafes.sql`)
Populates the database with 25 popular coffee shops in Hanoi:
- **20 cafes** with Google provider
- **5 cafes** with Goong provider
- Real locations from Google Maps

**Note:** This content is now included in `database.sql`. To run separately:
```bash
psql -U postgres -d coffee_app -f backend/migrations/seed_cafes.sql
```

#### 2. Seed Promotions (`seed_promotions.sql`)
Creates sample promotions for cafes in the database:
- Percentage discounts (20% off)
- Fixed amount discounts (50,000 VND off)
- Free item promotions (Buy 2 Get 1 Free)
- Weekend specials (15% off)

**Prerequisites:**
- Admin user must exist (`admin@admin.com`)
- Cafes must exist in database

**Note:** This content is now included in `database.sql`. To run separately:
```bash
psql -U postgres -d coffee_app -f backend/migrations/seed_promotions.sql
```

## Migration Files

### Schema Migrations
- All schema definitions are included in `database.sql`:
  - Users table with avatar_url
  - Cafes table
  - Favorites table
  - Reviews table
  - Promotions table

## Recommended Order

**Option 1: Use consolidated file (Recommended)**
```bash
psql -U postgres -f database.sql
```

**Option 2: Run separately (Legacy)**
1. Run `database.sql` to create all tables
2. Run `seed_cafes.sql` to populate cafes (or use database.sql which already includes this)
3. Run `seed_promotions.sql` to create promotions (or use database.sql which already includes this)




