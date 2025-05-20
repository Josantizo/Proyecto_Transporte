import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/admin-dashboard" element={
        <PrivateRoute roleRequired="admin">
          <AdminDashboard />
        </PrivateRoute>
      } />

      <Route path="/usuario-dashboard" element={
        <PrivateRoute roleRequired="usuario">
          <UsuarioDashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
