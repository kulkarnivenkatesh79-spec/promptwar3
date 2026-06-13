/**
 * @fileoverview Main Application component with routing and providers.
 * @module App
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CarbonProvider } from './context/CarbonContext';
import { Layout } from './components/templates/Layout';
import { Loader2 } from 'lucide-react';

// Lazy load pages for performance optimization (code splitting)
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Calculator = lazy(() => import('./pages/Calculator/Calculator'));
const Progress = lazy(() => import('./pages/Progress/Progress'));
const Recommendations = lazy(() => import('./pages/Recommendations/Recommendations'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    color: 'var(--color-primary)'
  }}>
    <Loader2 className="animate-spin" size={48} />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <CarbonProvider>
        <Router>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/recommendations" element={<Recommendations />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </CarbonProvider>
    </ThemeProvider>
  );
}

export default App;
