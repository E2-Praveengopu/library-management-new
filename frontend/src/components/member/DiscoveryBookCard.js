import React from 'react';
import '../../styles/DiscoveryBookCard.css';

import placeholderImage from '../../assets/imagePlaceholer.png';

function DiscoveryBookCard({ book, viewMode, genreColor, onSelect }) {
  const { title, author, isbn, genre, availableCopies, totalCopies, coverImageUrl } = book;
  const isAvailable = availableCopies > 0;

  const genreStyle = genreColor
    ? { background: genreColor.bg, color: genreColor.text, borderColor: genreColor.border }
    : {};

  if (viewMode === 'list') {
    return (
      <div className="discovery-list-card" onClick={onSelect}>
        <div className="list-card-cover">
          <img
            src={coverImageUrl || placeholderImage}
            alt={title}
            className="list-card-img"
            onError={(e) => { e.target.src = placeholderImage; }}
          />
        </div>

        <div className="list-card-body">
          <div className="list-card-top">
            <h3 className="list-card-title">{title}</h3>
            <span className={`disc-status-badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
              {isAvailable ? `${availableCopies} Available` : 'Unavailable'}
            </span>
          </div>
          <p className="list-card-author">by {author}</p>
          <div className="list-card-meta">
            {genre && (
              <span className="disc-genre-badge" style={genreStyle}>{genre}</span>
            )}
            <span className="list-card-isbn">ISBN: {isbn}</span>
          </div>
          <p className="list-card-copies">{availableCopies} of {totalCopies} copies available</p>
        </div>

        <div className="list-card-action">
          <button
            className={`btn-list-reserve ${!isAvailable ? 'btn-reserve-off' : ''}`}
            disabled={!isAvailable}
          >
            {isAvailable ? 'View & Reserve' : 'Unavailable'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discovery-grid-card" onClick={onSelect}>
      <div className="grid-card-cover">
        <img
          src={coverImageUrl || placeholderImage}
          alt={title}
          className="grid-card-img"
          onError={(e) => { e.target.src = placeholderImage; }}
        />
        <div className="grid-card-overlay">
          <button className="btn-view-details">View Details</button>
        </div>
        {!isAvailable && <div className="grid-card-out-badge">Out of Stock</div>}
      </div>

      <div className="grid-card-body">
        <h3 className="grid-card-title">{title}</h3>
        <p className="grid-card-author">by {author}</p>
        <div className="grid-card-footer">
          {genre && (
            <span className="disc-genre-badge" style={genreStyle}>{genre}</span>
          )}
          <span className={`disc-status-badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
            {isAvailable ? `${availableCopies} left` : 'Out'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DiscoveryBookCard;
