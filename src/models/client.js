const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    email : {
        type : String,
        required : true
    },
    name : {
        type : String,
        default : ''
    },
    lastname : {
        type : String,
        default : ''
    },
    address : {
        type : String,
        default : ''
    },
    deleted : { // deleted = true means Archived
        type : Boolean,
        default : false
    },
}, 
{
    timestamps : true
});

// Make client unique for the user
clientSchema.index({ user_id : 1, email : 1 }, { unique: true });

module.exports = mongoose.model('Client', clientSchema);