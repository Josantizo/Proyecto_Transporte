const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transport = require('../models/Transport');

// Get user's transport requests
router.get('/user-requests', auth, async (req, res) => {
    try {
        const requests = await Transport.find({ userId: req.user.id })
            .sort({ fechaTransporte: -1 }); // Sort by date, newest first
        res.json(requests);
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ message: 'Error al obtener las solicitudes de transporte' });
    }
});

// Cancel transport request
router.delete('/cancel/:requestId', auth, async (req, res) => {
    try {
        const request = await Transport.findOne({
            _id: req.params.requestId,
            userId: req.user.id
        });

        if (!request) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        if (request.estado !== 'PENDIENTE') {
            return res.status(400).json({ message: 'Solo se pueden cancelar solicitudes pendientes' });
        }

        // Check if the request can be cancelled (3 hours before 3 PM)
        const requestDate = new Date(request.fechaTransporte);
        const acceptanceTime = new Date(request.fechaTransporte);
        acceptanceTime.setHours(15, 0, 0, 0); // 3:00 PM
        
        const threeHoursBefore = new Date(acceptanceTime.getTime() - (3 * 60 * 60 * 1000));
        const now = new Date();

        if (now >= threeHoursBefore) {
            return res.status(400).json({ 
                message: 'No se puede cancelar la solicitud (menos de 3 horas antes de la autorización)' 
            });
        }

        // Delete the request
        await Transport.findByIdAndDelete(req.params.requestId);
        res.json({ message: 'Solicitud cancelada exitosamente' });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ message: 'Error al cancelar la solicitud' });
    }
});

module.exports = router; 