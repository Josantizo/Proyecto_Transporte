import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [transportRequests, setTransportRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        agent: '',
        lob: '',
        status: '',
        startDate: '',
        endDate: '',
        schedule: ''
    });

    useEffect(() => {
        const userRole = localStorage.getItem('rol');
        if (userRole !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchTransportRequests();
    }, [navigate, filters]);

    const fetchTransportRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const queryParams = new URLSearchParams();
            if (filters.agent) queryParams.append('agent', filters.agent);
            if (filters.lob) queryParams.append('lob', filters.lob);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            if (filters.schedule) queryParams.append('schedule', filters.schedule);
            const response = await axios.get(
                `http://localhost:3001/api/admin/transport-requests?${queryParams.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const requests = Array.isArray(response.data.data) ? response.data.data : [];
            setTransportRequests(requests);
            if (response.data.message) {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error al cargar las solicitudes de transporte');
            setTransportRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await axios.put(
                `http://localhost:3001/api/admin/transport-requests/${requestId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            fetchTransportRequests();
        } catch (error) {
            setError('Error al actualizar el estado de la solicitud');
        }
    };

    const getStatusBadgeClass = (estado) => {
        if (!estado) return 'status-pending';
        switch (estado.toLowerCase()) {
            case 'en proceso': return 'status-pending';
            case 'aceptado': return 'status-accepted';
            case 'cancelado': return 'status-cancelled';
            case 'rechazado': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    const getStatusMessage = (estado) => {
        if (!estado) return 'Pendiente de aprobación';
        switch (estado.toLowerCase()) {
            case 'en proceso': return 'Pendiente de aprobación';
            case 'aceptado': return 'Solicitud aprobada';
            case 'cancelado': return 'Solicitud cancelada';
            case 'rechazado': return 'Solicitud rechazada';
            default: return 'Pendiente de aprobación';
        }
    };

    // Obtener lista de agentes únicos para el filtro
    const uniqueAgents = Array.from(new Set(transportRequests.map(req => req.CorreoEmpresarial || req.Correo || req.email)));

    return (
        <div className="container admin-dashboard-table">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
            <div className="filters mb-4 flex flex-wrap gap-4">
                <div>
                    <label htmlFor="agent">Agente:</label>
                    <select name="agent" id="agent" value={filters.agent} onChange={handleFilterChange} className="filter-select">
                        <option value="">Todos</option>
                        {uniqueAgents.map(agent => (
                            <option key={agent} value={agent}>{agent}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="status">Estado:</label>
                    <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                        <option value="">Todos</option>
                        <option value="En proceso">Pendiente</option>
                        <option value="aceptado">Aprobado</option>
                        <option value="rechazado">Rechazado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
            </div>
            {loading ? (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
            ) : transportRequests.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No hay solicitudes de transporte.</p>
                </div>
            ) : (
                <div className="requests-table overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow-md">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Agente</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Hora Entrada</th>
                                <th>Hora Salida</th>
                                <th>Punto de Referencia</th>
                                <th>Dirección Alternativa</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transportRequests.map(request => (
                                <tr key={request.idGenerarTransporte}>
                                    <td>{request.idGenerarTransporte}</td>
                                    <td>{request.CorreoEmpresarial || request.Correo || request.email}</td>
                                    <td>{new Date(request.FechaSolicitud).toLocaleDateString()}</td>
                                    <td><span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(request.estado)}`}>{getStatusMessage(request.estado)}</span></td>
                                    <td>{request.HoraEntrada}</td>
                                    <td>{request.HoraSalida}</td>
                                    <td>{request.PuntoReferencia}</td>
                                    <td>{request.DireccionAlternativa || '-'}</td>
                                    <td>
                                        {request.estado?.toLowerCase() === 'en proceso' && (
                                            <>
                                                <button onClick={() => handleStatusChange(request.idGenerarTransporte, 'aceptado')} className="action-btn accept">Aceptar</button>
                                                <button onClick={() => handleStatusChange(request.idGenerarTransporte, 'rechazado')} className="action-btn reject">Rechazar</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 