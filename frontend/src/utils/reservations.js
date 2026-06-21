const STORAGE_KEY = 'lib_reservations';

export const getReservations = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const getPendingReservations = () =>
  getReservations().filter((r) => r.status === 'pending');

export const addReservation = (book, user) => {
  const all = getReservations();
  const alreadyPending = all.some(
    (r) => r.bookId === book.id && r.memberId === user.id && r.status === 'pending'
  );
  if (alreadyPending) return 'duplicate';

  all.push({
    id: Date.now(),
    bookId: book.id,
    bookTitle: book.title,
    bookAuthor: book.author,
    coverImageUrl: book.coverImageUrl || null,
    memberId: user.id,
    memberEmail: user.email,
    reservedAt: new Date().toISOString(),
    status: 'pending',
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('reservations-updated'));
  return 'ok';
};

export const dismissReservation = (id) => {
  const all = getReservations().map((r) =>
    r.id === id ? { ...r, status: 'dismissed' } : r
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('reservations-updated'));
};
