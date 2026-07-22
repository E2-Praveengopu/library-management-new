import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import { bookApi } from '../../services/api';
import DiscoveryBookCard from './DiscoveryBookCard';
import BookDetailModal from './BookDetailModal';
import BookSkeleton from './BookSkeleton';
import '../../styles/BookDiscovery.css';

const GENRE_COLORS = [
  { bg: '#e8f4fd', text: '#1565c0', border: '#90caf9' },
  { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  { bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
  { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' },
  { bg: '#fce4ec', text: '#880e4f', border: '#f48fb1' },
  { bg: '#e0f7fa', text: '#00695c', border: '#80deea' },
  { bg: '#fffde7', text: '#f57f17', border: '#fff176' },
];

function BookDiscovery() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await bookApi.discover();
        if (data.success) setBooks(data.data.books);
      } catch {
        // show empty state on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const genres = useMemo(() => {
    const unique = [...new Set(books.map((b) => b.genre).filter(Boolean))].sort();
    return unique;
  }, [books]);

  const genreColorMap = useMemo(() => {
    const map = {};
    genres.forEach((g, i) => { map[g] = GENRE_COLORS[i % GENRE_COLORS.length]; });
    return map;
  }, [genres]);

  const filteredBooks = useMemo(() => {
    const q = search.toLowerCase();
    return books.filter((book) => {
      const matchSearch = !q
        || book.title.toLowerCase().includes(q)
        || book.author.toLowerCase().includes(q)
        || (book.isbn && book.isbn.includes(q));
      const matchGenre = !selectedGenre || book.genre === selectedGenre;
      const matchAvail = !availableOnly || book.availableCopies > 0;
      return matchSearch && matchGenre && matchAvail;
    });
  }, [books, search, selectedGenre, availableOnly]);

  const hasFilters = search || selectedGenre || availableOnly;

  const clearFilters = () => {
    setSearch('');
    setSelectedGenre('');
    setAvailableOnly(false);
  };

  return (
    <div className="discovery-page">
      {/* Hero */}
      <div className="discovery-hero">
        <Link to="/member-dashboard" className="discovery-back-btn" title="Back to Dashboard">
          <FiChevronLeft size={22} />
        </Link>
        <h1 className="discovery-hero-title">Discover Books</h1>
        <p className="discovery-hero-subtitle">Search and explore our entire library collection</p>
        <div className="discovery-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="discovery-search"
            placeholder="Search by title, author, or ISBN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="discovery-filter-bar">
        <div className="genre-chips-wrap">
          <button
            className={`genre-chip ${!selectedGenre ? 'genre-chip-all-active' : ''}`}
            onClick={() => setSelectedGenre('')}
          >
            All Genres
          </button>
          {genres.map((genre) => {
            const color = genreColorMap[genre];
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                className="genre-chip"
                style={isSelected
                  ? { background: color.text, color: '#fff', borderColor: color.text }
                  : { background: color.bg, color: color.text, borderColor: color.border }
                }
                onClick={() => setSelectedGenre(isSelected ? '' : genre)}
              >
                {genre}
              </button>
            );
          })}
        </div>

        <div className="discovery-right-controls">
          <label className="avail-toggle-label">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            Available only
          </label>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'view-mode-active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >⊞</button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'view-mode-active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >☰</button>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="discovery-results-bar">
        {!loading && (
          <>
            <span className="results-count">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
            </span>
            {hasFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="discovery-content">
        {loading ? (
          <BookSkeleton count={8} viewMode={viewMode} />
        ) : filteredBooks.length === 0 ? (
          <div className="discovery-empty">
            <div className="empty-illustration">📚</div>
            <h3 className="empty-title">No books found</h3>
            <p className="empty-subtitle">
              {hasFilters
                ? 'Try adjusting your search or filters'
                : 'No books are in the library yet'}
            </p>
            {hasFilters && (
              <button className="btn-clear-empty" onClick={clearFilters}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'discovery-grid' : 'discovery-list'}>
            {filteredBooks.map((book) => (
              <DiscoveryBookCard
                key={book.id}
                book={book}
                viewMode={viewMode}
                genreColor={book.genre ? genreColorMap[book.genre] : null}
                onSelect={() => setSelectedBook(book)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          genreColor={selectedBook.genre ? genreColorMap[selectedBook.genre] : null}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}

export default BookDiscovery;
