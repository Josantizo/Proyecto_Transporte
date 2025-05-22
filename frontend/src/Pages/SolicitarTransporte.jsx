import React, { useState } from 'react';
import axios from 'axios';
import Map from '../components/Map';
import './SolicitarTransporte.css';

const SolicitarTransporte = () => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [formData, setFormData] = useState({
        horaEntrada: '',
        horaSalida: '',
        puntoReferencia: '',
        fechaSolicitud: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Debes iniciar sesión para solicitar transporte');
                return;
            }

            // Combinar fecha y hora para HoraEntrada y HoraSalida
            const horaEntrada = new Date(`${formData.fechaSolicitud}T${formData.horaEntrada}`);
            const horaSalida = new Date(`${formData.fechaSolicitud}T${formData.horaSalida}`);

            const requestData = {
                horaEntrada: horaEntrada.toISOString(),
                horaSalida: horaSalida.toISOString(),
                puntoReferencia: selectedLocation ? `${selectedLocation.lat}, ${selectedLocation.lng}` : formData.puntoReferencia,
                fechaSolicitud: formData.fechaSolicitud
            };

            const response = await axios.post('http://localhost:3001/api/transport/create', requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setSuccess('Solicitud de transporte creada exitosamente');
            setFormData({
                horaEntrada: '',
                horaSalida: '',
                puntoReferencia: '',
                fechaSolicitud: ''
            });
            setSelectedLocation(null);
        } catch (error) {
            console.error('Error al crear la solicitud:', error);
            setError(error.response?.data?.message || 'Error al crear la solicitud de transporte');
        }
    };

    return (
        <div className="solicitar-transporte-container">
            <h2>Solicitar Transporte</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="map-container">
                <Map 
                    onLocationSelect={handleLocationSelect}
                    initialLocation={[14.6349, -90.5069]} // Coordenadas de Guatemala City
                />
                {selectedLocation && (
                    <div className="selected-location">
                        Ubicación seleccionada: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="solicitud-form">
                <div className="form-group">
                    <label htmlFor="puntoReferencia">Punto de Referencia</label>
                    <input
                        type="text"
                        id="puntoReferencia"
                        name="puntoReferencia"
                        value={formData.puntoReferencia}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="fechaSolicitud">Fecha de Solicitud</label>
                    <input
                        type="date"
                        id="fechaSolicitud"
                        name="fechaSolicitud"
                        value={formData.fechaSolicitud}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="horaEntrada">Hora de Entrada</label>
                        <input
                            type="time"
                            id="horaEntrada"
                            name="horaEntrada"
                            value={formData.horaEntrada}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="horaSalida">Hora de Salida</label>
                        <input
                            type="time"
                            id="horaSalida"
                            name="horaSalida"
                            value={formData.horaSalida}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="submit-button">
                    Solicitar Transporte
                </button>
            </form>
        </div>
    );
};

export default SolicitarTransporte; 