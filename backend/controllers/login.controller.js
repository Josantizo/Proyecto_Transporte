const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Configuración del rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: { message: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.' }
});

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro';
const JWT_EXPIRES_IN = '24h';

// Validaciones para el registro
exports.validateRegister = [
    body('CorreoEmpresarial')
        .isEmail()
        .withMessage('El correo electrónico no es válido')
        .normalizeEmail(),
    body('Contraseña')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
    body('BMS').notEmpty().withMessage('El BMS es requerido'),
    body('PrimerNombre').notEmpty().withMessage('El primer nombre es requerido'),
    body('PrimerApellido').notEmpty().withMessage('El primer apellido es requerido'),
    body('NumeroTelefono').isMobilePhone().withMessage('El número de teléfono no es válido'),
    body('Direccion').notEmpty().withMessage('La dirección es requerida')
];

// Validaciones para el login
exports.validateLogin = [
    body('CorreoEmpresarial')
        .isEmail()
        .withMessage('El correo electrónico no es válido')
        .normalizeEmail(),
    body('Contraseña').notEmpty().withMessage('La contraseña es requerida')
];

exports.registerUser = async (req, res) => {
    const { CorreoEmpresarial, Contraseña, BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia } = req.body;

    try {
        // Verificar si el correo ya está registrado
        const [existingLogin] = await db.execute('SELECT * FROM login WHERE CorreoEmpresarial = ?', [CorreoEmpresarial]);
        if (existingLogin.length > 0) {
            return res.status(400).json({ message: 'Este correo ya está registrado' });
        }

        const [pasajeroResult] = await db.execute(
            'INSERT INTO pasajeros (BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia]
        );
        
        const idPasajero = pasajeroResult.insertId; // ID del pasajero recién creado
        
        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(Contraseña, 10);

        const [loginResult] = await db.execute(
            'INSERT INTO login (CorreoEmpresarial, Contraseña, idPasajero_fk, rol) VALUES (?, ?, ?, ?)',
            [CorreoEmpresarial, hashedPassword, idPasajero, rol || 'usuario'] // Si no viene, por defecto es 'usuario'
        );
        
        res.status(201).json({ message: 'Usuario registrado correctamente', loginId: loginResult.insertId });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    // Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { CorreoEmpresarial, Contraseña } = req.body;

    try {
        const [loginData] = await db.execute(
            'SELECT * FROM login WHERE CorreoEmpresarial = ?',
            [CorreoEmpresarial]
        );

        if (loginData.length === 0) {
            return res.status(400).json({ message: 'Correo no registrado' });
        }

        const isMatch = await bcrypt.compare(Contraseña, loginData[0].Contraseña);

        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: loginData[0].idLogin, correo: CorreoEmpresarial },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Obtener información del pasajero
        const [pasajeroData] = await db.execute(
            'SELECT * FROM pasajeros WHERE idPasajero = ?',
            [loginData[0].idPasajero_fk]
        );

        // El usuario está autenticado
        res.status(200).json({ message: 'Inicio de sesión exitoso', userId: loginData[0].idLogin });
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// Exportar el rate limiter
exports.loginLimiter = loginLimiter;
