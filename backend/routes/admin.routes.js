const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/login.controller');
const { getTransportRequests, updateTransportRequestStatus } = require('../controllers/admin.controller');

// Middleware para verificar que el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
    }
};

// Rutas protegidas para administradores
router.get('/transport-requests', verifyToken, isAdmin, getTransportRequests);
router.put('/transport-requests/:id/status', verifyToken, isAdmin, updateTransportRequestStatus);

module.exports = router; 