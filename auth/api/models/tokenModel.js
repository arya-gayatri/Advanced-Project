'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
  user_name: {
    type: String,
    required: 'Kindly enter the name of the task'
  },

  created_date: {
    type: Date,
    default: Date.now
  },
  
  service_type: {
    type: String,
    default: ['google']
  },

  token: {
    type: String
  },

  refresh_token: {
    type: String
  },

  expiry_date: {
    type: Date
  },

  // get metadata last time
  modified_time: {
    type: Date,
    default: '1980-01-01T12:00:00'
  },

  image_url: {
    type: String,
    default: ''
  }

});

module.exports = mongoose.model('User', UserSchema);