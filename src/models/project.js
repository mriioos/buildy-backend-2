const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
    deleted : { // deleted = true means Archived
        type : Boolean,
        default : false
    },
}, 
{
    timestamps : true
});

projectSchema.index({ client_id : 1, name : 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);