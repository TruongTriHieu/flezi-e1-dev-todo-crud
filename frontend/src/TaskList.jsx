import React, { useState } from 'react';

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [error, setError] = useState('');

  async function saveEdit() {
    if (!title.trim()) {
      setError('Title cannot be blank');
      return;
    }
    setError('');
    try {
      await onEdit(task, { title: title.trim(), description });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEdit() {
    setTitle(task.title);
    setDescription(task.description || '');
    setError('');
    setEditing(false);
  }

  return (
    <li className={`task-row ${task.status === 'done' ? 'done' : ''}`}>
      <input
        type="checkbox"
        checked={task.status === 'done'}
        onChange={() => onToggle(task)}
        aria-label="Toggle complete"
      />

      {editing ? (
        <div className="task-edit">
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
          <button onClick={saveEdit}>Save</button>
          <button onClick={cancelEdit}>Cancel</button>
          {error && <span className="field-error">{error}</span>}
        </div>
      ) : (
        <div className="task-info">
          <span className="task-title">{task.title}</span>
          {task.description && <span className="task-description">{task.description}</span>}
        </div>
      )}

      {!editing && (
        <div className="task-actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={() => onDelete(task)}>Delete</button>
        </div>
      )}
    </li>
  );
}

export default function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) return null;

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
