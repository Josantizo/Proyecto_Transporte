const mysql = require('mysql2');
require('dotenv').config();

// Usar un Pool de conexiones en lugar de createConnection para mayor rendimiento
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'transporte_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convertir el pool en una promesa
const db = pool.promise();

// Probar la conexión
db.getConnection()
    .then(() => console.log('Conectado a MySQL'))
    .catch((err) => console.error('Error de conexión: ', err));

// Exportar la conexión para usarla en otros archivos
module.exports = db;
