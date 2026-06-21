export const getUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

export const isAdmin = () => {
  const user = getUser();
  return user !== null && user.role === 'admin';
};
