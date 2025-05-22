import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Transport from './Pages/Transport';
import SolicitarTransporte from './Pages/SolicitarTransporte';
import TransportRequests from './Pages/TransportRequests';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transport" 
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Transport />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/solicitar-transporte" 
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <SolicitarTransporte />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mis-solicitudes" 
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <TransportRequests />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          {/* Redirigir cualquier otra ruta a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
