# Database Migrations

## Migration: Add avatar_url to users table

Để thêm hỗ trợ avatar cho users, chạy migration sau:

```sql
-- Chạy trong PostgreSQL
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

Hoặc chạy file migration:
```bash
psql -U postgres -d coffee_app -f add_avatar_url.sql
```




