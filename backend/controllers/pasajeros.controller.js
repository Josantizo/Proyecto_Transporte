const db = require('../config/db');

// Obtener todos los pasajeros
const obtenerPasajeros = (req, res) => {
  db.query('SELECT * FROM pasajeros', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtener un pasajero por ID
const obtenerPasajeroPorId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM pasajeros WHERE idPasajero = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Pasajero no encontrado' });
    res.json(results[0]);
  });
};

// Crear un nuevo pasajero
const crearPasajero = (req, res) => {
  const pasajero = req.body;
  const sql = `
    INSERT INTO pasajeros 
    (BMS, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, NumeroTelefono, horaEntrada, horaSalida, Direccion, puntoReferencia) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    pasajero.BMS,
    pasajero.PrimerNombre,
    pasajero.SegundoNombre,
    pasajero.PrimerApellido,
    pasajero.SegundoApellido,
    pasajero.NumeroTelefono,
    pasajero.horaEntrada,
    pasajero.horaSalida,
    pasajero.Direccion,
    pasajero.puntoReferencia
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ idPasajero: result.insertId, ...pasajero });
  });
};

// Actualizar pasajero por ID
const actualizarPasajero = (req, res) => {
  const { id } = req.params;
  const pasajero = req.body;

  const sql = `
    UPDATE pasajeros SET 
    BMS = ?, PrimerNombre = ?, SegundoNombre = ?, PrimerApellido = ?, SegundoApellido = ?, 
    NumeroTelefono = ?, horaEntrada = ?, horaSalida = ?, Direccion = ?, puntoReferencia = ?
    WHERE idPasajero = ?
  `;

  const values = [
    pasajero.BMS,
    pasajero.PrimerNombre,
    pasajero.SegundoNombre,
    pasajero.PrimerApellido,
    pasajero.SegundoApellido,
    pasajero.NumeroTelefono,
    pasajero.horaEntrada,
    pasajero.horaSalida,
    pasajero.Direccion,
    pasajero.puntoReferencia,
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Pasajero no encontrado' });
    res.json({ mensaje: 'Pasajero actualizado correctamente' });
  });
};

// Eliminar pasajero por ID
const eliminarPasajero = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM pasajeros WHERE idPasajero = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Pasajero no encontrado' });
    res.json({ mensaje: 'Pasajero eliminado correctamente' });
  });
};

module.exports = {
  obtenerPasajeros,
  obtenerPasajeroPorId,
  crearPasajero,
  actualizarPasajero,
  eliminarPasajero
};
