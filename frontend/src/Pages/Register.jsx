import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        CorreoEmpresarial: '',
        Contraseña: '',
        BMS: '',
        PrimerNombre: '',
        SegundoNombre: '',
        PrimerApellido: '',
        SegundoApellido: '',
        NumeroTelefono: '',
        Direccion: '',
        LOB: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateForm = () => {
        const newErrors = {};
        
        // Validación de correo
        if (!formData.CorreoEmpresarial) {
            newErrors.CorreoEmpresarial = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.CorreoEmpresarial)) {
            newErrors.CorreoEmpresarial = 'El correo no es válido';
        }

        // Validación de contraseña
        if (!formData.Contraseña) {
            newErrors.Contraseña = 'La contraseña es requerida';
        } else if (formData.Contraseña.length < 8) {
            newErrors.Contraseña = 'La contraseña debe tener al menos 8 caracteres';
        } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.Contraseña)) {
            newErrors.Contraseña = 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales';
        }

        // Validación de campos requeridos
        if (!formData.BMS) newErrors.BMS = 'El BMS es requerido';
        if (!formData.PrimerNombre) newErrors.PrimerNombre = 'El primer nombre es requerido';
        if (!formData.PrimerApellido) newErrors.PrimerApellido = 'El primer apellido es requerido';
        if (!formData.NumeroTelefono) newErrors.NumeroTelefono = 'El número de teléfono es requerido';
        if (!formData.Direccion) newErrors.Direccion = 'La dirección es requerida';
        if (!formData.LOB) newErrors.LOB = 'El LOB es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Limpiar error del campo cuando el usuario comienza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/api/login/register', formData);
            console.log('Registro exitoso:', response.data);
            // Mostrar mensaje de éxito
            setErrorMessage('');
            // Redirigir al usuario a la página de login
            navigate('/login');
        } catch (error) {
            console.error('Error en el registro:', error);
            if (error.response?.data?.errors) {
                // Si hay errores de validación del backend
                const backendErrors = {};
                error.response.data.errors.forEach(err => {
                    backendErrors[err.param] = err.msg;
                });
                setErrors(backendErrors);
            } else {
                setErrorMessage(
                    error.response?.data?.message || 
                    error.response?.data?.error ||
                    'Error al registrar el usuario. Por favor, intente nuevamente.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-container">
                <h2>Crear una cuenta</h2>
                <p className="register-subtitle">Llena los siguientes campos para registrarte en el sistema de transporte.</p>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="CorreoEmpresarial">Correo Empresarial</label>
                        <input
                            type="email"
                            id="CorreoEmpresarial"
                            name="CorreoEmpresarial"
                            value={formData.CorreoEmpresarial}
                            onChange={handleChange}
                            className={errors.CorreoEmpresarial ? 'error' : ''}
                        />
                        {errors.CorreoEmpresarial && <span className="error-text">{errors.CorreoEmpresarial}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="Contraseña">Contraseña</label>
                        <input
                            type="password"
                            id="Contraseña"
                            name="Contraseña"
                            value={formData.Contraseña}
                            onChange={handleChange}
                            className={errors.Contraseña ? 'error' : ''}
                            placeholder="Mínimo 8 caracteres, mayúsculas, minúsculas, número y símbolo"
                        />
                        {errors.Contraseña && <span className="error-text">{errors.Contraseña}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="BMS">BMS</label>
                        <input
                            type="text"
                            id="BMS"
                            name="BMS"
                            value={formData.BMS}
                            onChange={handleChange}
                            className={errors.BMS ? 'error' : ''}
                            placeholder="Código BMS"
                        />
                        {errors.BMS && <span className="error-text">{errors.BMS}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="LOB">LOB</label>
                        <select
                            id="LOB"
                            name="LOB"
                            value={formData.LOB}
                            onChange={handleChange}
                            className={errors.LOB ? 'error' : ''}
                        >
                            <option value="">Seleccione un LOB</option>
                            <option value="COX Billing">COX Billing</option>
                            <option value="COX Tech Support">COX Tech Support</option>
                            <option value="Centene">Centene</option>
                            <option value="Gusto">Gusto</option>
                        </select>
                        {errors.LOB && <span className="error-text">{errors.LOB}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="PrimerNombre">Primer Nombre</label>
                            <input
                                type="text"
                                id="PrimerNombre"
                                name="PrimerNombre"
                                value={formData.PrimerNombre}
                                onChange={handleChange}
                                className={errors.PrimerNombre ? 'error' : ''}
                                placeholder="Primer Nombre"
                            />
                            {errors.PrimerNombre && <span className="error-text">{errors.PrimerNombre}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="SegundoNombre">Segundo Nombre</label>
                            <input
                                type="text"
                                id="SegundoNombre"
                                name="SegundoNombre"
                                value={formData.SegundoNombre}
                                onChange={handleChange}
                                placeholder="Segundo Nombre (opcional)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="PrimerApellido">Primer Apellido</label>
                            <input
                                type="text"
                                id="PrimerApellido"
                                name="PrimerApellido"
                                value={formData.PrimerApellido}
                                onChange={handleChange}
                                className={errors.PrimerApellido ? 'error' : ''}
                                placeholder="Primer Apellido"
                            />
                            {errors.PrimerApellido && <span className="error-text">{errors.PrimerApellido}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="SegundoApellido">Segundo Apellido</label>
                            <input
                                type="text"
                                id="SegundoApellido"
                                name="SegundoApellido"
                                value={formData.SegundoApellido}
                                onChange={handleChange}
                                placeholder="Segundo Apellido (opcional)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="NumeroTelefono">Número de Teléfono</label>
                            <input
                                type="text"
                                id="NumeroTelefono"
                                name="NumeroTelefono"
                                value={formData.NumeroTelefono}
                                onChange={handleChange}
                                className={errors.NumeroTelefono ? 'error' : ''}
                                placeholder="Ejemplo: 55551234"
                            />
                            {errors.NumeroTelefono && <span className="error-text">{errors.NumeroTelefono}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="Direccion">Dirección</label>
                            <input
                                type="text"
                                id="Direccion"
                                name="Direccion"
                                value={formData.Direccion}
                                onChange={handleChange}
                                className={errors.Direccion ? 'error' : ''}
                                placeholder="Dirección completa"
                            />
                            {errors.Direccion && <span className="error-text">{errors.Direccion}</span>}
                        </div>
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
                <div className="login-link">
                    <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
