-- Migration untuk menambahkan Google OAuth support
-- Jalankan setelah schema.sql

-- Tambah kolom untuk Google OAuth
ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'local';
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Update constraint untuk password (boleh NULL untuk Google users)
-- Karena SQLite tidak support ALTER COLUMN, kita perlu recreate table

-- Backup data existing
CREATE TABLE users_backup AS SELECT * FROM users;

-- Drop table lama
DROP TABLE users;

-- Recreate dengan schema baru
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- Sekarang boleh NULL untuk Google users
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires DATETIME,
  reset_token TEXT,
  reset_token_expires DATETIME,
  google_id TEXT UNIQUE,
  provider TEXT DEFAULT 'local',
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Restore data
INSERT INTO users (id, username, email, password, email_verified, verification_token, verification_token_expires, reset_token, reset_token_expires, created_at, updated_at)
SELECT id, username, email, password, email_verified, verification_token, verification_token_expires, reset_token, reset_token_expires, created_at, updated_at
FROM users_backup;

-- Drop backup table
DROP TABLE users_backup;

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
