const BASE_URL = 'http://localhost:5001/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const request = (url, options = {}) =>
  fetch(`${BASE_URL}${url}`, { ...options, headers: authHeaders() }).then((r) =>
    r.json()
  );

export const bookApi = {
  getAll: (page = 1, limit = 4) =>
    request(`/books?page=${page}&limit=${limit}`),

  add: (data) =>
    request('/books', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id) =>
    request(`/books/${id}`, { method: 'DELETE' }),
};
