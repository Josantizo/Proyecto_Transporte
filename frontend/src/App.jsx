import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import AdminDashboard from './Pages/AdminDashboard';
import Transport from './Pages/Transport';
import SolicitarTransporte from './Pages/SolicitarTransporte';
import TransportRequests from './Pages/TransportRequests';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <AdminDashboard />
                </main>
              </div>
            } 
          />

          {/* User Routes */}
          <Route 
            path="/dashboard" 
            element={
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Dashboard />
                </main>
              </div>
            } 
          />
          <Route 
            path="/transport" 
            element={
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Transport />
                </main>
              </div>
            } 
          />
          <Route 
            path="/solicitar-transporte" 
            element={
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <SolicitarTransporte />
                </main>
              </div>
            } 
          />
          <Route 
            path="/mis-solicitudes" 
            element={
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <TransportRequests />
                </main>
              </div>
            } 
          />
          
          {/* Redirect any other route to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
