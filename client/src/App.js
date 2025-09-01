import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Zelle from './components/Zelle';
import MobileDeposit from './components/MobileDeposit';
import BillPay from './components/BillPay';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/zelle" 
              element={
                <ProtectedRoute>
                  <Zelle />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mobile-deposit" 
              element={
                <ProtectedRoute>
                  <MobileDeposit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bill-pay" 
              element={
                <ProtectedRoute>
                  <BillPay />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
