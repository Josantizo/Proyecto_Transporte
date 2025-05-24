import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Map from '../components/Map';
import './Transport.css';

const Transport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [isEditing, setIsEditing] = useState(false);
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
        // Check if we're editing an existing request
        if (location.state?.editRequest) {
            const request = location.state.editRequest;
            setIsEditing(true);
            setTransportData({
                horaEntrada: new Date(request.HoraEntrada).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                horaSalida: new Date(request.HoraSalida).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                puntoReferencia: request.PuntoReferencia,
                fechaSolicitud: new Date(request.FechaSolicitud).toISOString().split('T')[0],
                direccionAlternativa: request.DireccionAlternativa || '',
                usarDireccionAlternativa: !!request.DireccionAlternativa,
                coordenadas: {
                    lat: parseFloat(request.PuntoReferencia.split(',')[0].split(':')[1].trim()),
                    lng: parseFloat(request.PuntoReferencia.split(',')[1].split(':')[1].trim())
                }
            });
        }

        // Fetch user's address
        const fetchUserAddress = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/api/profile/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserAddress(response.data.Direccion || 'No hay dirección registrada');
            } catch (error) {
                console.error('Error fetching user address:', error);
                setUserAddress('Error al cargar la dirección');
            }
        };

        fetchUserAddress();
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Validar que la hora de salida sea posterior a la hora de entrada
        const horaEntrada = new Date(`2000-01-01T${transportData.horaEntrada}`);
        const horaSalida = new Date(`2000-01-01T${transportData.horaSalida}`);

        if (horaSalida <= horaEntrada) {
            setErrorMessage('La hora de salida debe ser posterior a la hora de entrada');
            return;
        }

        // Combinar la fecha con las horas
        const fechaSolicitud = new Date(transportData.fechaSolicitud);
        const horaEntradaDate = new Date(`2000-01-01T${transportData.horaEntrada}`);
        const horaSalidaDate = new Date(`2000-01-01T${transportData.horaSalida}`);

        const fechaHoraEntrada = new Date(fechaSolicitud);
        fechaHoraEntrada.setHours(horaEntradaDate.getHours(), horaEntradaDate.getMinutes());

        const fechaHoraSalida = new Date(fechaSolicitud);
        fechaHoraSalida.setHours(horaSalidaDate.getHours(), horaSalidaDate.getMinutes());

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const endpoint = isEditing 
                ? `http://localhost:3001/api/transport/update/${location.state.editRequest.idGenerarTransporte}`
                : 'http://localhost:3001/api/transport/create';

            const response = await axios({
                method: isEditing ? 'put' : 'post',
                url: endpoint,
                data: {
                    ...transportData,
                    horaEntrada: fechaHoraEntrada.toISOString(),
                    horaSalida: fechaHoraSalida.toISOString()
                },
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setSuccessMessage(response.data.message || `Solicitud ${isEditing ? 'actualizada' : 'creada'} exitosamente`);
                if (!isEditing) {
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
                }
                setTimeout(() => {
                    navigate('/transport-requests');
                }, 2000);
            } else {
                setErrorMessage(response.data.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la solicitud de transporte`);
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(
                error.response?.data?.message || 
                error.response?.data?.error || 
                `Error al ${isEditing ? 'actualizar' : 'crear'} la solicitud de transporte`
            );
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
                <h2>{isEditing ? 'Editar Solicitud de Transporte' : 'Solicitar Transporte'}</h2>
            </div>
            
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="transport-content">
                <div className="map-section">
                    <h3>Selecciona tu ubicación</h3>
                    <p>Haz clic en el mapa para seleccionar tu ubicación y ver la cobertura disponible.</p>
                    <Map 
                        onLocationSelect={handleLocationSelect}
                        initialLocation={transportData.coordenadas.lat ? [transportData.coordenadas.lat, transportData.coordenadas.lng] : [14.6349, -90.5069]}
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
                            {loading ? 'Enviando...' : isEditing ? 'Actualizar Solicitud' : 'Solicitar Transporte'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Transport; 