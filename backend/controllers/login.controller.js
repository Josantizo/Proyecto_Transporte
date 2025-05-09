const db = require('../config/db'); // Importamos la conexión desde db.js
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
    const { CorreoEmpresarial, Contraseña, BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia } = req.body;

    try {
        // Verificar si el correo ya está registrado
        const [existingLogin] = await db.execute('SELECT * FROM login WHERE CorreoEmpresarial = ?', [CorreoEmpresarial]);
        if (existingLogin.length > 0) {
            return res.status(400).json({ message: 'Este correo ya está registrado' });
        }

        // Crear el pasajero primero
        const [pasajeroResult] = await db.execute(
            'INSERT INTO pasajeros (BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia]
        );
        
        const idPasajero = pasajeroResult.insertId; // ID del pasajero recién creado
        
        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(Contraseña, 10);
        
        // Crear el login y asociarlo con el pasajero
        const [loginResult] = await db.execute(
            'INSERT INTO login (CorreoEmpresarial, Contraseña, idPasajero_fk) VALUES (?, ?, ?)',
            [CorreoEmpresarial, hashedPassword, idPasajero]
        );
        
        res.status(201).json({ message: 'Usuario registrado correctamente', loginId: loginResult.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
};

exports.loginUser = async (req, res) => {
    const { CorreoEmpresarial, Contraseña } = req.body;

    try {
        // Buscar el login por correo
        const [loginData] = await db.execute('SELECT * FROM login WHERE CorreoEmpresarial = ?', [CorreoEmpresarial]);
        
        if (loginData.length === 0) {
            return res.status(400).json({ message: 'Correo no registrado' });
        }

        // Comparar la contraseña encriptada
        const isMatch = await bcrypt.compare(Contraseña, loginData[0].Contraseña);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // El usuario está autenticado
        res.status(200).json({ message: 'Inicio de sesión exitoso', userId: loginData[0].idLogin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};
