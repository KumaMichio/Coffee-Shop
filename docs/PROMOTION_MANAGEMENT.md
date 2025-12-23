# Promotion Management Guide

## Overview
The promotion management system allows admins to create, view, edit, and delete promotions for cafes in the system. Promotions can be based on cafes that are stored in the database (from Google Maps API searches).

## Features

### Admin Dashboard - Promotions Tab
- **View All Promotions**: See a list of all promotions with details including:
  - Promotion title and description
  - Associated cafe name and address
  - Discount type and value
  - Start and end dates
  - Status (Active, Inactive, Upcoming, Expired)
  - Target radius
- **Create New Promotion**: Click "Create Promotion" button to add a new promotion
- **Edit Promotion**: Click "Edit" button on any promotion to modify it
- **Delete Promotion**: Click "Delete" button to remove a promotion
- **Search**: Search promotions by title, cafe name, or description

### Promotion Form
When creating or editing a promotion, you can set:
- **Cafe**: Select from existing cafes in the database (searchable)
- **Title**: Promotion title (e.g., "20% Off All Drinks")
- **Description**: Detailed description of the promotion
- **Discount Type**: 
  - Percentage (%)
  - Fixed Amount (VND)
  - Free Item
- **Discount Value**: The value based on the discount type
- **Start Date**: When the promotion begins
- **End Date**: When the promotion ends
- **Target Radius**: How far from the cafe the promotion should be shown (in meters)
- **Active Status**: Enable/disable the promotion

## Seed Data

To populate the database with sample promotions, run the seed script:

```bash
psql -U your_username -d coffee_app -f backend/migrations/seed_promotions.sql
```

This script will:
- Create promotions for the first 10 cafes in the database
- Create different types of promotions (percentage, fixed amount, free item)
- Set various date ranges and target radii
- Only create promotions if an admin user exists

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/promotions/nearby?lat={lat}&lng={lng}&radius={radius}` - Get promotions near a location
- `GET /api/promotions/cafe/:cafeId` - Get promotions for a specific cafe
- `GET /api/promotions/:id` - Get a specific promotion by ID

### Protected Endpoints (Admin Authentication Required)
- `GET /api/promotions?limit={limit}&offset={offset}` - Get all promotions (for admin)
- `POST /api/promotions` - Create a new promotion
- `PUT /api/promotions/:id` - Update a promotion
- `DELETE /api/promotions/:id` - Delete a promotion

## Usage Flow

1. **Admin logs in** → Redirected to `/admin`
2. **Navigate to Promotions tab** → See list of all promotions
3. **Create new promotion**:
   - Click "Create Promotion" button
   - Fill in the form with promotion details
   - Select a cafe from the dropdown (searchable)
   - Set discount type and value
   - Set start and end dates
   - Configure target radius
   - Click "Create Promotion"
4. **Edit existing promotion**:
   - Click "Edit" button on a promotion
   - Modify the form fields
   - Click "Update Promotion"
5. **Delete promotion**:
   - Click "Delete" button
   - Confirm deletion

## Notes

- Promotions are automatically filtered by date and active status when shown to users
- The target radius determines how far from the cafe users can see the promotion
- Only active promotions within their date range are shown in the nearby promotions API
- Admin can see all promotions regardless of status

