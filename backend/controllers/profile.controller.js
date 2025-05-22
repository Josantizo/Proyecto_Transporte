const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
    try {
        console.log('User data from token:', req.user);
        
        // Verificar que req.user.pasajeroId existe
        if (!req.user.pasajeroId) {
            console.error('No pasajeroId found in token');
            return res.status(400).json({ message: 'Token inválido: no contiene ID de pasajero' });
        }

        const query = `
            SELECT l.CorreoEmpresarial, p.Direccion, p.NumeroTelefono, l.ultimaActualizacionPassword 
            FROM login l 
            JOIN pasajeros p ON l.idPasajero_fk = p.idPasajero 
            WHERE p.idPasajero = ?
        `;
        
        console.log('Executing query:', query);
        console.log('With params:', [req.user.pasajeroId]);

        const [rows] = await db.query(query, [req.user.pasajeroId]);

        console.log('Query result:', rows);

        if (!rows || rows.length === 0) {
            console.log('No user found with ID:', req.user.pasajeroId);
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error al obtener el perfil' });
    }
};

const updatePassword = async (req, res) => {
    const { contraseñaActual, nuevaContraseña } = req.body;

    try {
        // Obtener usuario actual
        const [user] = await db.query(
            'SELECT l.Contraseña, l.ultimaActualizacionPassword FROM login l JOIN pasajeros p ON l.idPasajero_fk = p.idPasajero WHERE p.idPasajero = ?',
            [req.user.pasajeroId]
        );

        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(contraseñaActual, user[0].Contraseña);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Contraseña actual incorrecta' });
        }

        // Verificar si han pasado 3 meses desde la última actualización
        const ultimaActualizacion = new Date(user[0].ultimaActualizacionPassword);
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
            'UPDATE login l JOIN pasajeros p ON l.idPasajero_fk = p.idPasajero SET l.Contraseña = ?, l.ultimaActualizacionPassword = NOW() WHERE p.idPasajero = ?',
            [hashedPassword, req.user.pasajeroId]
        );

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }
};

const updateProfile = async (req, res) => {
    const { Direccion, NumeroTelefono } = req.body;

    try {
        console.log('Updating profile for user ID:', req.user.pasajeroId);
        console.log('Update data:', { Direccion, NumeroTelefono });

        // Actualizamos los datos en la tabla pasajeros
        const [result] = await db.query(
            'UPDATE pasajeros SET Direccion = ?, NumeroTelefono = ? WHERE idPasajero = ?',
            [Direccion, NumeroTelefono, req.user.pasajeroId]
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