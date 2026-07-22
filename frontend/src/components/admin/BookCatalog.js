import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import { bookApi } from '../../services/api';
import BookCard from './BookCard';
import BookFormModal from './BookFormModal';
import '../../styles/BookCatalog.css';

function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await bookApi.getAll(currentPage);
        if (data.success) {
          setBooks(data.data.books);
          setTotalPages(data.data.pagination.totalPages);
          setTotalBooks(data.data.pagination.totalBooks);
        } else {
          setError(data.message || 'Failed to load books.');
        }
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [currentPage, refreshKey]);

  const handleSave = async (formData, bookId) => {
    const data = bookId
      ? await bookApi.update(bookId, formData)
      : await bookApi.add(formData);

    if (data.success) {
      setShowModal(false);
      setEditingBook(null);
      if (!bookId) setCurrentPage(1);
      setRefreshKey((k) => k + 1);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? This cannot be undone.')) return;
    const data = await bookApi.remove(id);
    if (data.success) {
      setRefreshKey((k) => k + 1);
    } else {
      setError(data.message || 'Failed to delete book.');
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const openAdd = () => { setEditingBook(null); setShowModal(true); };
  const openEdit = (book) => { setEditingBook(book); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingBook(null); };

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="catalog-header-left">
          <Link to="/dashboard" className="page-back-btn" title="Back to Dashboard"><FiChevronLeft size={22} /></Link>
          <div>
            <h1 className="catalog-title">Book Catalog</h1>
            <p className="catalog-subtitle">
              {totalBooks} {totalBooks === 1 ? 'book' : 'books'} in the library
            </p>
          </div>
        </div>
        <button className="btn-add-book" onClick={openAdd}>+ Add Book</button>
      </div>

      {error && <div className="catalog-error">{error}</div>}

      {loading ? (
        <div className="catalog-loading">Loading books…</div>
      ) : books.length === 0 ? (
        <div className="catalog-empty">
          <p>No books yet.</p>
          <button className="btn-add-book" onClick={openAdd}>Add the first book</button>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ← Prev
          </button>

          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
            ) : (
              <button
                key={page}
                className={`page-num-btn ${currentPage === page ? 'page-num-active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {showModal && (
        <BookFormModal
          book={editingBook}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default BookCatalog;
