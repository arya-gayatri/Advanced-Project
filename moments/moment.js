var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MomentSchema = new Schema({
    momentId: String,
    momentIndex: String,
    assistantInputs: Object,
    MLInputs: Object,
    rawMetadata: Object,
    chosenMetadata: Object,
    momentSource: String,
    isProcessed: Boolean,
    initialTimeStamp: Date,
    isAccessible: Boolean,
    isTrashed: Boolean,
    imageURL : String,
    isLastMoment: Boolean,
    userName : String
});
module.exports = mongoose.model('Moment', MomentSchema);

