const mongoose = require('mongoose');

const deliveryNoteSchema = new mongoose.Schema({
    project_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
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
    },
    signature : {
        type : String,
        default : null,
        required : false
    },
    deleted : { // deleted = true means Archived
        type : Boolean,
        default : false
    },
},
{
    timestamps : true
});

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);