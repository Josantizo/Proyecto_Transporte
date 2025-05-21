const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

// Configuración del rate limiter para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: 'Demasiados intentos de inicio de sesión, por favor intente más tarde'
});

// Middleware para validar el registro
const validateRegister = [
    body('CorreoEmpresarial').isEmail().withMessage('Correo electrónico inválido'),
    body('Contraseña').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('BMS').notEmpty().withMessage('El BMS es requerido'),
    body('PrimerNombre').notEmpty().withMessage('El primer nombre es requerido'),
    body('PrimerApellido').notEmpty().withMessage('El primer apellido es requerido'),
    body('NumeroTelefono').notEmpty().withMessage('El número de teléfono es requerido'),
    body('Direccion').notEmpty().withMessage('La dirección es requerida'),
    body('puntoReferencia').notEmpty().withMessage('El punto de referencia es requerido')
];

// Middleware para validar el login
const validateLogin = [
    body('CorreoEmpresarial').isEmail().withMessage('Correo electrónico inválido'),
    body('Contraseña').notEmpty().withMessage('La contraseña es requerida')
];

// Función para registrar un nuevo usuario
const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { 
            CorreoEmpresarial, 
            Contraseña, 
            BMS, 
            PrimerNombre, 
            SegundoNombre, 
            PrimerApellido, 
            SegundoApellido, 
            NumeroTelefono, 
            Direccion, 
            puntoReferencia 
        } = req.body;

        // Verificar si el correo ya está registrado
        const [existingLogin] = await db.query('SELECT * FROM login WHERE CorreoEmpresarial = ?', [CorreoEmpresarial]);
        if (existingLogin.length > 0) {
            return res.status(400).json({ message: 'Este correo ya está registrado' });
        }

        // Insertar el pasajero primero
        const [pasajeroResult] = await db.query(
            'INSERT INTO pasajeros (BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [BMS, PrimerNombre, SegundoNombre || null, PrimerApellido, SegundoApellido || null, NumeroTelefono, Direccion, puntoReferencia]
        );
        
        const idPasajero = pasajeroResult.insertId;
        
        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Contraseña, salt);

        // Insertar el login con rol por defecto
        const [loginResult] = await db.query(
            'INSERT INTO login (CorreoEmpresarial, Contraseña, idPasajero_fk, rol) VALUES (?, ?, ?, ?)',
            [CorreoEmpresarial, hashedPassword, idPasajero, 'usuario']
        );

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente',
            loginId: loginResult.insertId,
            pasajeroId: idPasajero
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Función para iniciar sesión
const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { CorreoEmpresarial, Contraseña } = req.body;
        console.log('Login attempt for:', CorreoEmpresarial);

        // Buscar el usuario en la tabla login
        const [loginData] = await db.query(
            'SELECT l.*, p.* FROM login l JOIN pasajeros p ON l.idPasajero_fk = p.idPasajero WHERE l.CorreoEmpresarial = ?',
            [CorreoEmpresarial]
        );

        console.log('Login query result:', loginData);

        if (loginData.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const user = loginData[0];

        // Verificar la contraseña
        const validPassword = await bcrypt.compare(Contraseña, user.Contraseña);
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar el token JWT
        const token = jwt.sign(
            { 
                id: user.idLogin, 
                email: user.CorreoEmpresarial,
                rol: user.rol
            },
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '24h' }
        );

        console.log('Generated token payload:', { 
            id: user.idLogin, 
            email: user.CorreoEmpresarial,
            rol: user.rol
        });

        res.json({
            token,
            user: {
                id: user.idLogin,
                email: user.CorreoEmpresarial,
                rol: user.rol,
                pasajero: {
                    id: user.idPasajero,
                    BMS: user.BMS,
                    nombre: `${user.PrimerNombre} ${user.SegundoNombre || ''}`.trim(),
                    apellido: `${user.PrimerApellido} ${user.SegundoApellido || ''}`.trim(),
                    telefono: user.NumeroTelefono,
                    direccion: user.Direccion,
                    puntoReferencia: user.puntoReferencia
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token inválido' });
    }
};

module.exports = {
    loginLimiter,
    validateRegister,
    validateLogin,
    registerUser,
    loginUser,
    verifyToken
};
