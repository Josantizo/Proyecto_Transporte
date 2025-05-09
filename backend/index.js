const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes'); // Importamos las rutas

app.use(cors());
app.use(express.json());

// Usar las rutas
app.use('/api', routes);

// Puerto del servidor
app.listen(3001, () => {
    console.log('Servidor backend corriendo en el puerto 3001');
});
