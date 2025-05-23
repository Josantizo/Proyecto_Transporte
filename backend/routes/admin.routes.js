const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/login.controller');
const { getTransportRequests, updateTransportRequestStatus } = require('../controllers/admin.controller');
const isAdmin = require('../middleware/isAdmin');

// Rutas protegidas para administradores
router.get('/transport-requests', verifyToken, isAdmin, getTransportRequests);
router.put('/transport-requests/:id/status', verifyToken, isAdmin, updateTransportRequestStatus);

module.exports = router; 