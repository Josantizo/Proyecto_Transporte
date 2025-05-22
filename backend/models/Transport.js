const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fechaTransporte: {
        type: Date,
        required: true
    },
    horaEntrada: {
        type: String,
        required: true
    },
    horaSalida: {
        type: String,
        required: true
    },
    origen: {
        type: String,
        required: true
    },
    destino: {
        type: String,
        required: true
    },
    puntoReferencia: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'COMPLETADO', 'CANCELADO'],
        default: 'PENDIENTE'
    },
    coordenadas: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transport', transportSchema); 