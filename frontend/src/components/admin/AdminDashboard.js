import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiBell } from 'react-icons/fi';
import { dashboardApi } from '../../services/api';
import { getUser } from '../../utils/auth';
import { getPendingReservations, dismissReservation } from '../../utils/reservations';
import '../../styles/AdminDashboard.css';



import placeholderImage from '../../assets/imagePlaceholer.png';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AdminDashboard() {
  const [stats, setStats]             = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [reservations, setReservations] = useState([]);
  const user = getUser();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await dashboardApi.getAdmin();
        if (data.success) {
          setStats(data.data.stats);
          setRecentBooks(data.data.recentlyAddedBooks);
          setRecentLoans(data.data.recentlyBorrowedBooks);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const sync = () => setReservations(getPendingReservations());
    sync();
    window.addEventListener('reservations-updated', sync);
    return () => window.removeEventListener('reservations-updated', sync);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const statCards = [
    { label: 'Total Books',   value: stats?.totalBooks   ?? 0, icon: '📚', cls: 'sc-red'    },
    { label: 'Total Members', value: stats?.totalMembers ?? 0, icon: '👥', cls: 'sc-green'  },
    { label: 'Active Loans',  value: stats?.activeLoans  ?? 0, icon: '📖', cls: 'sc-orange' },
    { label: 'Overdue Loans', value: stats?.overdueLoans ?? 0, icon: '⚠️', cls: 'sc-danger'  },
  ];

  if (loading) {
    return <div className="admin-dash-loading">Loading dashboard…</div>;
  }

  return (
    <div className="admin-dash-page">

      <div className="admin-dash-header">
        <div className="admin-dash-header-left">
          <button className="admin-dash-back-btn" onClick={handleLogout} title="Logout">
            <FiChevronLeft size={22} />
          </button>
          <div>
            <h1 className="admin-dash-title">Admin Dashboard</h1>
            <p className="admin-dash-date">{today}</p>
          </div>
        </div>
        <div className="admin-dash-quick-links">
          <Link to="/members" className="ql-btn ql-primary">Manage Members</Link>
          <Link to="/loans"   className="ql-btn ql-outline">View Loans</Link>
          <Link to="/"        className="ql-btn ql-outline">Book Catalog</Link>
          <button className="ql-btn ql-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {reservations.length > 0 && (
        <div className="res-banner">
          <div className="res-banner-header">
            <div className="res-banner-title-row">
              <FiBell size={18} className="res-bell-icon" />
              <span className="res-banner-title">Book Reservations</span>
              <span className="res-banner-count">{reservations.length} pending</span>
            </div>
            <p className="res-banner-sub">Members waiting for these books — issue them when ready</p>
          </div>
          <div className="res-list">
            {reservations.map((res) => (
              <div key={res.id} className="res-row">
                <div className="res-row-left">
                  <div className="res-book-title">{res.bookTitle}</div>
                  <div className="res-book-author">by {res.bookAuthor}</div>
                </div>
                <div className="res-row-mid">
                  <div className="res-member-email">{res.memberEmail}</div>
                  <div className="res-time">{timeAgo(res.reservedAt)}</div>
                </div>
                <div className="res-row-actions">
                  <Link to="/loans" className="btn-res-issue">Issue Book</Link>
                  <button className="btn-res-dismiss" onClick={() => dismissReservation(res.id)}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="stat-cards-row">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.cls}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-num">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Lower two-column panels */}
      <div className="dash-panels-grid">

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2 className="dash-panel-title">Recently Added Books</h2>
            <Link to="/" className="dash-panel-link">View All →</Link>
          </div>
          {recentBooks.length === 0 ? (
            <p className="dash-empty-msg">No books added yet.</p>
          ) : (
            <div className="recent-books-list">
              {recentBooks.map((book) => (
                <div key={book.id} className="rb-row">
                  <img
                    src={book.coverImageUrl || placeholderImage}
                    alt={book.title}
                    className="rb-cover"
                    onError={(e) => { e.target.src = placeholderImage; }}
                  />
                  <div className="rb-info">
                    <div className="rb-title">{book.title}</div>
                    <div className="rb-author">by {book.author}</div>
                    {book.genre && <span className="rb-genre">{book.genre}</span>}
                  </div>
                  <div className="rb-meta">
                    <span className="rb-copies">
                      {book.availableCopies}/{book.totalCopies} avail.
                    </span>
                    <span className="rb-date">{formatDate(book.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2 className="dash-panel-title">Recently Borrowed</h2>
            <Link to="/loans" className="dash-panel-link">View All →</Link>
          </div>
          {recentLoans.length === 0 ? (
            <p className="dash-empty-msg">No active loans.</p>
          ) : (
            <div className="recent-loans-list">
              {recentLoans.map((loan) => (
                <div key={loan.id} className={`rl-row ${loan.isOverdue ? 'rl-overdue' : ''}`}>
                  <div className="rl-info">
                    <div className="rl-book">{loan.book?.title}</div>
                    <div className="rl-member">
                      {loan.member?.firstName} {loan.member?.lastName}
                      <span className="rl-member-email"> · {loan.member?.email}</span>
                    </div>
                  </div>
                  <div className="rl-right">
                    <span className={`rl-due ${loan.isOverdue ? 'rl-due-red' : ''}`}>
                      Due {formatDate(loan.dueDate)}
                    </span>
                    {loan.isOverdue && <span className="rl-overdue-pill">Overdue</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
