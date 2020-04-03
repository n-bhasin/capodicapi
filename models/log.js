const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    logType: {type: String, require:true},
    name: {type:String, require:true},
    message: {type: String, require:true},
    // userId: {type: Schema.Types.ObjectId, ref: 'Chat', require:true},
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Log', logSchema);