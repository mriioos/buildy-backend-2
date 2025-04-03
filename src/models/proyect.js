const mongoose = require('mongoose');

const proyectSchema = new mongoose.Schema({
    client_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    name : {
        type: String,
        required: true
    },
    description : {
        type: String,
        default: ''
    },
}, 
{
    timestamps : true
});

proyectSchema.index({ client_id : 1, name : 1 }, { unique: true });

module.exports = mongoose.model('Proyect', proyectSchema);