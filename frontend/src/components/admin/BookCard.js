import React from 'react';
import '../../styles/BookCard.css';

import placeholderImage from '../../assets/imagePlaceholer.png';

function BookCard({ book, onEdit, onDelete }) {
  const { title, author, isbn, genre, totalCopies, availableCopies, coverImageUrl } = book;
  const isAvailable = availableCopies > 0;

  return (
    <div className="book-card">
      <div className="book-cover">
        <img
          src={coverImageUrl || placeholderImage}
          alt={title}
          className="book-cover-img"
          onError={(e) => { e.target.src = placeholderImage; }}
        />
      </div>

      <div className="book-body">
        <h3 className="book-title">{title}</h3>
        <p className="book-author">by {author}</p>

        <div className="book-meta">
          {genre && <span className="book-genre-badge">{genre}</span>}
          <span className={`book-status-badge ${isAvailable ? 'status-available' : 'status-unavailable'}`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <p className="book-isbn">ISBN: {isbn}</p>

        <div className="book-copies">
          <div className="copies-bar-track">
            <div
              className="copies-bar-fill"
              style={{ width: `${totalCopies > 0 ? (availableCopies / totalCopies) * 100 : 0}%` }}
            />
          </div>
          <span className="copies-label">
            {availableCopies} / {totalCopies} copies available
          </span>
        </div>
      </div>

      <div className="book-actions">
        <button className="btn-edit" onClick={() => onEdit(book)}>Edit</button>
        <button className="btn-delete" onClick={() => onDelete(book.id)}>Delete</button>
      </div>
    </div>
  );
}

export default BookCard;
