const mysql = require('mysql2');
require('dotenv').config();

console.log('Database configuration:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'transporte'
});

// Usar un Pool de conexiones en lugar de createConnection para mayor rendimiento
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'canche2003',
    database: process.env.DB_NAME || 'transporte',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convertir el pool en una promesa
const db = pool.promise();

// Probar la conexión
db.getConnection()
    .then(connection => {
        console.log('Conectado a MySQL exitosamente');
        connection.release();
    })
    .catch(err => {
        console.error('Error de conexión a MySQL:', {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
        });
        process.exit(1); // Terminar la aplicación si no hay conexión a la base de datos
    });

// Manejar errores de conexión
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de conexiones:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('La conexión a la base de datos se perdió');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('La base de datos tiene demasiadas conexiones');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('La conexión a la base de datos fue rechazada');
    }
});

// Exportar la conexión para usarla en otros archivos
module.exports = db;
