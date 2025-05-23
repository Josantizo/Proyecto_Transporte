import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        CorreoEmpresarial: '',
        Contraseña: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/api/login', formData);
            const { token, user } = response.data;
            
            // Store user data and token
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('rol', user.rol);
            
            // Redirigir siempre a Home
            navigate('/');
        } catch (error) {
            console.error('Error en el login:', error);
            setErrorMessage(
                error.response?.data?.message || 
                'Error al iniciar sesión. Por favor, verifica tus credenciales.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h2>Iniciar Sesión</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="CorreoEmpresarial">Correo Empresarial</label>
                        <input
                            type="email"
                            id="CorreoEmpresarial"
                            name="CorreoEmpresarial"
                            value={formData.CorreoEmpresarial}
                            onChange={handleChange}
                            required
                            placeholder="ejemplo@teleperformance.com.gt"
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
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>
                <div className="register-link">
                    <p>¿No tienes usuario? <Link to="/register">Regístrate</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login; 