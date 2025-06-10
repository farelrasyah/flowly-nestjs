-- Schema untuk database D1 (SQLite)
-- File ini untuk referensi schema database

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
