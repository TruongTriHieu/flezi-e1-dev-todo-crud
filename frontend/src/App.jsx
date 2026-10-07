import React, { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import TaskList from './TaskList.jsx';
import AddTaskForm from './AddTaskForm.jsx';
import FilterTabs from './FilterTabs.jsx';

export default function App() {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all | open | done
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, kind = 'success') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 2500);
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'all' ? undefined : filter;
      const data = await api.listTasks(statusParam);
      setTasks(data.items);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (loggedInUserId) loadTasks();
  }, [loggedInUserId, loadTasks]);

  async function handleLogin(userId) {
    try {
      const result = await api.devLogin(userId);
      api.saveToken(result.token);
      setLoggedInUserId(result.user.id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleCreate(title, description) {
    try {
      const created = await api.createTask(title, description);
      setTasks((prev) => [created, ...prev]);
      showToast('Task created');
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }

  async function handleToggle(task) {
    const nextStatus = task.status === 'open' ? 'done' : 'open';
    // optimistic update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    try {
      await api.updateTask(task.id, { status: nextStatus });
    } catch (err) {
      // rollback
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      showToast(err.message, 'error');
    }
  }

  async function handleEdit(task, patch) {
    const previous = task;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
    try {
      const updated = await api.updateTask(task.id, patch);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      showToast('Task updated');
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? previous : t)));
      showToast(err.message, 'error');
    }
  }

  async function handleDelete(task) {
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await api.deleteTask(task.id);
      showToast('Task deleted');
    } catch (err) {
      setTasks(previousTasks);
      showToast(err.message, 'error');
    }
  }

  if (!loggedInUserId) {
    return (
      <div className="login-screen">
        <h1>Task Manager</h1>
        <p>Pick a demo user to continue (simplified login for this assessment):</p>
        <div className="login-buttons">
          <button onClick={() => handleLogin('user-a')}>Login as User A</button>
          <button onClick={() => handleLogin('user-b')}>Login as User B</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>My Tasks</h1>
        <span className="current-user">Logged in as: {loggedInUserId}</span>
      </header>

      <AddTaskForm onCreate={handleCreate} />
      <FilterTabs value={filter} onChange={setFilter} />

      {loading && <p className="muted">Loading…</p>}

      {!loading && tasks.length === 0 && (
        <p className="empty-state">No tasks yet. Add one above to get started.</p>
      )}

      <TaskList tasks={tasks} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />

      {toast && <div className={`toast toast-${toast.kind}`}>{toast.message}</div>}
    </div>
  );
}
