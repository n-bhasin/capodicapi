const mongoose = require('mongoose');
const moment = require('moment');
const chatSchema = new mongoose.Schema({
   
    sender: {type: String, require:true},
    message: {type: String, require: true},
    room: {type: String, require: true},
    date: {type: String, require: true},
    time: {type: String, require: true},
})

chatSchema
.virtual('date_formatted')
.get(function () {
  return moment(this.dateTime).format('MMMM Do, YYYY');
});

module.exports = mongoose.model('Chat', chatSchema);