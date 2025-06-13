-- Migration yang aman untuk menambahkan Google OAuth support
-- Versi yang tidak menggunakan ALTER TABLE dengan UNIQUE constraint

-- Step 1: Backup data existing
CREATE TABLE users_backup AS SELECT * FROM users;

-- Step 2: Drop table lama
DROP TABLE users;

-- Step 3: Recreate dengan schema lengkap termasuk Google OAuth
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

-- Step 4: Restore data dengan kolom baru
INSERT INTO users (
  id, username, email, password, email_verified, 
  verification_token, verification_token_expires, 
  reset_token, reset_token_expires, 
  provider, created_at, updated_at
)
SELECT 
  id, username, email, password, email_verified,
  verification_token, verification_token_expires,
  reset_token, reset_token_expires,
  'local' as provider, created_at, updated_at
FROM users_backup;

-- Step 5: Drop backup table
DROP TABLE users_backup;

-- Step 6: Create indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
