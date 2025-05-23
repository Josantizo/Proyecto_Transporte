import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TransportRequests.css';

const TransportRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/transport/user-requests', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setRequests(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar las solicitudes');
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Mis Solicitudes de Transporte</h1>
                <button
                    onClick={() => navigate('/transport')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Nueva Solicitud
                </button>
            </div>

            {loading ? (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No tienes solicitudes de transporte.</p>
                </div>
            ) : (
                <div className="requests-list">
                    {requests.map((request) => (
                        <div className="request-card" key={request.idGenerarTransporte}>
                            <div className="request-card-header">
                                <span className={`status-badge ${getStatusBadgeClass(request.estado)}`}>
                                    {getStatusMessage(request.estado)}
                                </span>
                                <span className="request-date">{new Date(request.FechaSolicitud).toLocaleDateString()}</span>
                            </div>
                            <h3 style={{margin: '0 0 8px 0', fontWeight: 600, fontSize: '1.1rem'}}>Solicitud de Transporte</h3>
                            <div className="request-info">
                                <p><strong>Entrada:</strong> {request.HoraEntrada}</p>
                                <p><strong>Salida:</strong> {request.HoraSalida}</p>
                                <p><strong>Referencia:</strong> {request.PuntoReferencia}</p>
                                {request.DireccionAlternativa && (
                                    <p><strong>Alt. Dirección:</strong> {request.DireccionAlternativa}</p>
                                )}
                            </div>
                            {request.estado?.toLowerCase() === 'en proceso' && canCancelRequest(request.FechaSolicitud, request.HoraEntrada) && (
                                <button
                                    className="cancel-button"
                                    onClick={() => handleCancelRequest(request.idGenerarTransporte)}
                                >
                                    Cancelar
                                </button>
                            )}
                            {request.estado?.toLowerCase() === 'en proceso' && !canCancelRequest(request.FechaSolicitud, request.HoraEntrada) && (
                                <div className="cancel-warning">
                                    {getCancellationLimitMessage(request.FechaSolicitud, request.HoraEntrada)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransportRequests; 