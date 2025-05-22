const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

// Crear una nueva solicitud de transporte
router.post('/create', authenticateToken, async (req, res) => {
    try {
        console.log('=== Iniciando creación de solicitud de transporte ===');
        console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
        console.log('Usuario autenticado:', JSON.stringify(req.user, null, 2));

        const {
            horaEntrada,
            horaSalida,
            puntoReferencia,
            fechaSolicitud,
            direccionAlternativa,
            usarDireccionAlternativa
        } = req.body;

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
            return res.status(400).json({ message: 'La dirección alternativa es requerida cuando se selecciona usar dirección alternativa' });
        }

        // Obtener el ID del pasajero del token
        const userId = req.user.pasajeroId;
        console.log('ID del pasajero:', userId);

        // Verificar si el usuario existe en la tabla pasajeros
        const [pasajero] = await db.query('SELECT * FROM pasajeros WHERE idPasajero = ?', [userId]);
        console.log('Resultado de búsqueda de pasajero:', JSON.stringify(pasajero, null, 2));

        if (pasajero.length === 0) {
            console.log('Usuario no encontrado en la tabla pasajeros');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Primero creamos el detalle de transporte
        const detalleQuery = `
            INSERT INTO detalle_generartransporte (
                idPasajero_fk2
            ) VALUES (?)
        `;

        console.log('Query detalle a ejecutar:', detalleQuery);
        console.log('Valores a insertar en detalle:', [userId]);

        try {
            const [detalleResult] = await db.query(detalleQuery, [userId]);
            console.log('Resultado de la inserción del detalle:', JSON.stringify(detalleResult, null, 2));

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

            const valoresTransporte = [
                horaEntrada,
                horaSalida,
                puntoReferencia,
                fechaSolicitud,
                usarDireccionAlternativa ? direccionAlternativa : null,
                detalleResult.insertId
            ];

            console.log('Query transporte a ejecutar:', transporteQuery);
            console.log('Valores a insertar en transporte:', JSON.stringify(valoresTransporte, null, 2));

            const [transporteResult] = await db.query(transporteQuery, valoresTransporte);
            console.log('Resultado de la inserción del transporte:', JSON.stringify(transporteResult, null, 2));

            // Actualizamos el detalle con el ID del transporte
            const updateDetalleQuery = `
                UPDATE detalle_generartransporte 
                SET idGenerarTransporte_fk2 = ? 
                WHERE idDetalle_GenerarTransporte = ?
            `;

            const updateValues = [transporteResult.insertId, detalleResult.insertId];
            console.log('Query actualización detalle:', updateDetalleQuery);
            console.log('Valores para actualización:', JSON.stringify(updateValues, null, 2));

            await db.query(updateDetalleQuery, updateValues);
            console.log('Detalle actualizado con el ID del transporte');

            res.status(201).json({
                success: true,
                message: 'Solicitud de transporte creada exitosamente',
                solicitudId: transporteResult.insertId
            });
        } catch (dbError) {
            console.error('Error en la operación de base de datos:', dbError);
            console.error('Stack trace del error de DB:', dbError.stack);
            throw dbError; // Re-lanzamos el error para que sea capturado por el catch principal
        }
    } catch (error) {
        console.error('Error detallado al crear solicitud de transporte:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error al crear la solicitud de transporte',
            error: error.message
        });
    }
});

// Obtener todas las solicitudes de transporte del usuario
router.get('/my-requests', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.pasajeroId;
        console.log('Obteniendo solicitudes para el usuario:', userId);

        const query = `
            SELECT gt.* 
            FROM generartransporte gt
            JOIN detalle_generartransporte dgt ON gt.idDetalle_GenerarTransporte = dgt.idDetalle_GenerarTransporte
            WHERE dgt.idPasajero_fk2 = ? 
            ORDER BY gt.FechaSolicitud DESC, gt.HoraEntrada DESC
        `;
        
        const [solicitudes] = await db.query(query, [userId]);
        console.log('Solicitudes encontradas:', JSON.stringify(solicitudes, null, 2));
        
        res.json(solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las solicitudes de transporte',
            error: error.message
        });
    }
});

module.exports = router; 