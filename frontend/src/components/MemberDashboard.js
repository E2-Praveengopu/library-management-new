import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { getUser } from '../utils/auth';
import '../styles/MemberDashboard.css';

const PLACEHOLDER = 'https://placehold.co/64x88/eef2f7/888888?text=Book';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function MemberDashboard() {
  const [currentLoans, setCurrentLoans] = useState([]);
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await dashboardApi.getMember();
        if (data.success) {
          setCurrentLoans(data.data.currentLoans);
          setHistory(data.data.borrowingHistory);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const overdueCount = currentLoans.filter((l) => l.isOverdue).length;

  return (
    <div className="member-dash-page">

      {/* Welcome header */}
      <div className="member-dash-header">
        <div>
          <h1 className="member-dash-title">
            Welcome back!
          </h1>
          <p className="member-dash-email-line">{user?.email}</p>
          <p className="member-dash-sub">
            {loading ? '…' : (
              <>
                {currentLoans.length} active loan{currentLoans.length !== 1 ? 's' : ''}
                {overdueCount > 0 && (
                  <span className="sub-overdue"> · {overdueCount} overdue</span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="dash-header-actions">
          <Link to="/my-loans" className="dash-my-loans-btn">View All Loans</Link>
          <button className="dash-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Overdue warning */}
      {!loading && overdueCount > 0 && (
        <div className="member-dash-overdue-banner">
          <span>⚠️</span>
          You have {overdueCount} overdue book{overdueCount !== 1 ? 's' : ''}.
          Please return {overdueCount === 1 ? 'it' : 'them'} to the library as soon as possible.
        </div>
      )}

      {/* Discover CTA card */}
      <Link to="/discover" className="discover-cta">
        <div className="discover-cta-left">
          <span className="discover-cta-icon">📖</span>
          <div>
            <div className="discover-cta-title">Discover Books</div>
            <div className="discover-cta-sub">Browse, search, and explore our full library collection</div>
          </div>
        </div>
        <span className="discover-cta-arrow">&#8594;</span>
      </Link>

      {/* Currently borrowed */}
      <section className="member-dash-section">
        <div className="member-dash-sec-header">
          <h2 className="member-dash-sec-title">Currently Borrowed</h2>
          {!loading && currentLoans.length > 0 && (
            <span className="sec-count">{currentLoans.length}</span>
          )}
        </div>

        {loading ? (
          <div className="member-dash-loading">Loading…</div>
        ) : currentLoans.length === 0 ? (
          <div className="member-dash-empty">
            <div className="mdash-empty-icon">📚</div>
            <p>You have no active loans right now.</p>
            <Link to="/discover" className="mdash-discover-link">Discover Books</Link>
          </div>
        ) : (
          <div className="dash-loan-cards">
            {currentLoans.map((loan) => (
              <div key={loan.id} className={`dash-loan-card ${loan.isOverdue ? 'dlc-overdue' : ''}`}>
                <div className="dlc-cover-wrap">
                  <img
                    src={loan.book?.coverImageUrl || PLACEHOLDER}
                    alt={loan.book?.title}
                    className="dlc-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                  {loan.isOverdue && <div className="dlc-overdue-ribbon">Overdue</div>}
                </div>
                <div className="dlc-info">
                  <div className="dlc-title">{loan.book?.title}</div>
                  <div className="dlc-author">by {loan.book?.author}</div>
                  {loan.book?.genre && <span className="dlc-genre">{loan.book.genre}</span>}
                  <div className={`dlc-due ${loan.isOverdue ? 'dlc-due-red' : ''}`}>
                    Due: {formatDate(loan.dueDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Borrowing history */}
      <section className="member-dash-section">
        <div className="member-dash-sec-header">
          <h2 className="member-dash-sec-title">Borrowing History</h2>
          {!loading && history.length > 0 && (
            <span className="sec-count sec-count-grey">{history.length}</span>
          )}
        </div>

        {!loading && history.length === 0 ? (
          <div className="member-dash-empty">
            <div className="mdash-empty-icon">📋</div>
            <p>No borrowing history yet.</p>
          </div>
        ) : (
          <div className="dash-history-list">
            {history.map((loan) => (
              <div key={loan.id} className="dash-history-row">
                <img
                  src={loan.book?.coverImageUrl || PLACEHOLDER}
                  alt={loan.book?.title}
                  className="dhr-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div className="dhr-info">
                  <div className="dhr-title">{loan.book?.title}</div>
                  <div className="dhr-author">by {loan.book?.author}</div>
                  {loan.book?.genre && <span className="dhr-genre">{loan.book.genre}</span>}
                </div>
                <div className="dhr-dates">
                  <div className="dhr-date-row">
                    <span className="dhr-label">Borrowed</span>
                    <span className="dhr-val">{formatDate(loan.createdAt)}</span>
                  </div>
                  <div className="dhr-date-row">
                    <span className="dhr-label">Returned</span>
                    <span className="dhr-val">{formatDate(loan.returnDate)}</span>
                  </div>
                </div>
                <span className="dhr-returned-badge">Returned</span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default MemberDashboard;
