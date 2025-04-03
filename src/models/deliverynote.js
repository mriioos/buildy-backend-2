const mongoose = require('mongoose');

const deliveryNoteSchema = new mongoose.Schema({
    proyect_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Proyect',
        required : true
    },
    data : {
        type : [{
            type : {
                type : String,
                enum : ['person', 'material'],
                required : true
            },
            name : {        // Nombre del trabajador o material
                type : String,
                required : true
            },
            quantity : {    // Horas o precio del material
                type : Number,
                required : true
            },
        }]
    }
});
