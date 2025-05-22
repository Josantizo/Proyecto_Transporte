const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

// Get user's transport requests
router.get('/user-requests', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.pasajeroId;
        console.log('Fetching requests for user:', userId);

        const query = `
            SELECT gt.*, dgt.idPasajero_fk2
            FROM generartransporte gt
            JOIN detalle_generartransporte dgt ON gt.idDetalle_GenerarTransporte = dgt.idDetalle_GenerarTransporte
            WHERE dgt.idPasajero_fk2 = ?
            ORDER BY gt.FechaSolicitud DESC, gt.HoraEntrada DESC
        `;
        
        const [requests] = await db.query(query, [userId]);
        console.log('Found requests:', requests);
        res.json(requests);
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ 
            message: 'Error al obtener las solicitudes de transporte',
            error: error.message 
        });
    }
});

// Cancel transport request
router.delete('/cancel/:requestId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.pasajeroId;
        const requestId = req.params.requestId;
        console.log('Attempting to cancel request:', requestId, 'for user:', userId);

        // First check if the request exists and belongs to the user
        const checkQuery = `
            SELECT gt.* 
            FROM generartransporte gt
            JOIN detalle_generartransporte dgt ON gt.idDetalle_GenerarTransporte = dgt.idDetalle_GenerarTransporte
            WHERE gt.idGenerarTransporte = ? AND dgt.idPasajero_fk2 = ?
        `;
        
        const [requests] = await db.query(checkQuery, [requestId, userId]);
        console.log('Found request to cancel:', requests);
        
        if (requests.length === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        const request = requests[0];

        // Check if the request is pending
        if (request.Estado !== 'PENDIENTE') {
            return res.status(400).json({ message: 'Solo se pueden cancelar solicitudes pendientes' });
        }

        // Obtener la hora de la solicitud
        const requestTime = new Date(request.HoraEntrada);
        const requestHour = requestTime.getHours();
        const now = new Date();

        // Determinar el límite de cancelación basado en la hora de la solicitud
        let cancellationLimit;
        if (requestHour >= 6 && requestHour < 15) { // Entre 6:00 AM y 2:59 PM
            cancellationLimit = new Date(request.FechaSolicitud);
            cancellationLimit.setHours(15, 0, 0, 0); // 3:00 PM
        } else if (requestHour >= 15 && requestHour < 18) { // Entre 3:00 PM y 5:59 PM
            cancellationLimit = new Date(request.FechaSolicitud);
            cancellationLimit.setHours(20, 0, 0, 0); // 8:00 PM
        } else {
            return res.status(400).json({ 
                message: 'Las solicitudes solo pueden realizarse entre las 6:00 AM y las 6:00 PM' 
            });
        }

        // Verificar si aún está dentro del límite de cancelación
        if (now >= cancellationLimit) {
            return res.status(400).json({ 
                message: `No se puede cancelar la solicitud después de las ${cancellationLimit.getHours()}:00` 
            });
        }

        // Update the request status to CANCELLED
        const updateQuery = `
            UPDATE generartransporte 
            SET Estado = 'CANCELADO' 
            WHERE idGenerarTransporte = ?
        `;
        
        await db.query(updateQuery, [requestId]);
        res.json({ message: 'Solicitud cancelada exitosamente' });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ 
            message: 'Error al cancelar la solicitud',
            error: error.message 
        });
    }
});

// Create new transport request
router.post('/create', authenticateToken, async (req, res) => {
    let connection;
    try {
        console.log('=== Iniciando creación de solicitud de transporte ===');
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
        console.log('Usuario autenticado:', JSON.stringify(req.user, null, 2));

        // Validar que el usuario esté autenticado
        if (!req.user) {
            console.error('No se encontró información del usuario en el token');
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Verificar la conexión a la base de datos
        try {
            connection = await db.getConnection();
            console.log('Conexión a la base de datos establecida correctamente');
        } catch (dbError) {
            console.error('Error al conectar con la base de datos:', dbError);
            throw new Error('Error de conexión con la base de datos');
        }

        const {
            horaEntrada,
            horaSalida,
            puntoReferencia,
            fechaSolicitud,
            direccionAlternativa,
            usarDireccionAlternativa,
            coordenadas
        } = req.body;

        console.log('Datos procesados:', {
            horaEntrada,
            horaSalida,
            puntoReferencia,
            fechaSolicitud,
            direccionAlternativa,
            usarDireccionAlternativa,
            coordenadas
        });

        // Validar formato de fecha y hora
        try {
            new Date(fechaSolicitud);
            new Date(horaEntrada);
            new Date(horaSalida);
        } catch (dateError) {
            console.error('Error en formato de fecha/hora:', dateError);
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha u hora inválido'
            });
        }

        // Validar que todos los campos requeridos estén presentes
        if (!horaEntrada || !horaSalida || !puntoReferencia || !fechaSolicitud) {
            console.log('Campos faltantes:', {
                horaEntrada: !horaEntrada,
                horaSalida: !horaSalida,
                puntoReferencia: !puntoReferencia,
                fechaSolicitud: !fechaSolicitud
            });
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Si se está usando una dirección alternativa, validar que esté presente
        if (usarDireccionAlternativa && !direccionAlternativa) {
            return res.status(400).json({ 
                success: false,
                message: 'La dirección alternativa es requerida cuando se selecciona usar dirección alternativa' 
            });
        }

        // Obtener el ID del pasajero del token
        const userId = req.user.pasajeroId;
        console.log('ID del pasajero:', userId);

        if (!userId) {
            console.error('ID de usuario no encontrado en el token');
            return res.status(400).json({
                success: false,
                message: 'ID de usuario no encontrado en el token'
            });
        }

        // Verificar si el usuario existe en la tabla pasajeros
        try {
            const [pasajero] = await connection.query('SELECT * FROM pasajeros WHERE idPasajero = ?', [userId]);
            console.log('Resultado de búsqueda de pasajero:', JSON.stringify(pasajero, null, 2));

            if (pasajero.length === 0) {
                console.log('Usuario no encontrado en la tabla pasajeros');
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
        } catch (queryError) {
            console.error('Error al buscar usuario:', queryError);
            throw new Error('Error al verificar usuario en la base de datos');
        }

        // Iniciar transacción
        await connection.beginTransaction();
        console.log('Transacción iniciada');

        try {
            // Primero creamos el detalle de transporte
            const detalleQuery = `
                INSERT INTO detalle_generartransporte (
                    idPasajero_fk2
                ) VALUES (?)
            `;

            console.log('Query detalle a ejecutar:', detalleQuery);
            console.log('Valores a insertar en detalle:', [userId]);

            const [detalleResult] = await connection.query(detalleQuery, [userId]);
            console.log('Resultado de la inserción del detalle:', JSON.stringify(detalleResult, null, 2));

            if (!detalleResult.insertId) {
                throw new Error('No se pudo obtener el ID del detalle insertado');
            }

            // Luego creamos el transporte
            const transporteQuery = `
                INSERT INTO generartransporte (
                    HoraEntrada,
                    HoraSalida,
                    PuntoReferencia,
                    FechaSolicitud,
                    DireccionAlternativa,
                    idDetalle_GenerarTransporte
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            // Formatear las fechas para MySQL
            const formatDateForMySQL = (dateString) => {
                const date = new Date(dateString);
                return date.toISOString().slice(0, 19).replace('T', ' ');
            };

            const valoresTransporte = [
                formatDateForMySQL(horaEntrada),
                formatDateForMySQL(horaSalida),
                puntoReferencia,
                fechaSolicitud,
                usarDireccionAlternativa ? direccionAlternativa : null,
                detalleResult.insertId
            ];

            console.log('Query transporte a ejecutar:', transporteQuery);
            console.log('Valores a insertar en transporte:', JSON.stringify(valoresTransporte, null, 2));

            try {
                const [transporteResult] = await connection.query(transporteQuery, valoresTransporte);
                console.log('Resultado de la inserción del transporte:', JSON.stringify(transporteResult, null, 2));

                if (!transporteResult.insertId) {
                    throw new Error('No se pudo obtener el ID del transporte insertado');
                }

                // Actualizamos el detalle con el ID del transporte
                const updateDetalleQuery = `
                    UPDATE detalle_generartransporte 
                    SET idGenerarTransporte_fk2 = ? 
                    WHERE idDetalle_GenerarTransporte = ?
                `;

                const updateValues = [transporteResult.insertId, detalleResult.insertId];
                console.log('Query actualización detalle:', updateDetalleQuery);
                console.log('Valores para actualización:', JSON.stringify(updateValues, null, 2));

                await connection.query(updateDetalleQuery, updateValues);
                console.log('Detalle actualizado con el ID del transporte');

                // Confirmar transacción
                await connection.commit();
                console.log('Transacción confirmada');

                res.status(201).json({
                    success: true,
                    message: 'Solicitud de transporte creada exitosamente',
                    solicitudId: transporteResult.insertId
                });
            } catch (dbError) {
                // Revertir transacción en caso de error
                await connection.rollback();
                console.error('Error en la operación de base de datos:', dbError);
                console.error('Stack trace del error de DB:', dbError.stack);
                console.error('Código de error:', dbError.code);
                console.error('Mensaje de error:', dbError.message);
                console.error('Estado SQL:', dbError.sqlState);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear la solicitud de transporte',
                    error: dbError.message
                });
            }
        } catch (dbError) {
            // Revertir transacción en caso de error
            await connection.rollback();
            console.error('Error en la operación de base de datos:', dbError);
            console.error('Stack trace del error de DB:', dbError.stack);
            res.status(500).json({
                success: false,
                message: 'Error al crear la solicitud de transporte',
                error: dbError.message
            });
        }
    } catch (error) {
        console.error('Error detallado al crear solicitud de transporte:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error al crear la solicitud de transporte',
            error: error.message
        });
    } finally {
        // Liberar la conexión
        if (connection) {
            try {
                await connection.release();
                console.log('Conexión liberada');
            } catch (releaseError) {
                console.error('Error al liberar la conexión:', releaseError);
            }
        }
    }
});

module.exports = router; 