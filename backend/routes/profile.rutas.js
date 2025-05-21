const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updatePassword, updateProfile } = require('../controllers/profile.controller');

// Ruta para obtener el perfil del usuario
router.get('/profile', auth, getProfile);

// Ruta para actualizar la contraseña
router.put('/update-password', auth, updatePassword);

// Ruta para actualizar el perfil
router.put('/update-profile', auth, updateProfile);

module.exports = router; 