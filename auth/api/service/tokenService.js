'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User');
var logger = require('../../logConfig.js')

exports.getServiceType = function(userName, callback) {
    var query = {user_name: userName};
    var code = 0;
    User.findOne(query, function(err, user) {
        if (err) {
            logger.error(err);
            callback(code, undefined, err);
        }
        else if (user == null) {
            callback(1, [], undefined);
        }
        else {
            User.aggregate(
              // select the fields we want to deal with
              {$project: {user_name: 1, service_type: 1}},
              // group everything by the user_name
              {$group: {
                _id: {user_name: userName},
                service_type: {$addToSet: '$service_type'}
              }},
              function(err, result) {
                if (err) {
                    logger.error(err);
                    callback(0, undefined, err);
                }
                console.log(result);
                if (result == null) {
                    callback(1, [], undefined);
                }
                else {
                    console.log(result[0].service_type);
                    callback(1, result[0].service_type, undefined);
                }
              });
            
        }
    });

};

exports.getUser = function(userName, serviceType, callback) {
  var query = {user_name: userName, service_type: serviceType};
  User.findOne(query, function(err, user) {
    if (err) {
      logger.error(err);
      callback(0, err);
    }
    else if (user == null) {
      callback(1, "user not exist");
    }
    else {
      callback(2, user.token);
    }
  })
};