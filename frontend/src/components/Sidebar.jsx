import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const userRole = localStorage.getItem('rol');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rol');
        navigate('/login');
    };

    const userMenuItems = [
        {
            path: '/dashboard',
            label: 'Actualización de Usuario',
            icon: '👤'
        },
        {
            path: '/transport',
            label: 'Solicitar Transporte',
            icon: '🚐'
        },
        {
            path: '/mis-solicitudes',
            label: 'Mis Solicitudes',
            icon: '📋'
        }
    ];

    const adminMenuItems = [
        {
            path: '/admin-dashboard',
            label: 'Panel de Administración',
            icon: '⚙️'
        },
        {
            path: '/dashboard',
            label: 'Actualización de Usuario',
            icon: '👤'
        },
        {
            path: '/transport',
            label: 'Solicitar Transporte',
            icon: '🚐'
        },
        {
            path: '/mis-solicitudes',
            label: 'Mis Solicitudes',
            icon: '📋'
        }
    ];

    const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <h2>Transporte</h2>
                <button 
                    className="collapse-button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? '→' : '←'}
                </button>
            </div>
            <Link
                to="/"
                className={`nav-item home-nav ${location.pathname === '/' ? 'active' : ''}`}
            >
                <span className="nav-icon">🏠</span>
                {!isCollapsed && <span className="nav-label">Inicio</span>}
            </Link>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-button" onClick={handleLogout}>
                    {!isCollapsed && 'Cerrar Sesión'}
                    {isCollapsed && '🚪'}
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 