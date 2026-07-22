import React, { useState, useEffect, useRef } from 'react';
import FormInput from '../common/FormInput';
import { uploadApi } from '../../services/api';
import '../../styles/BookFormModal.css';

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
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading]       = useState(false);
  const [uploadError, setUploadError]   = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        genre: book.genre || '',
        totalCopies: book.totalCopies ?? '',
        availableCopies: book.availableCopies ?? '',
        coverImageUrl: book.coverImageUrl || '',
      });
      setCoverPreview('');
    } else {
      setFormData(EMPTY_FORM);
      setCoverPreview('');
    }
    setError('');
    setUploadError('');
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setUploadError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5 MB.');
      return;
    }

    setCoverPreview(URL.createObjectURL(file));
    setUploadError('');
    setUploading(true);

    const result = await uploadApi.uploadCover(file);
    setUploading(false);

    if (result.success) {
      setFormData((prev) => ({ ...prev, coverImageUrl: result.url }));
    } else {
      setUploadError(result.message || 'Upload failed. Try again.');
      setCoverPreview('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const syntheticEvent = { target: { files: [file] } };
    handleFileChange(syntheticEvent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;
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

  const displayCover = coverPreview || formData.coverImageUrl;

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

          {/* Cover image upload */}
          <div className="cover-upload-row">
            {/* Drop zone / preview */}
            <div
              className={`cover-drop-zone ${uploading ? 'cover-drop-uploading' : ''}`}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {displayCover ? (
                <img src={displayCover} alt="Cover preview" className="cover-drop-preview-img" />
              ) : (
                <div className="cover-drop-placeholder">
                  <span className="cover-drop-icon">🖼️</span>
                  <span className="cover-drop-hint">Click or drag image here</span>
                  <span className="cover-drop-types">JPG · PNG · WebP · max 5 MB</span>
                </div>
              )}
              {uploading && (
                <div className="cover-drop-uploading-overlay">
                  <span>Uploading…</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {/* URL fallback */}
            <div className="cover-url-fallback">
              <label className="cover-url-label">Or paste an image URL</label>
              <input
                type="text"
                className="cover-url-input"
                placeholder="https://example.com/cover.jpg"
                value={formData.coverImageUrl}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, coverImageUrl: e.target.value }));
                  setCoverPreview('');
                }}
              />
              {uploadError && <p className="cover-upload-error">{uploadError}</p>}
              {uploading && <p className="cover-uploading-msg">Uploading image…</p>}
              {!uploading && coverPreview && formData.coverImageUrl && (
                <p className="cover-upload-success">✓ Image uploaded</p>
              )}
            </div>
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading || uploading} className="btn-save">
              {loading ? 'Saving…' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookFormModal;
