const Database = require('better-sqlite3');
const path = require('path');

// Use in-memory DB for tests, file DB for normal runs
const dbPath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, '..', 'data.sqlite');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    ownerId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(ownerId);
`);

// Seed two demo users for convenience (no auth flow required by this task)
const seedUser = db.prepare('INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)');
seedUser.run('user-a', 'usera@example.com');
seedUser.run('user-b', 'userb@example.com');

module.exports = db;
