/**
 * @fileoverview Application entry point.
 * Renders the root component and sets up strict mode.
 * @module main
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import './styles/globals.css';

// Ensure the root element exists and is accessible
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Add necessary ARIA attributes to root if needed, though typically standard React handles this
// Render app in StrictMode for additional development checks
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
