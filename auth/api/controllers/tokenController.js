'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User');
var tokenService = require('../service/tokenService');
var oauth2Client = require('../lib/oauth2Client');
var httpRequestClient = require('../lib/httpRequest2');
var SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];
var logger = require('../../logConfig.js')


function new_user(tokens, email, imageUrl, res, cb) {
    // console.log(email);
    // console.log(tokens);
    var new_user = new User({user_name: email, service_type: 'google', 
        token: tokens.access_token,
        refresh_token: tokens.refresh_token, 
        expiry_date: tokens.expiry_date,
        image_url: imageUrl});
    var update_user = {token: tokens.access_token,  
        refresh_token: tokens.refresh_token, 
        expiry_date: tokens.expiry_date,
        image_url: imageUrl};
    var query = {user_name: email};
    User.findOne(query, function(err, user) {
        if (user == null) {
            new_user.save(function(err1, user1){
                if (err1) {
                    return res.json({status: 0, message: err1});
                }
                metadata(user1.user_name, user1.service_type, user1.token, user1.refresh_token, user1.modified_time);
                // cb(user1.user_name, user1.service_type, user1.token, user1.refresh_token, user1.modified_time);
                return handleSuccess(res, user, user1);
            }); 
        }
        else {
            User.findOneAndUpdate(query, update_user, function(err2, user2) {
                if (err2) {
                    return res.send(err2);
                }
                metadata(user2.user_name, user2.service_type, user2.token, user2.refresh_token, user2.modified_time);
                // cb(user2.user_name, user2.service_type, user2.token, user2.refresh_token, user2.modified_time);
                return handleSuccess(res, user, user2);
            })
        }
        // res.send(err);
    });
}

function read_user(email, service_type, res, callback) {
    var query = {user_name: email, service_type: service_type};
    User.findOne(query, function(err, user) {
        if (user == null) {
            return handleError(res, email + " " + service_type + " not exist");
        }
        else if (err) {
            return handleError(res, email + " " + service_type + err);
            }
        else {
            var token = user.token;
            var refresh_token = user.refresh_token;
            // console.log("read_user: token: " + token);
            // console.log("read_user: refresh_token " + refresh_token);
            var expiry_date = user.expiry_date.getTime();
            // console.log("read_user: expiry_date: " + expiry_date);
            // console.log("read_user: now: " + Date.now());
            // metadata(user.user_name, user.service_type, user.token, user.refresh_token, user.modified_time);
            // if (Date.now() > expiry_date) {
            //     callback(res, token, refresh_token); 
            // }
            // else {
            //     return res.json({status:1, token: token});
            // }
            return res.json({status:1, token:token, refresh_token: refresh_token});
        }
    })
};

function get_user(email, service_type, res, callback) {
    var query = {user_name: email, service_type: service_type};
    User.findOne(query, function(err, user) {
        if (user == null) {
            logger.error(email + " " + service_type + " not exist");
        }
        else if (err) {
            logger.error(email + " " + service_type + err);
            }
        else {
            var token = user.token;
            var refresh_token = user.refresh_token;
            // console.log("read_user: token: " + token);
            // console.log("read_user: refresh_token " + refresh_token);
            var expiry_date = user.expiry_date.getTime();
            // console.log("read_user: expiry_date: " + expiry_date);
            // console.log("read_user: now: " + Date.now());
            var modified_time = user.modified_time;
            callback(email, res, token, refresh_token, modified_time);
        }
    })
}

function update_user(email, service_type, res, new_token, new_refresh, expiry_date) {
    logger.info("update token variables for: " + email + "|" + service_type);
    var query = {user_name: email, service_type: service_type};
    User.findOne(query, function(err, user) {
        if (err) {
            return res.json({status: 0, message: email + " " + service_type + err});
        }
        else {
            user.set({token: new_token, refresh_token: new_refresh, expiry_date: expiry_date});
            user.save(function (err2, updatedUser) {
                if (err) handleError(res, email + " " + service_type + err);
                else
                    handleSuccess(res, user, updatedUser);
            });
        }
    });
}

function update_modified_time(email, service_type, modified_time) {
    var query = {user_name: email, service_type: service_type};
    User.findOne(query, function(err, user) {
        if (err) {
            logger.error(err);
        }
        else {
            user.set({modified_time: new Date(modified_time)});
            user.save(function (err2, updatedUser) {
                if (err)
                    logger.error(err); 
                else
                    logger.info(updatedUser);
            });
        }
    });
}

function handleError(res, err) {
    return res.json({status: 0, message: err});
}

function handleSuccess(res, key, message) {
    return res.json({status: 1, message: message});
}

function buildres(res, url) {
    res.json({status:1, authurl: url});
}

exports.create_a_user = function(req, res) {
    logger.info("create_a_user");
    var url = '';
    // sampleClient.execute(SCOPES, function (url) {
    //     buildres(res, url);
    // });
    oauth2Client.execute(SCOPES, function (url) {
        buildres(res, url);
    });
};

exports.create_a_token = function(req, res) {
    // console.log(req);
    var code = req.headers.code;
    logger.info("create_a_token: code:" + code);
    // console.log(code);
    var service_type = req.params.serviceType;
    if (service_type != "google")
        return handleError(res, "not support other service type")
    // sampleClient.handler(req, res, code, function (tokens, email) {
    oauth2Client.handler(req, res, code, function (tokens, email, imageUrl) {
        new_user(tokens, email, imageUrl, res, function(user_name, service_type, token, refresh_token, modified_time) {
            metadata(user_name, service_type, token, refresh_token, modified_time);
        });
    });
}

exports.read_a_token = function(req, res) {
    var email = req.params.userName;
    var service_type = req.params.serviceType;
    logger.info("read_a_token:" + email + "|" + service_type);
    // console.log("read_a_token: email: " + email);
    // console.log("read_a_token: service_type: " + service_type);
    read_user(email, service_type, res, function (res, token, refresh_token) {
        oauth2Client.refreshabc(res, token, refresh_token, function (new_token, new_refresh, expiry_date) {
                    update_user(email, service_type, res, new_token, new_refresh, expiry_date);
                });
    });
};

// get metadata from oauth2Client
function metadata(email, service_type, token, refresh_token, modified_time) {
    // console.log("------------");
    // console.log(modified_time);
    var query = "modifiedTime > '" + new Date(modified_time).toISOString() + "' and mimeType contains 'image/'";
    logger.debug(query);
    var params = {
      corpora: "user",
      orderBy: "modifiedTime",
      pageSize: 5,
      spaces: "photos",
      supportsTeamDrives: false,
      // fields: "files(createdTime, description, fileExtension, fullFileExtension, id, imageMediaMetadata,md5Checksum, modifiedTime, owners, size, webContentLink, webViewLink), nextPageToken",
      fields: "files, nextPageToken",
      q: query
    };
    oauth2Client.get_metadata(params, email, token, refresh_token, function(modified_time1) {
        update_modified_time(email, service_type, modified_time1);
    });
    
};

exports.callback = function(req, res) {
    console.log("callback");
    res.json({message:'OK'});
};

exports.test2 = function(req, res) {
    var option = {mes: 'test'};
    httpRequestClient.sendpost(option);
    res.json({message:'OK'});
};

exports.get_user_service = function(req, res) {
    var userName = req.params.userName;
    logger.info("get_user_service:" + userName);
    tokenService.getServiceType(userName, function(code, obj, err){
        res.json({status: code, service_type: obj, message: err});
    });
};

exports.logout = function(req, res) {
    var userName = req.params.userName;
    var serviceType = req.params.serviceType;
    tokenService.getUser(userName, serviceType, function(code, message) {
        if (code == 0) {
            res.json({status: 0, err: message});
        }
        else if (code == 1) {
            res.json({status: 0, err: message});
        }
        else {
            var url = "https://accounts.google.com/o/oauth2/revoke?token=" + message;
            console.log(url);
            httpRequestClient.sendget(url, "");
            res.json({status: 1});
        }
    });
};
