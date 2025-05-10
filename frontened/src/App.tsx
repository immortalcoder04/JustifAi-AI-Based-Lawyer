import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import DataSummarization from './components/DataSummarization';
import PredictiveAnalysis from './components/PredictiveAnalysis';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// ✅ Private route: only allow access if authenticated
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// ✅ Public route: only show to unauthenticated users
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AuthConsumerWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : null;
};


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 ease-in-out">
            <div className="relative z-10">
              {/* ✅ Only show Navbar when authenticated */}
              <AuthConsumerWrapper>
                <Navbar />
              </AuthConsumerWrapper>

              <main className="page-transition">
                <Routes>
                  {/* ✅ Default path redirects to login */}
                  <Route path="/" element={<Navigate to="/login" replace />} />

                  {/* ✅ Public routes (no auth) */}
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                  {/* ✅ Private routes (auth required) */}
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
                  <Route path="/summarization" element={<PrivateRoute><DataSummarization /></PrivateRoute>} />
                  <Route path="/prediction" element={<PrivateRoute><PredictiveAnalysis /></PrivateRoute>} />

                  {/* ✅ Fallback for unknown paths */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
