import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        CorreoEmpresarial: '',
        Contraseña: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setDebugInfo('');

        try {
            console.log('Intentando login con:', formData);
            
            // Primero probamos la ruta de test
            const testResponse = await axios.post('http://localhost:3001/api/login/test-login', formData);
            console.log('Respuesta de test:', testResponse.data);
            setDebugInfo(JSON.stringify(testResponse.data, null, 2));

            // Si el test funciona, intentamos el login real
            const response = await axios.post('http://localhost:3001/api/login', formData);
            console.log('Respuesta del servidor:', response.data);
            
            const { token, user } = response.data;
            
            // Guardar el token y datos del usuario en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Redirigir al dashboard o página principal
            navigate('/dashboard');
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Detalles del error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            setError(error.response?.data?.message || 'Error al iniciar sesión');
            setDebugInfo(JSON.stringify({
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            }, null, 2));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Iniciar Sesión</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="CorreoEmpresarial">Correo Empresarial</label>
                        <input
                            type="email"
                            id="CorreoEmpresarial"
                            name="CorreoEmpresarial"
                            value={formData.CorreoEmpresarial}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese su correo empresarial"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="Contraseña">Contraseña</label>
                        <input
                            type="password"
                            id="Contraseña"
                            name="Contraseña"
                            value={formData.Contraseña}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese su contraseña"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p>
                </div>

                {debugInfo && (
                    <div className="debug-info">
                        <h3>Información de Debug:</h3>
                        <pre>{debugInfo}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login; 