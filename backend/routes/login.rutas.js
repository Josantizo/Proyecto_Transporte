const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller');

// Logging middleware para rutas de login
router.use((req, res, next) => {
    console.log('Login route accessed:', req.method, req.path);
    next();
});

// Ruta de prueba para login
router.post('/test-login', (req, res) => {
    console.log('Datos recibidos:', req.body);
    res.json({ 
        message: 'Datos recibidos correctamente',
        receivedData: req.body
    });
});

// Ruta de registro con validaciones
router.post('/register',
    loginController.validateRegister,
    loginController.registerUser
);

// Ruta de login con rate limiting y validaciones
router.post('/',
    loginController.loginLimiter,
    loginController.validateLogin,
    loginController.loginUser
);

// Ruta de ejemplo protegida
router.get('/profile',
    loginController.verifyToken,
    (req, res) => {
        res.json({ message: 'Ruta protegida', user: req.user });
    }
);

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ message: 'Login routes funcionando correctamente' });
});

module.exports = router;
