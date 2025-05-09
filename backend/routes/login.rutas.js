const express = require('express');
const loginController = require('./controllers/loginController');
const router = express.Router();

// Rutas para el login y registro de usuarios
router.post('/register', loginController.registerUser); // Ruta para registrar un nuevo usuario
router.post('/login', loginController.loginUser); // Ruta para iniciar sesión

module.exports = router;
