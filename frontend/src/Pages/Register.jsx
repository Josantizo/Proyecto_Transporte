import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        puntoReferencia: ''
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
            const response = await axios.post('http://localhost:3000/api/auth/register', formData);
            console.log('Registro exitoso:', response.data);
            // Mostrar mensaje de éxito
            setErrorMessage('');
            // Redirigir al usuario a la página de login
            navigate('/login');
        } catch (error) {
            console.error('Error en el registro:', error);
            setErrorMessage(
                error.response?.data?.message || 
                error.response?.data?.error ||
                'Error al registrar el usuario. Por favor, intente nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-container">
                <h2>Registro de Usuario</h2>
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
                        />
                        {errors.BMS && <span className="error-text">{errors.BMS}</span>}
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
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="NumeroTelefono">Número de Teléfono</label>
                        <input
                            type="tel"
                            id="NumeroTelefono"
                            name="NumeroTelefono"
                            value={formData.NumeroTelefono}
                            onChange={handleChange}
                            className={errors.NumeroTelefono ? 'error' : ''}
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
                        />
                        {errors.Direccion && <span className="error-text">{errors.Direccion}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="puntoReferencia">Punto de Referencia</label>
                        <input
                            type="text"
                            id="puntoReferencia"
                            name="puntoReferencia"
                            value={formData.puntoReferencia}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
