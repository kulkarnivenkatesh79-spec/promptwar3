/**
 * @fileoverview Main navigation bar for the application.
 * Fully accessible with keyboard support and responsive mobile menu.
 * @module components/organisms/Navbar
 */

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, LayoutDashboard, Calculator, TrendingUp, Lightbulb } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { SkipLink } from '../../atoms/SkipLink';
import styles from './Navbar.module.css';

/**
 * Main application navigation component.
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Handle scroll effect for glassmorphism with throttling/debouncing
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScrolled(window.scrollY > 10);
      }, 50);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Calculator', path: '/calculator', icon: <Calculator size={20} /> },
    { name: 'Progress', path: '/progress', icon: <TrendingUp size={20} /> },
    { name: 'Recommendations', path: '/recommendations', icon: <Lightbulb size={20} /> },
  ];

  return (
    <>
      <SkipLink targetId="main-content" />
      
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          {/* Logo */}
          <NavLink 
            to="/" 
            className={styles.logo}
            aria-label="EcoTrack Home"
          >
            <div className={styles.logoIcon}>
              <Leaf size={24} />
            </div>
            <span className={styles.logoText}>EcoTrack</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav} aria-label="Main Navigation">
            <ul className={styles.navList}>
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => 
                      `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Controls */}
          <div className={styles.controls}>
            <button
              onClick={toggleTheme}
              className={styles.iconButton}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className={`${styles.iconButton} ${styles.mobileToggle}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div 
        id="mobile-menu"
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className={styles.mobileMenuContent}>
          {isMobileMenuOpen && (
            <nav aria-label="Mobile Navigation">
              <ul className={styles.mobileNavList}>
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) => 
                        `${styles.mobileNavLink} ${isActive ? styles.mobileActive : ''}`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={location.pathname === link.path ? 'page' : undefined}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
