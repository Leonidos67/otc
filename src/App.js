import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Deals from './pages/Deals';
import CreateDeal from './pages/CreateDeal';
import DealView from './pages/DealView';
import PublicDealView from './pages/PublicDealView';
import AvailableDeals from './pages/AvailableDeals';
import Profile from './pages/Profile';
import SecurityPasscode from './pages/SecurityPasscode';
import Withdraw from './pages/Withdraw';
import Deposit from './pages/Deposit';
import Policy from './pages/Policy';
import Login from './pages/Login';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, guestMode, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  return (isAuthenticated || guestMode) ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={
        <Layout>
          <Login />
        </Layout>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Home />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deals" element={
        <ProtectedRoute>
          <Layout>
            <Deals />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deals/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateDeal />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deals/:dealId" element={
        <ProtectedRoute>
          <Layout>
            <DealView />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deals/available" element={
        <ProtectedRoute>
          <Layout>
            <AvailableDeals />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deal/:dealId" element={
        <Layout>
          <PublicDealView />
        </Layout>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/withdraw" element={
        <ProtectedRoute>
          <Layout>
            <Withdraw />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/security/passcode" element={
        <ProtectedRoute>
          <Layout>
            <SecurityPasscode />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deposit" element={
        <ProtectedRoute>
          <Layout>
            <Deposit />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/policy" element={<Policy />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;