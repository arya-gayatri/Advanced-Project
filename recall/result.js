var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ResultSchema = new Schema({
    momentid: String,
    passed: Boolean,
    warmness: Number,
    tenderness: Number,
    connection : Number,
    frontenddata: Object
});
module.exports = mongoose.model('Result', ResultSchema);
