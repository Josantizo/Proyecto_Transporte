import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TransportRequests.css';

const TransportRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchRequests();
    }, [navigate]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/transport/user-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data);
        } catch (error) {
            setError('Error al cargar las solicitudes de transporte');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const canCancelRequest = (requestDate, requestTime) => {
        const now = new Date();
        const requestDateTime = new Date(requestDate);
        const requestHour = new Date(requestTime).getHours();

        // Determinar el límite de cancelación basado en la hora de la solicitud
        let cancellationLimit;
        if (requestHour >= 6 && requestHour < 15) { // Entre 6:00 AM y 2:59 PM
            cancellationLimit = new Date(requestDate);
            cancellationLimit.setHours(15, 0, 0, 0); // 3:00 PM
        } else if (requestHour >= 15 && requestHour < 18) { // Entre 3:00 PM y 5:59 PM
            cancellationLimit = new Date(requestDate);
            cancellationLimit.setHours(20, 0, 0, 0); // 8:00 PM
        } else {
            return false;
        }

        return now < cancellationLimit;
    };

    const getCancellationLimitMessage = (requestDate, requestTime) => {
        const requestHour = new Date(requestTime).getHours();
        if (requestHour >= 6 && requestHour < 15) {
            return 'No se puede cancelar esta solicitud después de las 3:00 PM';
        } else if (requestHour >= 15 && requestHour < 18) {
            return 'No se puede cancelar esta solicitud después de las 8:00 PM';
        }
        return 'No se puede cancelar esta solicitud';
    };

    const handleCancelRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/api/transport/cancel/${requestId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Solicitud cancelada exitosamente');
            // Refresh the requests list
            fetchRequests();
        } catch (error) {
            setError(error.response?.data?.message || 'Error al cancelar la solicitud');
            console.error('Error:', error);
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const getStatusBadgeClass = (estado) => {
        if (!estado) return 'status-pending'; // Default to pending if no status
        
        switch (estado.toLowerCase()) {
            case 'en proceso':
                return 'status-pending';
            case 'aceptado':
                return 'status-accepted';
            case 'cancelado':
                return 'status-cancelled';
            case 'rechazado':
                return 'status-rejected';
            default:
                return 'status-pending'; // Default to pending for unknown statuses
        }
    };

    const getStatusMessage = (estado) => {
        if (!estado) return 'Pendiente de aprobación'; // Default message if no status
        
        switch (estado.toLowerCase()) {
            case 'en proceso':
                return 'Pendiente de aprobación';
            case 'aceptado':
                return 'Solicitud aprobada';
            case 'cancelado':
                return 'Solicitud cancelada';
            case 'rechazado':
                return 'Solicitud rechazada';
            default:
                return 'Pendiente de aprobación'; // Default message for unknown statuses
        }
    };

    if (loading) {
        return <div className="loading">Cargando solicitudes...</div>;
    }

    return (
        <div className="transport-requests-container">
            <h2>Mis Solicitudes de Transporte</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="requests-list">
                {requests.length === 0 ? (
                    <p>No tienes solicitudes de transporte pendientes.</p>
                ) : (
                    requests.map((request) => (
                        <div key={request.idGenerarTransporte} className="request-card">
                            <div className="request-info">
                                <h3>Solicitud #{request.idGenerarTransporte}</h3>
                                <p><strong>Fecha de Transporte:</strong> {formatDate(request.FechaSolicitud)}</p>
                                <p><strong>Hora de Entrada:</strong> {request.HoraEntrada}</p>
                                <p><strong>Hora de Salida:</strong> {request.HoraSalida}</p>
                                <p><strong>Punto de Referencia:</strong> {request.PuntoReferencia}</p>
                                {request.DireccionAlternativa && (
                                    <p><strong>Dirección Alternativa:</strong> {request.DireccionAlternativa}</p>
                                )}
                                <p className={`status-badge ${getStatusBadgeClass(request.Estado)}`}>
                                    <strong>Estado:</strong> {getStatusMessage(request.Estado)}
                                </p>
                            </div>
                            {request.Estado?.toLowerCase() === 'en proceso' && canCancelRequest(request.FechaSolicitud, request.HoraEntrada) && (
                                <button 
                                    className="cancel-button"
                                    onClick={() => handleCancelRequest(request.idGenerarTransporte)}
                                >
                                    Cancelar Solicitud
                                </button>
                            )}
                            {request.Estado?.toLowerCase() === 'en proceso' && !canCancelRequest(request.FechaSolicitud, request.HoraEntrada) && (
                                <p className="cancel-warning">
                                    {getCancellationLimitMessage(request.FechaSolicitud, request.HoraEntrada)}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransportRequests; 