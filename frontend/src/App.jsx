import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Transport from './Pages/Transport';
import SolicitarTransporte from './Pages/SolicitarTransporte';
import Navigation from './components/Navigation';
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
                <>
                  <Navigation />
                  <Dashboard />
                </>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transport" 
            element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <Transport />
                </>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/solicitar-transporte" 
            element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <SolicitarTransporte />
                </>
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
