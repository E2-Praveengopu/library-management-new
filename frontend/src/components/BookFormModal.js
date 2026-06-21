import React, { useState, useEffect } from 'react';
import FormInput from './common/FormInput';
import '../styles/BookFormModal.css';

const EMPTY_FORM = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  totalCopies: '',
  availableCopies: '',
  coverImageUrl: '',
};

function BookFormModal({ book, onSave, onClose }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(
      book
        ? {
            title: book.title || '',
            author: book.author || '',
            isbn: book.isbn || '',
            genre: book.genre || '',
            totalCopies: book.totalCopies ?? '',
            availableCopies: book.availableCopies ?? '',
            coverImageUrl: book.coverImageUrl || '',
          }
        : EMPTY_FORM
    );
    setError('');
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      totalCopies: parseInt(formData.totalCopies, 10),
      availableCopies:
        formData.availableCopies !== ''
          ? parseInt(formData.availableCopies, 10)
          : parseInt(formData.totalCopies, 10),
    };

    const result = await onSave(payload, book ? book.id : null);
    if (!result.success) {
      setError(result.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-heading">{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-row">
            <FormInput
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Book title"
              required
              wrapperClassName="form-field-group"
            />
            <FormInput
              label="Author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Author name"
              required
              wrapperClassName="form-field-group"
            />
          </div>

          <div className="modal-row">
            <FormInput
              label="ISBN"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="e.g. 978-3-16-148410-0"
              required
              wrapperClassName="form-field-group"
            />
            <FormInput
              label="Genre / Category"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="e.g. Fiction"
              wrapperClassName="form-field-group"
            />
          </div>

          <div className="modal-row">
            <FormInput
              label="Total Copies"
              type="number"
              name="totalCopies"
              value={formData.totalCopies}
              onChange={handleChange}
              placeholder="e.g. 5"
              required
              wrapperClassName="form-field-group"
            />
            <FormInput
              label="Available Copies"
              type="number"
              name="availableCopies"
              value={formData.availableCopies}
              onChange={handleChange}
              placeholder="Defaults to total"
              wrapperClassName="form-field-group"
            />
          </div>

          <FormInput
            label="Cover Image URL (optional)"
            name="coverImageUrl"
            value={formData.coverImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/cover.jpg"
          />

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-save">
              {loading ? 'Saving…' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookFormModal;
