import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Map from '../components/Map';
import './Transport.css';

const Transport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [transportData, setTransportData] = useState({
        horaEntrada: '',
        horaSalida: '',
        puntoReferencia: '',
        fechaSolicitud: '',
        direccionAlternativa: '',
        usarDireccionAlternativa: false,
        coordenadas: {
            lat: null,
            lng: null
        }
    });

    useEffect(() => {
        const fetchUserAddress = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/api/profile/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserAddress(response.data.Direccion || 'No hay dirección registrada');
            } catch (error) {
                console.error('Error al obtener la dirección del usuario:', error);
                setUserAddress('Error al cargar la dirección');
            }
        };

        fetchUserAddress();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!transportData.coordenadas.lat || !transportData.coordenadas.lng) {
            setErrorMessage('Por favor, selecciona una ubicación en el mapa');
            return;
        }

        // Combinar la fecha con las horas
        const fechaSolicitud = new Date(transportData.fechaSolicitud);
        const horaEntrada = new Date(`2000-01-01T${transportData.horaEntrada}`);
        const horaSalida = new Date(`2000-01-01T${transportData.horaSalida}`);

        const fechaHoraEntrada = new Date(fechaSolicitud);
        fechaHoraEntrada.setHours(horaEntrada.getHours(), horaEntrada.getMinutes());

        const fechaHoraSalida = new Date(fechaSolicitud);
        fechaHoraSalida.setHours(horaSalida.getHours(), horaSalida.getMinutes());

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3001/api/transport/create', {
                ...transportData,
                horaEntrada: fechaHoraEntrada.toISOString(),
                horaSalida: fechaHoraSalida.toISOString()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage('Solicitud de transporte creada exitosamente');
            setTransportData({
                horaEntrada: '',
                horaSalida: '',
                puntoReferencia: '',
                fechaSolicitud: '',
                direccionAlternativa: '',
                usarDireccionAlternativa: false,
                coordenadas: {
                    lat: null,
                    lng: null
                }
            });
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error al crear la solicitud de transporte');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        setTransportData(prev => ({
            ...prev,
            coordenadas: location,
            puntoReferencia: `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`
        }));
    };

    return (
        <div className="transport-container">
            <div className="transport-header">
                <h2>Solicitar Transporte</h2>
            </div>
            
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="transport-content">
                <div className="map-section">
                    <h3>Selecciona tu ubicación</h3>
                    <p>Haz clic en el mapa para seleccionar tu ubicación y ver la cobertura disponible.</p>
                    <Map 
                        onLocationSelect={handleLocationSelect}
                        initialLocation={[14.6349, -90.5069]} // Coordenadas de Guatemala City
                    />
                </div>

                <div className="transport-form">
                    <h3>Detalles del Transporte</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Fecha de Solicitud</label>
                            <input 
                                type="date" 
                                value={transportData.fechaSolicitud}
                                onChange={(e) => setTransportData({...transportData, fechaSolicitud: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="time-inputs">
                            <div className="form-group">
                                <label>Hora de Entrada</label>
                                <input 
                                    type="time" 
                                    value={transportData.horaEntrada}
                                    onChange={(e) => setTransportData({...transportData, horaEntrada: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Hora de Salida</label>
                                <input 
                                    type="time" 
                                    value={transportData.horaSalida}
                                    onChange={(e) => setTransportData({...transportData, horaSalida: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Punto de Referencia (Ubicación en el mapa)</label>
                            <input 
                                type="text" 
                                value={transportData.puntoReferencia}
                                onChange={(e) => setTransportData({...transportData, puntoReferencia: e.target.value})}
                                required 
                                placeholder="Selecciona una ubicación en el mapa"
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Dirección Registrada</label>
                            <input 
                                type="text" 
                                value={userAddress}
                                readOnly
                                className="readonly-input"
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input 
                                    type="checkbox"
                                    checked={transportData.usarDireccionAlternativa}
                                    onChange={(e) => setTransportData({
                                        ...transportData,
                                        usarDireccionAlternativa: e.target.checked,
                                        direccionAlternativa: e.target.checked ? transportData.direccionAlternativa : ''
                                    })}
                                />
                                Usar dirección alternativa para recogida
                            </label>
                        </div>
                        {transportData.usarDireccionAlternativa && (
                            <div className="form-group">
                                <label>Dirección Alternativa de Recogida</label>
                                <input 
                                    type="text" 
                                    value={transportData.direccionAlternativa}
                                    onChange={(e) => setTransportData({...transportData, direccionAlternativa: e.target.value})}
                                    placeholder="Ingresa la dirección alternativa de recogida"
                                    required={transportData.usarDireccionAlternativa}
                                />
                            </div>
                        )}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Enviando...' : 'Solicitar Transporte'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Transport; 