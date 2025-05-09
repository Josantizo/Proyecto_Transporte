const express = require('express');
const router = express.Router();
const {
  obtenerPasajeros,
  obtenerPasajeroPorId,
  crearPasajero,
  actualizarPasajero,
  eliminarPasajero
} = require('../controllers/pasajerosController');

router.get('/', obtenerPasajeros);
router.get('/:id', obtenerPasajeroPorId);
router.post('/', crearPasajero);
router.put('/:id', actualizarPasajero);
router.delete('/:id', eliminarPasajero);

module.exports = router;
