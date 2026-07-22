import React, { useState } from 'react';
import { getUser } from '../../utils/auth';
import { addReservation } from '../../utils/reservations';
import '../../styles/MemberBookDetailModal.css';

import placeholderImage from '../../assets/imagePlaceholer.png';

function BookDetailModal({ book, genreColor, onClose }) {
  const [reserveState, setReserveState] = useState('idle'); // idle | success | duplicate
  const { title, author, isbn, genre, totalCopies, availableCopies, coverImageUrl } = book;
  const isAvailable = availableCopies > 0;
  const borrowedCopies = totalCopies - availableCopies;
  const availabilityPct = totalCopies > 0 ? (availableCopies / totalCopies) * 100 : 0;

  const genreStyle = genreColor
    ? { background: genreColor.bg, color: genreColor.text, border: `1px solid ${genreColor.border}` }
    : {};

  const handleReserve = () => {
    const user = getUser();
    if (!user) return;
    const result = addReservation(book, user);
    setReserveState(result === 'duplicate' ? 'duplicate' : 'success');
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close-btn" onClick={onClose}>✕</button>

        <div className="detail-content">
          <div className="detail-cover-col">
            <img
              src={coverImageUrl || placeholderImage}
              alt={title}
              className="detail-cover-img"
              onError={(e) => { e.target.src = placeholderImage; }}
            />
          </div>

          <div className="detail-info-col">
            <h2 className="detail-title">{title}</h2>
            <p className="detail-author">by {author}</p>

            <div className="detail-badges">
              {genre && (
                <span className="detail-genre-badge" style={genreStyle}>{genre}</span>
              )}
              <span className={`detail-status-badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <div className="detail-isbn-row">
              <span className="detail-field-label">ISBN</span>
              <span className="detail-field-value">{isbn}</span>
            </div>

            <div className="detail-copies-section">
              <div className="detail-copies-stats">
                <div className="copies-stat">
                  <span className="copies-num">{availableCopies}</span>
                  <span className="copies-lbl">Available</span>
                </div>
                <div className="copies-sep" />
                <div className="copies-stat">
                  <span className="copies-num">{totalCopies}</span>
                  <span className="copies-lbl">Total</span>
                </div>
                <div className="copies-sep" />
                <div className="copies-stat">
                  <span className="copies-num">{borrowedCopies}</span>
                  <span className="copies-lbl">Borrowed</span>
                </div>
              </div>
              <div className="detail-bar-track">
                <div className="detail-bar-fill" style={{ width: `${availabilityPct}%` }} />
              </div>
              <p className="detail-bar-label">{availabilityPct.toFixed(0)}% of copies available</p>
            </div>

            {reserveState === 'success' && (
              <div className="reserve-success-msg">
                ✅ Reservation sent! The librarian has been notified and will issue this book to you.
              </div>
            )}

            {reserveState === 'duplicate' && (
              <div className="reserve-duplicate-msg">
                ℹ️ You already have a pending reservation for this book. The admin will process it soon.
              </div>
            )}

            {reserveState === 'idle' && (
              <button
                className={`btn-reserve-detail ${!isAvailable ? 'btn-reserve-detail-off' : ''}`}
                disabled={!isAvailable}
                onClick={handleReserve}
              >
                {isAvailable ? '📖 Reserve this Book' : 'No Copies Available'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailModal;
