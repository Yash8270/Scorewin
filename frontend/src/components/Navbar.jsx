import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiLogOut, FiUser, FiAward, FiTarget, FiHeart, FiShield, FiHome } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isAdminView = location.pathname.startsWith('/admin');

  const navLinks = (user && !isAdminView) ? [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/scores', label: 'Scores', icon: <FiTarget /> },
    { to: '/charities', label: 'Charities', icon: <FiHeart /> },
    { to: '/draws', label: 'Draws', icon: <FiAward /> },
  ] : [];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Score<span className="logo-highlight">Win</span></span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {isAdmin && isAdminView && (
            <Link
              to="/dashboard"
              className="nav-link admin-link"
              onClick={() => setMobileOpen(false)}
            >
              <FiUser />
              <span>Switch to User View</span>
            </Link>
          )}

          {isAdmin && !isAdminView && (
            <Link
              to="/admin"
              className="nav-link admin-link"
              onClick={() => setMobileOpen(false)}
            >
              <FiShield />
              <span>Back to Admin Panel</span>
            </Link>
          )}

          {user ? (
            <div className="nav-user">
              <div className="nav-user-info">
                <FiUser />
                <span>{user.name}</span>
              </div>
              <button className="nav-logout" onClick={handleLogout}>
                <FiLogOut />
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>
    </nav>
  );
}
