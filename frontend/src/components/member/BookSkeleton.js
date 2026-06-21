import React from 'react';
import '../../styles/BookSkeleton.css';

function SkeletonCard({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="skeleton-list-card">
        <div className="skeleton-box skeleton-list-img" />
        <div className="skeleton-list-body">
          <div className="skeleton-box skeleton-title" />
          <div className="skeleton-box skeleton-author" />
          <div className="skeleton-box skeleton-badge" />
        </div>
      </div>
    );
  }
  return (
    <div className="skeleton-grid-card">
      <div className="skeleton-box skeleton-cover" />
      <div className="skeleton-grid-body">
        <div className="skeleton-box skeleton-title" />
        <div className="skeleton-box skeleton-author" />
        <div className="skeleton-box skeleton-badge" />
      </div>
    </div>
  );
}

function BookSkeleton({ count = 8, viewMode = 'grid' }) {
  return (
    <div className={viewMode === 'grid' ? 'discovery-grid' : 'discovery-list'}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}

export default BookSkeleton;
