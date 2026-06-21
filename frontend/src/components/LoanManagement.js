import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import { loanApi } from '../services/api';
import IssueLoanModal from './IssueLoanModal';
import '../styles/LoanManagement.css';

const TABS = [
  { key: 'all',      label: 'All Loans' },
  { key: 'borrowed', label: 'Active' },
  { key: 'returned', label: 'Returned' },
  { key: 'overdue',  label: 'Overdue' },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function LoanManagement() {
  const [loans, setLoans]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [returning, setReturning] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = '?limit=100';
      if (activeTab === 'borrowed') query += '&status=borrowed';
      if (activeTab === 'returned') query += '&status=returned';
      if (activeTab === 'overdue')  query += '&overdue=true';
      try {
        const data = await loanApi.getAll(query);
        if (data.success) {
          setLoans(data.data.loans);
          setTotal(data.data.pagination.totalLoans);
        }
      } catch {
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, refreshKey]);

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this book as returned?')) return;
    setReturning(id);
    try {
      const data = await loanApi.returnBook(id);
      if (data.success) setRefreshKey((k) => k + 1);
    } finally {
      setReturning(null);
    }
  };

  const handleIssued = () => {
    setShowModal(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="loan-page">
      {/* Page header */}
      <div className="loan-page-header">
        <div className="loan-header-left">
          <Link to="/dashboard" className="loan-back-btn" title="Back to Dashboard"><FiChevronLeft size={22} /></Link>
          <div>
            <h1 className="loan-page-title">Loan Management</h1>
            <p className="loan-page-subtitle">{total} total loan records</p>
          </div>
        </div>
        <button className="btn-issue-loan" onClick={() => setShowModal(true)}>
          + Issue Book
        </button>
      </div>

      {/* Tabs */}
      <div className="loan-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`loan-tab ${activeTab === tab.key ? 'loan-tab-active' : ''} ${tab.key === 'overdue' ? 'loan-tab-overdue' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loan-loading">Loading loans…</div>
      ) : loans.length === 0 ? (
        <div className="loan-empty">
          <div className="loan-empty-icon">&#128218;</div>
          <p>No loans found for this filter.</p>
        </div>
      ) : (
        <div className="loan-table-wrap">
          <table className="loan-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Issued On</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className={loan.isOverdue ? 'loan-row-overdue' : ''}>
                  <td>
                    <div className="loan-book-title">{loan.book?.title || '—'}</div>
                    <div className="loan-book-isbn">{loan.book?.isbn || ''}</div>
                  </td>
                  <td>
                    <div className="loan-member-name">
                      {loan.member?.firstName} {loan.member?.lastName}
                    </div>
                    <div className="loan-member-email">{loan.member?.email}</div>
                  </td>
                  <td className="loan-date-cell">{formatDate(loan.createdAt)}</td>
                  <td className="loan-date-cell">
                    <span className={loan.isOverdue ? 'due-date-overdue' : ''}>
                      {formatDate(loan.dueDate)}
                    </span>
                    {loan.isOverdue && (
                      <span className="overdue-pill">Overdue</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${loan.status === 'borrowed' ? 'pill-borrowed' : 'pill-returned'}`}>
                      {loan.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                    </span>
                    {loan.returnDate && (
                      <div className="loan-return-date">
                        Returned {formatDate(loan.returnDate)}
                      </div>
                    )}
                  </td>
                  <td>
                    {loan.status === 'borrowed' && (
                      <button
                        className="btn-mark-return"
                        disabled={returning === loan.id}
                        onClick={() => handleReturn(loan.id)}
                      >
                        {returning === loan.id ? '…' : 'Mark Returned'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <IssueLoanModal onSuccess={handleIssued} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default LoanManagement;
