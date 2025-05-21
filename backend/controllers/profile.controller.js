const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
    try {
        console.log('User ID from token:', req.user.id);
        
        const [rows] = await db.query(
            'SELECT l.CorreoEmpresarial, p.Direccion, p.puntoReferencia, p.NumeroTelefono, l.ultimaActualizacionPassword FROM login l JOIN pasajeros p ON l.idPasajero_fk = p.idPasajero WHERE l.idLogin = ?',
            [req.user.id]
        );

        console.log('Query result:', rows);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil' });
    }
};

const updatePassword = async (req, res) => {
    const { contraseñaActual, nuevaContraseña } = req.body;

    try {
        // Obtener usuario actual
        const [user] = await db.query(
            'SELECT Contraseña, ultimaActualizacionPassword FROM login WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(contraseñaActual, user.Contraseña);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Contraseña actual incorrecta' });
        }

        // Verificar si han pasado 3 meses desde la última actualización
        const ultimaActualizacion = new Date(user.ultimaActualizacionPassword);
        const tresMesesAtras = new Date();
        tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

        if (ultimaActualizacion > tresMesesAtras) {
            return res.status(400).json({ 
                message: 'No puedes actualizar la contraseña antes de 3 meses desde la última actualización' 
            });
        }

        // Encriptar nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nuevaContraseña, salt);

        // Actualizar contraseña
        await db.query(
            'UPDATE login SET Contraseña = ?, ultimaActualizacionPassword = NOW() WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }
};

const updateProfile = async (req, res) => {
    const { Direccion, puntoReferencia, NumeroTelefono } = req.body;

    try {
        console.log('Updating profile for user ID:', req.user.id);
        console.log('Update data:', { Direccion, puntoReferencia, NumeroTelefono });

        // Primero obtenemos el idPasajero_fk del usuario
        const [loginData] = await db.query(
            'SELECT idPasajero_fk FROM login WHERE idLogin = ?',
            [req.user.id]
        );

        console.log('Login data:', loginData);

        if (!loginData || loginData.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const idPasajero = loginData[0].idPasajero_fk;

        // Actualizamos los datos en la tabla pasajeros
        const [result] = await db.query(
            'UPDATE pasajeros SET Direccion = ?, puntoReferencia = ?, NumeroTelefono = ? WHERE idPasajero = ?',
            [Direccion, puntoReferencia, NumeroTelefono, idPasajero]
        );

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No se pudo actualizar el perfil' });
        }

        res.json({ message: 'Perfil actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error al actualizar el perfil' });
    }
};

module.exports = {
    getProfile,
    updatePassword,
    updateProfile
}; 