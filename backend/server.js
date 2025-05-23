const express = require('express');
const cors = require('cors');
const loginRoutes = require('./routes/login.rutas');
const profileRoutes = require('./routes/profile.rutas');
const transportRoutes = require('./routes/transport');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/login', loginRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 