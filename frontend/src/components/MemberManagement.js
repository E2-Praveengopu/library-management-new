import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import { memberApi } from '../services/api';
import '../styles/MemberManagement.css';

const PLACEHOLDER = 'https://placehold.co/56x76/eef2f7/888888?text=Book';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function initials(firstName, lastName) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

/* ── Member Loans Modal ── */
function MemberLoansModal({ member, onClose }) {
  const [loans, setLoans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('borrowed');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await memberApi.getMemberLoans(
          member.id,
          `?status=${activeTab}&limit=50`
        );
        if (data.success) setLoans(data.data.loans);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [member.id, activeTab]);

  return (
    <div className="ml-overlay" onClick={onClose}>
      <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ml-modal-header">
          <div className="ml-member-info">
            <div className="ml-avatar">
              {initials(member.firstName, member.lastName)}
            </div>
            <div>
              <h2 className="ml-modal-title">
                {member.firstName} {member.lastName}
              </h2>
              <p className="ml-modal-email">{member.email}</p>
            </div>
          </div>
          <button className="ml-close-btn" onClick={onClose}>&#10005;</button>
        </div>

        {/* Tabs */}
        <div className="ml-tabs">
          <button
            className={`ml-tab ${activeTab === 'borrowed' ? 'ml-tab-active' : ''}`}
            onClick={() => setActiveTab('borrowed')}
          >
            Active Loans
          </button>
          <button
            className={`ml-tab ${activeTab === 'returned' ? 'ml-tab-active' : ''}`}
            onClick={() => setActiveTab('returned')}
          >
            History
          </button>
        </div>

        {/* Body */}
        <div className="ml-body">
          {loading ? (
            <div className="ml-loading">Loading…</div>
          ) : loans.length === 0 ? (
            <div className="ml-empty">
              No {activeTab === 'borrowed' ? 'active loans' : 'borrowing history'} found.
            </div>
          ) : (
            <div className="ml-list">
              {loans.map((loan) => (
                <div key={loan.id} className={`ml-row ${loan.isOverdue ? 'ml-row-overdue' : ''}`}>
                  <img
                    src={loan.book?.coverImageUrl || PLACEHOLDER}
                    alt={loan.book?.title}
                    className="ml-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                  <div className="ml-book-info">
                    <div className="ml-book-title">{loan.book?.title}</div>
                    <div className="ml-book-author">by {loan.book?.author}</div>
                    {loan.book?.genre && (
                      <span className="ml-genre">{loan.book.genre}</span>
                    )}
                  </div>
                  <div className="ml-dates">
                    <div className="ml-date-pair">
                      <span className="ml-date-label">Borrowed</span>
                      <span className="ml-date-val">{formatDate(loan.createdAt)}</span>
                    </div>
                    <div className="ml-date-pair">
                      <span className={`ml-date-label ${loan.isOverdue ? 'label-red' : ''}`}>
                        {activeTab === 'returned' ? 'Returned' : 'Due'}
                      </span>
                      <span className={`ml-date-val ${loan.isOverdue ? 'val-red' : ''}`}>
                        {activeTab === 'returned'
                          ? formatDate(loan.returnDate)
                          : formatDate(loan.dueDate)}
                      </span>
                    </div>
                  </div>
                  {loan.isOverdue && (
                    <span className="ml-overdue-badge">Overdue</span>
                  )}
                  {activeTab === 'returned' && (
                    <span className="ml-returned-badge">Returned</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
function MemberManagement() {
  const [members, setMembers]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [toggling, setToggling]       = useState(null);
  const [refreshKey, setRefreshKey]   = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = '?limit=100';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      try {
        const data = await memberApi.getAll(query);
        if (data.success) {
          setMembers(data.data.members);
          setTotal(data.data.pagination.totalMembers);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, refreshKey]);

  const handleToggleStatus = async (member) => {
    const newStatus = !member.isActive;
    if (!window.confirm(
      `${newStatus ? 'Activate' : 'Deactivate'} account for ${member.firstName} ${member.lastName}?`
    )) return;

    setToggling(member.id);
    const data = await memberApi.toggleStatus(member.id, newStatus);
    if (data.success) setRefreshKey((k) => k + 1);
    setToggling(null);
  };

  return (
    <div className="members-page">
      <div className="members-page-header">
        <div className="members-header-left">
          <Link to="/dashboard" className="page-back-btn" title="Back to Dashboard"><FiChevronLeft size={22} /></Link>
          <div>
            <h1 className="members-page-title">Member Management</h1>
            <p className="members-page-subtitle">{total} registered members</p>
          </div>
        </div>
        <div className="members-search-wrap">
          <span className="members-search-icon">&#128269;</span>
          <input
            type="text"
            className="members-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="members-loading">Loading members…</div>
      ) : members.length === 0 ? (
        <div className="members-empty">
          <div className="members-empty-icon">&#128101;</div>
          <p>No members found.</p>
        </div>
      ) : (
        <div className="members-table-wrap">
          <table className="members-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className={!member.isActive ? 'row-inactive' : ''}>
                  <td>
                    <div className="member-cell">
                      <div className={`member-avatar ${!member.isActive ? 'avatar-inactive' : ''}`}>
                        {initials(member.firstName, member.lastName)}
                      </div>
                      <span className="member-full-name">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="member-email-cell">{member.email}</td>
                  <td>
                    <span className={`member-status-pill ${member.isActive ? 'pill-active' : 'pill-inactive'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="member-date-cell">{formatDate(member.createdAt)}</td>
                  <td>
                    <div className="member-actions">
                      <button
                        className="btn-view-loans"
                        onClick={() => setSelectedMember(member)}
                      >
                        View Loans
                      </button>
                      <button
                        className={`btn-toggle ${member.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                        disabled={toggling === member.id}
                        onClick={() => handleToggleStatus(member)}
                      >
                        {toggling === member.id
                          ? '…'
                          : member.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMember && (
        <MemberLoansModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

export default MemberManagement;
