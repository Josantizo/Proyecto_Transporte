const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
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
        puntoReferencia,
        rol // <-- Nuevo campo
    } = req.body;

    try {
        const [existingLogin] = await db.execute(
            'SELECT * FROM login WHERE CorreoEmpresarial = ?',
            [CorreoEmpresarial]
        );

        if (existingLogin.length > 0) {
            return res.status(400).json({ message: 'Este correo ya está registrado' });
        }

        const [pasajeroResult] = await db.execute(
            'INSERT INTO pasajeros (BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, Direccion, puntoReferencia]
        );

        const idPasajero = pasajeroResult.insertId;

        const hashedPassword = await bcrypt.hash(Contraseña, 10);

        const [loginResult] = await db.execute(
            'INSERT INTO login (CorreoEmpresarial, Contraseña, idPasajero_fk, rol) VALUES (?, ?, ?, ?)',
            [CorreoEmpresarial, hashedPassword, idPasajero, rol || 'usuario'] // Si no viene, por defecto es 'usuario'
        );

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            loginId: loginResult.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
};

exports.loginUser = async (req, res) => {
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

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            userId: loginData[0].idLogin,
            rol: loginData[0].rol, // <-- Aquí se envía el rol al front
            idPasajero_fk: loginData[0].idPasajero_fk
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};
