import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { getUser } from '../utils/auth';
import { getPendingReservations } from '../utils/reservations';
import '../styles/Navbar.css';

function Navbar() {
  const user = getUser();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const sync = () => setNotifCount(getPendingReservations().length);
    sync();
    const timer = setInterval(sync, 3000);
    window.addEventListener('reservations-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener('reservations-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">&#128218;</span>
        <span className="navbar-brand-text">Library</span>
      </div>

      <div className="navbar-links">
        {user.role === 'admin' ? (
          <>
            <NavLink exact to="/dashboard" className="nav-link" activeClassName="nav-link-active">
              Dashboard
            </NavLink>
            <NavLink exact to="/" className="nav-link" activeClassName="nav-link-active">
              Book Catalog
            </NavLink>
            <NavLink to="/loans" className="nav-link" activeClassName="nav-link-active">
              Loans
            </NavLink>
            <NavLink to="/members" className="nav-link" activeClassName="nav-link-active">
              Members
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/member-dashboard" className="nav-link" activeClassName="nav-link-active">
              Dashboard
            </NavLink>
            <NavLink to="/discover" className="nav-link" activeClassName="nav-link-active">
              Discover Books
            </NavLink>
            <NavLink to="/my-loans" className="nav-link" activeClassName="nav-link-active">
              My Loans
            </NavLink>
          </>
        )}
      </div>

      <div className="navbar-right">
        {user.role === 'admin' && (
          <NavLink
            to="/dashboard"
            className={`notif-bell-wrap ${notifCount > 0 ? 'notif-bell-active' : 'notif-bell-idle'}`}
            title={notifCount > 0 ? `${notifCount} pending reservation${notifCount > 1 ? 's' : ''}` : 'No pending reservations'}
          >
            <FiBell size={18} />
            {notifCount > 0 && (
              <span className="notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>
            )}
          </NavLink>
        )}
        <span className="navbar-role-badge">{user.role}</span>
        <span className="navbar-email">{user.email}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
