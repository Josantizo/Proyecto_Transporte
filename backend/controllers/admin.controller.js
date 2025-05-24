const db = require('../config/db');

// Obtener todas las solicitudes de transporte con filtros
const getTransportRequests = async (req, res) => {
    try {
        const { 
            agent, 
            lob, 
            schedule, 
            status, 
            startDate, 
            endDate 
        } = req.query;

        console.log('Query params:', req.query);

        // Verificar que las tablas existan
        const [tables] = await db.query(`
            SELECT TABLE_NAME 
            FROM information_schema.tables 
            WHERE table_schema = ? 
            AND table_name IN ('generartransporte', 'pasajeros', 'login')
        `, [process.env.DB_NAME || 'transporte']);

        if (tables.length < 3) {
            return res.status(500).json({
                message: 'Las tablas necesarias no existen en la base de datos',
                tables: tables.map(t => t.TABLE_NAME)
            });
        }

        // Obtener la estructura de la tabla generartransporte
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'generartransporte'
        `, [process.env.DB_NAME || 'transporte']);

        const columnNames = columns.map(col => col.COLUMN_NAME);
        console.log('Columnas disponibles:', columnNames);

        let query = `
            SELECT 
                gt.idGenerarTransporte,
                gt.FechaSolicitud,
                gt.HoraEntrada,
                gt.HoraSalida,
                gt.PuntoReferencia,
                gt.DireccionAlternativa,
                gt.estado,
                p.BMS,
                p.PrimerNombre,
                p.PrimerApellido,
                p.NumeroTelefono,
                p.Direccion,
                l.CorreoEmpresarial
            FROM generartransporte gt
            INNER JOIN detalle_generartransporte dgt ON gt.idDetalle_GenerarTransporte = dgt.idDetalle_GenerarTransporte
            INNER JOIN pasajeros p ON dgt.idPasajero_fk2 = p.idPasajero
            INNER JOIN login l ON l.idPasajero_fk = p.idPasajero
            WHERE 1=1
        `;
        const params = [];

        if (agent) {
            query += ' AND (p.BMS LIKE ? OR l.CorreoEmpresarial LIKE ? OR p.PrimerNombre LIKE ? OR p.PrimerApellido LIKE ?)';
            params.push(`%${agent}%`, `%${agent}%`, `%${agent}%`, `%${agent}%`);
        }
        if (lob) {
            query += ' AND p.LOB = ?';
            params.push(lob);
        }
        if (schedule) {
            query += ' AND (TIME(gt.HoraEntrada) LIKE ? OR TIME(gt.HoraSalida) LIKE ?)';
            params.push(`%${schedule}%`, `%${schedule}%`);
        }
        if (status) {
            query += ' AND gt.estado = ?';
            params.push(status);
        }
        if (startDate) {
            query += ' AND DATE(gt.FechaSolicitud) >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND DATE(gt.FechaSolicitud) <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY gt.FechaSolicitud DESC';

        console.log('Executing query:', query);
        console.log('With params:', params);

        const [requests] = await db.query(query, params);
        console.log('Query result count:', requests.length);
        console.log('First request (if any):', requests[0]);

        // Si no hay resultados, devolver un array vacío con un mensaje
        if (requests.length === 0) {
            console.log('No requests found in database');
            return res.json({
                message: 'No se encontraron solicitudes de transporte',
                data: []
            });
        }

        // Transformar los datos para el frontend
        const transformedRequests = requests.map(request => {
            console.log('Processing request:', request);
            return {
                ...request,
                FechaSolicitud: request.FechaSolicitud ? new Date(request.FechaSolicitud).toISOString() : null,
                HoraEntrada: request.HoraEntrada ? new Date(request.HoraEntrada).toISOString() : null,
                HoraSalida: request.HoraSalida ? new Date(request.HoraSalida).toISOString() : null
            };
        });

        console.log('Transformed requests:', transformedRequests);

        res.json({
            message: 'Solicitudes obtenidas exitosamente',
            data: transformedRequests
        });
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        console.error('Error stack:', error.stack);
        
        // Manejar errores específicos de la base de datos
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ 
                message: 'Error de conexión con la base de datos',
                error: 'No se pudo conectar al servidor de base de datos'
            });
        }
        
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ 
                message: 'Error en la estructura de la base de datos',
                error: 'Una o más tablas necesarias no existen'
            });
        }

        res.status(500).json({ 
            message: 'Error al obtener las solicitudes de transporte',
            error: error.message,
            stack: error.stack
        });
    }
};

// Actualizar el estado de una solicitud de transporte
const updateTransportRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        console.log('Updating request:', id, 'to status:', status, 'with comment:', comment);

        if (!['En proceso', 'aceptado', 'cancelado', 'rechazado'].includes(status)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        // Verificar que la solicitud exista
        const [existingRequest] = await db.query(
            'SELECT idGenerarTransporte FROM generartransporte WHERE idGenerarTransporte = ?',
            [id]
        );

        if (existingRequest.length === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        // Si el estado es rechazado, se requiere un comentario
        if (status === 'rechazado' && !comment) {
            return res.status(400).json({ message: 'Se requiere un comentario para rechazar la solicitud' });
        }

        // Si el estado no es rechazado, no debe haber comentario
        if (status !== 'rechazado' && comment) {
            return res.status(400).json({ message: 'Los comentarios solo son permitidos al rechazar una solicitud' });
        }

        const [result] = await db.query(
            'UPDATE generartransporte SET estado = ?, Comentario = ? WHERE idGenerarTransporte = ?',
            [status, status === 'rechazado' ? comment : null, id]
        );

        res.json({ 
            message: 'Estado actualizado exitosamente',
            requestId: id,
            newStatus: status
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el estado de la solicitud',
            error: error.message,
            stack: error.stack
        });
    }
};

module.exports = {
    getTransportRequests,
    updateTransportRequestStatus
}; 