const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('taskapp_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return null;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.fields = body?.fields;
    throw error;
  }
  return body;
}

export const api = {
  devLogin: (userId) =>
    request('/dev-login', { method: 'POST', body: JSON.stringify({ userId }) }),
  listTasks: (status) => request(`/tasks${status ? `?status=${status}` : ''}`),
  createTask: (title, description) =>
    request('/tasks', { method: 'POST', body: JSON.stringify({ title, description }) }),
  updateTask: (id, patch) =>
    request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  saveToken: (token) => localStorage.setItem('taskapp_token', token),
  getToken,
};
