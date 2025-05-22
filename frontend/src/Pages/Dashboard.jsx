import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Panel de Control</h2>
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {showPasswordForm && (
                <div className="password-update-section">
                    <h3>Actualización de Contraseña Requerida</h3>
                    <p>Por seguridad, debes actualizar tu contraseña cada 3 meses.</p>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label htmlFor="contraseñaActual">Contraseña Actual</label>
                            <input
                                type="password"
                                id="contraseñaActual"
                                value={passwordData.contraseñaActual}
                                onChange={(e) => setPasswordData({...passwordData, contraseñaActual: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nuevaContraseña">Nueva Contraseña</label>
                            <input
                                type="password"
                                id="nuevaContraseña"
                                value={passwordData.nuevaContraseña}
                                onChange={(e) => setPasswordData({...passwordData, nuevaContraseña: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmarContraseña">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                id="confirmarContraseña"
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
                <h3>Actualizar Perfil</h3>
                <form onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                        <label htmlFor="CorreoEmpresarial">Correo Empresarial</label>
                        <input
                            type="email"
                            id="CorreoEmpresarial"
                            value={userData.CorreoEmpresarial}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Direccion">Dirección</label>
                        <input
                            type="text"
                            id="Direccion"
                            value={userData.Direccion}
                            onChange={(e) => setUserData({...userData, Direccion: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="NumeroTelefono">Número de Teléfono</label>
                        <input
                            type="tel"
                            id="NumeroTelefono"
                            value={userData.NumeroTelefono}
                            onChange={(e) => setUserData({...userData, NumeroTelefono: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Dashboard; 