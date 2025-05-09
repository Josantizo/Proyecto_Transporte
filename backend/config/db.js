const mysql = require('mysql2');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors());
app.use(express.json());

// Usar un Pool de conexiones en lugar de createConnection para mayor rendimiento
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Programacion_2003',
    database: 'transporte',
    waitForConnections: true,
    connectionLimit: 10, // Número máximo de conexiones simultáneas
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

app.listen(3001, () => {
    console.log('Servidor backend corriendo en el puerto 3001');
});
