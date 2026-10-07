const { v4: uuid } = require('uuid');
const db = require('./db');

const VALID_STATUSES = ['open', 'done'];

function nowIso() {
  return new Date().toISOString();
}

function createTask(ownerId, { title, description }) {
  const id = uuid();
  const ts = nowIso();
  const stmt = db.prepare(`
    INSERT INTO tasks (id, ownerId, title, description, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, 'open', ?, ?)
  `);
  stmt.run(id, ownerId, title, description || null, ts, ts);
  return getTaskById(id);
}

function getTaskById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) || null;
}

function listTasksByOwner(ownerId, statusFilter) {
  if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
    return db
      .prepare('SELECT * FROM tasks WHERE ownerId = ? AND status = ? ORDER BY createdAt DESC')
      .all(ownerId, statusFilter);
  }
  return db
    .prepare('SELECT * FROM tasks WHERE ownerId = ? ORDER BY createdAt DESC')
    .all(ownerId);
}

function updateTask(id, { title, description, status }) {
  const existing = getTaskById(id);
  if (!existing) return null;

  const nextTitle = title !== undefined ? title : existing.title;
  const nextDescription = description !== undefined ? description : existing.description;
  const nextStatus = status !== undefined ? status : existing.status;
  const ts = nowIso();

  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?, updatedAt = ?
    WHERE id = ?
  `).run(nextTitle, nextDescription, nextStatus, ts, id);

  return getTaskById(id);
}

function deleteTask(id) {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = {
  VALID_STATUSES,
  createTask,
  getTaskById,
  listTasksByOwner,
  updateTask,
  deleteTask,
};
