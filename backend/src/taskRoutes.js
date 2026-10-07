const express = require('express');
const repo = require('./taskRepository');

const router = express.Router();

function isBlank(str) {
  return typeof str !== 'string' || str.trim().length === 0;
}

/**
 * POST /tasks
 * Create a task owned by the authenticated user.
 */
router.post('/', (req, res) => {
  const { title, description } = req.body || {};

  if (isBlank(title)) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: { title: 'Title is required and cannot be blank' },
    });
  }

  const task = repo.createTask(req.userId, { title: title.trim(), description });
  return res.status(201).json(task);
});

/**
 * GET /tasks?status=open|done
 * List tasks owned by the authenticated user, optionally filtered by status.
 */
router.get('/', (req, res) => {
  const { status } = req.query;

  if (status && !repo.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: { status: `status must be one of: ${repo.VALID_STATUSES.join(', ')}` },
    });
  }

  const tasks = repo.listTasksByOwner(req.userId, status);
  return res.status(200).json({ items: tasks });
});

/**
 * PUT /tasks/:id
 * Update title/description/status. Only the owner may update.
 */
router.put('/:id', (req, res) => {
  const existing = repo.getTaskById(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (existing.ownerId !== req.userId) {
    return res.status(403).json({ error: 'You do not have access to this task' });
  }

  const { title, description, status } = req.body || {};

  if (title !== undefined && isBlank(title)) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: { title: 'Title cannot be blank' },
    });
  }
  if (status !== undefined && !repo.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: { status: `status must be one of: ${repo.VALID_STATUSES.join(', ')}` },
    });
  }

  const updated = repo.updateTask(req.params.id, {
    title: title !== undefined ? title.trim() : undefined,
    description,
    status,
  });
  return res.status(200).json(updated);
});

/**
 * DELETE /tasks/:id
 * Permanently delete a task. Only the owner may delete.
 */
router.delete('/:id', (req, res) => {
  const existing = repo.getTaskById(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (existing.ownerId !== req.userId) {
    return res.status(403).json({ error: 'You do not have access to this task' });
  }

  repo.deleteTask(req.params.id);
  return res.status(204).send();
});

module.exports = router;
