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

        try {
            const response = await axios.post('http://localhost:3001/api/login', formData);
            const { token, user } = response.data;
            
            // Guardar el token y datos del usuario en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error en el login:', error);
            setError(error.response?.data?.message || 'Error al iniciar sesión');
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
            </div>
        </div>
    );
};

export default Login; 