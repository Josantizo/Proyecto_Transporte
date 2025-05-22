import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="main-nav">
            <div className="nav-content">
                <div className="nav-links">
                    <Link 
                        to="/dashboard" 
                        className={location.pathname === '/dashboard' ? 'active' : ''}
                    >
                        Actualización de Usuario
                    </Link>
                    <Link 
                        to="/transport" 
                        className={location.pathname === '/transport' ? 'active' : ''}
                    >
                        Solicitar Transporte
                    </Link>
                </div>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default Navigation; 