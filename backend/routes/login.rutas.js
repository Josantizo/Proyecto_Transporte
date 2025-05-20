const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller');

// Ruta de registro con validaciones
router.post('/register',
    loginController.validateRegister,
    loginController.registerUser
);

// Ruta de login con rate limiting y validaciones
router.post('/login',
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

module.exports = router;
