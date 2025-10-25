-- ============================================================================
-- Helpdesk Database Schema (SQLite)
-- Improved version with constraints, consistency checks, and indexes
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent' CHECK(role IN ('admin', 'agent', 'user')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- TICKETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
  reporter_id INTEGER,
  assignee_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  author_id INTEGER,
  text TEXT NOT NULL CHECK(length(trim(text)) > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================================
-- OPTIONAL: ATTACHMENTS TABLE (for future expansion)
-- ============================================================================
-- CREATE TABLE IF NOT EXISTS attachments (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   ticket_id INTEGER NOT NULL,
--   file_name TEXT NOT NULL,
--   file_path TEXT NOT NULL,
--   uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
--   FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
-- );

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tickets_reporter ON tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_comments_ticket ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- TRIGGER TO AUTO-UPDATE UPDATED_AT FIELD
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS trg_tickets_updated_at
AFTER UPDATE ON tickets
FOR EACH ROW
BEGIN
  UPDATE tickets
  SET updated_at = datetime('now')
  WHERE id = OLD.id;
END;
