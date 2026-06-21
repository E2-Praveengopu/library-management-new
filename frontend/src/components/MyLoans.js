import React, { useState, useEffect } from 'react';
import { loanApi } from '../services/api';
import '../styles/MyLoans.css';

const PLACEHOLDER = 'https://placehold.co/64x88/eef2f7/888888?text=Book';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function LoanCard({ loan, showReturnDate }) {
  const { book, dueDate, createdAt, returnDate, isOverdue } = loan;
  return (
    <div className={`my-loan-card ${isOverdue ? 'loan-card-overdue' : ''}`}>
      <div className="loan-card-cover-wrap">
        <img
          src={book?.coverImageUrl || PLACEHOLDER}
          alt={book?.title}
          className="loan-card-cover"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
      </div>

      <div className="loan-card-body">
        <div className="loan-card-title-row">
          <h3 className="loan-card-title">{book?.title || 'Unknown Book'}</h3>
          {isOverdue && <span className="badge-overdue">Overdue</span>}
          {!isOverdue && !showReturnDate && <span className="badge-active">Active</span>}
          {showReturnDate && <span className="badge-returned">Returned</span>}
        </div>

        <p className="loan-card-author">by {book?.author || '—'}</p>

        {book?.genre && <span className="loan-card-genre">{book.genre}</span>}

        {isOverdue && (
          <p className="loan-overdue-msg">
            This book was due on {formatDate(dueDate)}. Please return it as soon as possible.
          </p>
        )}

        <div className="loan-card-dates">
          <div className="loan-date-item">
            <span className="loan-date-label">Borrowed On</span>
            <span className="loan-date-val">{formatDate(createdAt)}</span>
          </div>
          <div className="loan-date-sep" />
          <div className="loan-date-item">
            <span className={`loan-date-label ${isOverdue ? 'label-red' : ''}`}>Due Date</span>
            <span className={`loan-date-val ${isOverdue ? 'val-red' : ''}`}>
              {formatDate(dueDate)}
            </span>
          </div>
          {showReturnDate && (
            <>
              <div className="loan-date-sep" />
              <div className="loan-date-item">
                <span className="loan-date-label">Returned On</span>
                <span className="loan-date-val">{formatDate(returnDate)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MyLoans() {
  const [activeLoans, setActiveLoans] = useState([]);
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [activeRes, historyRes] = await Promise.all([
          loanApi.getMyLoans('?status=borrowed&limit=50'),
          loanApi.getMyLoans('?status=returned&limit=50'),
        ]);
        if (activeRes.success)  setActiveLoans(activeRes.data.loans);
        if (historyRes.success) setHistory(historyRes.data.loans);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="my-loans-page">
        <div className="my-loans-loading">Loading your loans…</div>
      </div>
    );
  }

  const overdueCount = activeLoans.filter((l) => l.isOverdue).length;

  return (
    <div className="my-loans-page">
      <div className="my-loans-header">
        <div>
          <h1 className="my-loans-title">My Loans</h1>
          <p className="my-loans-subtitle">
            {activeLoans.length} active
            {overdueCount > 0 && (
              <span className="subtitle-overdue-note"> · {overdueCount} overdue</span>
            )}
            {' '}· {history.length} returned
          </p>
        </div>
      </div>

      {/* Overdue banner */}
      {overdueCount > 0 && (
        <div className="overdue-banner">
          <span className="overdue-banner-icon">&#9888;</span>
          You have {overdueCount} overdue {overdueCount === 1 ? 'book' : 'books'}.
          Please return {overdueCount === 1 ? 'it' : 'them'} to the library as soon as possible.
        </div>
      )}

      {/* Active loans */}
      <section className="loans-section">
        <div className="loans-section-header">
          <h2 className="loans-section-title">Active Loans</h2>
          {activeLoans.length > 0 && (
            <span className="loans-section-count">{activeLoans.length}</span>
          )}
        </div>
        {activeLoans.length === 0 ? (
          <div className="loans-empty">
            <div className="loans-empty-icon">&#128218;</div>
            <p>You have no active loans.</p>
          </div>
        ) : (
          <div className="loans-list">
            {activeLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} showReturnDate={false} />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="loans-section">
        <div className="loans-section-header">
          <h2 className="loans-section-title">Borrowing History</h2>
          {history.length > 0 && (
            <span className="loans-section-count">{history.length}</span>
          )}
        </div>
        {history.length === 0 ? (
          <div className="loans-empty">
            <div className="loans-empty-icon">&#128203;</div>
            <p>No borrowing history yet.</p>
          </div>
        ) : (
          <div className="loans-list">
            {history.map((loan) => (
              <LoanCard key={loan.id} loan={loan} showReturnDate />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MyLoans;
