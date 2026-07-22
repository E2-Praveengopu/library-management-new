import React, { useState, useEffect } from 'react';
import { bookApi, memberApi, loanApi } from '../../services/api';
import '../../styles/IssueLoanModal.css';

function IssueLoanModal({ onSuccess, onClose }) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookId, setBookId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [booksRes, membersRes] = await Promise.all([
          bookApi.getAll(1, 100),
          memberApi.getAll('?limit=100'),
        ]);
        if (booksRes.success) setBooks(booksRes.data.books.filter((b) => b.availableCopies > 0));
        if (membersRes.success) setMembers(membersRes.data.members.filter((m) => m.isActive));
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookId || !memberId || !dueDate) {
      setError('All fields are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    const data = await loanApi.issue({
      bookId: parseInt(bookId, 10),
      memberId: parseInt(memberId, 10),
      dueDate,
    });
    if (data.success) {
      onSuccess();
    } else {
      setError(data.message || 'Failed to issue book.');
      setSubmitting(false);
    }
  };

  return (
    <div className="issue-overlay" onClick={onClose}>
      <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
        <div className="issue-modal-header">
          <h2 className="issue-modal-title">Issue Book to Member</h2>
          <button className="issue-modal-close" onClick={onClose}>&#10005;</button>
        </div>

        {loadingData ? (
          <div className="issue-loading">Loading books and members…</div>
        ) : (
          <form onSubmit={handleSubmit} className="issue-form">
            <div className="issue-field">
              <label className="issue-label">Book</label>
              {books.length === 0 ? (
                <p className="issue-none-msg">No books with available copies.</p>
              ) : (
                <select
                  className="issue-select"
                  value={bookId}
                  onChange={(e) => { setBookId(e.target.value); setError(''); }}
                  required
                >
                  <option value="">— Choose a book —</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — {b.author} ({b.availableCopies} available)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="issue-field">
              <label className="issue-label">Member</label>
              {members.length === 0 ? (
                <p className="issue-none-msg">No active members found.</p>
              ) : (
                <select
                  className="issue-select"
                  value={memberId}
                  onChange={(e) => { setMemberId(e.target.value); setError(''); }}
                  required
                >
                  <option value="">— Choose a member —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} — {m.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="issue-field">
              <label className="issue-label">Due Date</label>
              <input
                type="date"
                className="issue-date-input"
                value={dueDate}
                min={minDate}
                onChange={(e) => { setDueDate(e.target.value); setError(''); }}
                required
              />
            </div>

            {error && <div className="issue-error">{error}</div>}

            <div className="issue-footer">
              <button type="button" className="issue-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="issue-btn-submit"
                disabled={submitting || books.length === 0 || members.length === 0}
              >
                {submitting ? 'Issuing…' : 'Issue Book'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default IssueLoanModal;
