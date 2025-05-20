const express = require('express');
const cors = require('cors');
const app = express();

console.log('Iniciando servidor...');

// Middleware básico
app.use(cors());
app.use(express.json());
console.log('Middleware básico configurado');

// Importar las rutas
const loginRoutes = require('./routes/login.rutas');
console.log('Rutas de login importadas');

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ruta de prueba simple
app.get('/test', (req, res) => {
    console.log('Ruta de prueba accedida');
    res.json({ message: 'Servidor funcionando' });
});

// Configurar las rutas de login
app.use('/api/login', loginRoutes);
console.log('Rutas de login configuradas');

// Manejo de rutas no encontradas
app.use((req, res) => {
    console.log('Ruta no encontrada:', req.method, req.url);
    res.status(404).json({ 
        message: 'Ruta no encontrada',
        path: req.url,
        method: req.method
    });
});

// Puerto del servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Rutas disponibles:');
    console.log('- GET /test');
    console.log('- POST /api/login');
    console.log('- POST /api/login/register');
    console.log('- GET /api/login/profile');
    console.log('=================================');
});
