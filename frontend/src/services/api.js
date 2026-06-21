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

  discover: () =>
    request('/books?page=1&limit=100'),

  add: (data) =>
    request('/books', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id) =>
    request(`/books/${id}`, { method: 'DELETE' }),
};

export const loanApi = {
  issue: (data) =>
    request('/loans/issue', { method: 'POST', body: JSON.stringify(data) }),

  returnBook: (id) =>
    request(`/loans/${id}/return`, { method: 'PATCH' }),

  getAll: (query = '') =>
    request(`/loans${query}`),

  getMyLoans: (query = '') =>
    request(`/loans/my-loans${query}`),
};

export const memberApi = {
  getAll: (query = '') => request(`/members${query}`),
  getMemberLoans: (id, query = '') => request(`/members/${id}/loans${query}`),
  toggleStatus: (id, isActive) =>
    request(`/members/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
};

export const dashboardApi = {
  getAdmin: () => request('/dashboard/admin'),
  getMember: () => request('/dashboard/member'),
};

export const uploadApi = {
  uploadCover: (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return fetch(`${BASE_URL}/upload/cover`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    }).then((r) => r.json());
  },
};
