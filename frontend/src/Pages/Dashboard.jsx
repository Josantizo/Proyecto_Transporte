import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Map from '../components/Map';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        CorreoEmpresarial: '',
        Direccion: '',
        puntoReferencia: '',
        NumeroTelefono: '',
        ultimaActualizacionPassword: null
    });
    const [passwordData, setPasswordData] = useState({
        contraseñaActual: '',
        nuevaContraseña: '',
        confirmarContraseña: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        // Verificar si el usuario está autenticado
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Cargar datos del usuario
        fetchUserData();
    }, [navigate]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token from localStorage:', token);
            
            const response = await axios.get('http://localhost:3001/api/profile/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Profile response:', response.data);
            
            setUserData(response.data);
            
            // Verificar si es necesario actualizar la contraseña
            const ultimaActualizacion = new Date(response.data.ultimaActualizacionPassword);
            const tresMesesAtras = new Date();
            tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
            
            if (ultimaActualizacion < tresMesesAtras) {
                setShowPasswordForm(true);
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (passwordData.nuevaContraseña !== passwordData.confirmarContraseña) {
            setErrorMessage('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.nuevaContraseña.length < 8) {
            setErrorMessage('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:3001/api/login/update-password', passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage('Contraseña actualizada exitosamente');
            setShowPasswordForm(false);
            setPasswordData({
                contraseñaActual: '',
                nuevaContraseña: '',
                confirmarContraseña: ''
            });
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('Sending update with data:', {
                Direccion: userData.Direccion,
                NumeroTelefono: userData.NumeroTelefono
            });

            const response = await axios.put('http://localhost:3001/api/profile/update-profile', {
                Direccion: userData.Direccion,
                NumeroTelefono: userData.NumeroTelefono
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Update response:', response.data);
            setSuccessMessage('Perfil actualizado exitosamente');
            
            // Recargar los datos del perfil después de la actualización
            await fetchUserData();
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrorMessage(error.response?.data?.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Panel de Control</h2>
                <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {showPasswordForm && (
                <div className="password-update-section">
                    <h3>Actualización de Contraseña Requerida</h3>
                    <p>Por seguridad, debes actualizar tu contraseña cada 3 meses.</p>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label>Contraseña Actual</label>
                            <input
                                type="password"
                                value={passwordData.contraseñaActual}
                                onChange={(e) => setPasswordData({...passwordData, contraseñaActual: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nueva Contraseña</label>
                            <input
                                type="password"
                                value={passwordData.nuevaContraseña}
                                onChange={(e) => setPasswordData({...passwordData, nuevaContraseña: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                value={passwordData.confirmarContraseña}
                                onChange={(e) => setPasswordData({...passwordData, confirmarContraseña: e.target.value})}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>
            )}

            <div className="profile-update-section">
                <h3>Actualizar Información Personal</h3>
                <form onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                        <label>Dirección Actual</label>
                        <input
                            type="text"
                            value={userData.Direccion || 'No hay dirección registrada'}
                            onChange={(e) => setUserData({...userData, Direccion: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Número de Teléfono</label>
                        <input
                            type="tel"
                            value={userData.NumeroTelefono || 'No hay número registrado'}
                            onChange={(e) => setUserData({...userData, NumeroTelefono: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                    </button>
                </form>
            </div>

            <div className="map-section">
                <h3>Mapa de Cobertura</h3>
                <p>Selecciona un punto en el mapa para ver la cobertura de transporte disponible.</p>
                <Map />
            </div>
        </div>
    );
};

export default Dashboard; 