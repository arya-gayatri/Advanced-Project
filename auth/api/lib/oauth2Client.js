'use strict';

const config = require('../../config');
var logger = require('../../logConfig.js');
var google = require('googleapis');
var async = require("async");

var prefix = config.get('PREFIX_PATH');
var OAuth2Client = google.auth.OAuth2;
var CLIENT_ID = config.get('OAUTH2_CLIENT_ID');
var CLIENT_SECRET = config.get('OAUTH2_CLIENT_SECRET');
var REDIRECT_URL = config.get('OAUTH2_CALLBACK');
var oauth2Client = new OAuth2Client(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );
var plus = google.plus('v1');
var drive = google.drive({version:'v3', auth:oauth2Client});
var fs = require('fs');

// Generating an authentication URL
module.exports.execute = function (scopes, callback) {
    // grab the url that will be used for authorization
    var url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
      approval_prompt: 'force'
    });
    callback(url);
  };

// Retrieve access token
module.exports.handler = function(request, response, code, callback) {
    var email;
    var imageUrl;
    oauth2Client.getToken(code, function (err, tokens) {
      if (err) {
        logger.error('Error getting oAuth tokens: ' + err);
        response.json({status: 0, message: err});
      }
      else {
        oauth2Client.setCredentials(tokens);
        plus.people.get({userId:'me', fields: "image,emails", auth: oauth2Client}, function(err, profile){
          if (err) {
            logger.error('Get profile err' + err);
            // console.log('Get profile err', err);
            response.json({status: 0, message: "Get profile error"});
          }
          // console.log(profile);
          email = profile.emails[0].value;
          imageUrl = profile.image.url;
          callback(tokens, email, imageUrl);
        })
      }
    });
  };

// refresh token
module.exports.refreshabc = function(response, token, refresh_token, callback) {
    // console.log("oauth2.refres: token: " + token);
    // console.log("oauth2.refresh: refresh_token: " + refresh_token);
    oauth2Client.setCredentials({
      access_token: token,
      refresh_token: refresh_token
    });

    oauth2Client.refreshAccessToken(function(err, tokens) {
      // console.log(tokens);
      if (err) {
        logger.error(err);
          // console.log(err);
        response.json({status:0, message: err});
      }
      else {
        // response.json({status:1, message: tokens});
        var new_token = tokens.access_token;
        var new_refresh = tokens.refresh_token;
        var expiry_date = tokens.expiry_date;
        callback(new_token, new_refresh, expiry_date);
      }
    });
  };

// Retrieve metadata and download photos
module.exports.get_metadata = function(params, email, token, refresh_token, callback) {
    logger.info("get_metadata" + email + "|" + token + "|" + refresh_token);
    // console.log(email + "|" + token + "|" + refresh_token);
    oauth2Client.setCredentials({
      access_token: token,
      refresh_token: refresh_token
    });
    
    // get metadata
    var modified_time = Date.UTC(2000, 1, 1, 0);
    var pageToken = null;
    var result_flag = false;
    // var dir = __dirname +'/uploads/google' ;
    var dir = prefix;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    async.doWhilst(function (cb) {
      params.pageToken = pageToken;
      var photoList = [];
      drive.files.list(params, function (err, result) {
        if (err) {
          logger.error(err);
          cb(err);
        }
        else {
          pageToken = result.nextPageToken;
          var len = result.files.length;
          if (pageToken == undefined && len > 0) {
            result_flag = true;
            modified_time = result.files[len-1].modifiedTime;
          }
          result.files.forEach(function (file) {
            // console.log(file.modifiedTime);
            // call batch-api-requests to send metadata to .... 
            // console.log(file.id);
            file.isLastMoment = result_flag;
            file.userName = email;
            file.service_type = "google";
            photoList.push(file.id);
            postClient.sendpost(file);       
          });
          // download(token, refresh_token, photoList, email, "google");
          console.log(pageToken);
          cb();
        }
      });
    }, function() {
      return !!pageToken;
    }, function (err) {
      if (err) {
        logger.error(err);
      }
      else {
        logger.info("all file fetched");
        if (result_flag) {
          callback(modified_time);
        }
      }
    });
    
  };

function download(token, refresh_token, photoList, email, serviceType) {
  oauth2Client.setCredentials({
      access_token: token,
      refresh_token: refresh_token
    });
  // var path = __dirname + '/uploads/'+ serviceType + '/' + fileId;
  drive = google.drive({version:'v3', auth:oauth2Client});

  async.eachSeries(photoList, function (fileId, callback) {
    var path = prefix + '/' + fileId;
    var dest = fs.createWriteStream(path);
    drive.files.get({
      fileId: fileId,
      alt: 'media'
    })
    .on('error', function (err) {
      logger.error('Error downloading file', err);
      // callback();
    })
    .pipe(dest);

    dest
      .on('finish', function () {
        console.log('Downloaded %s!', fileId);
        logger.log('Downloaded %s!', fileId);
        callback();
      })
      .on('error', function (err) {
        console.log('Error writing file', err);
        logger.info('Error writing file', err);
        callback(err);
      });
  }, function (err) {
    if (err) {
      // Handle error
      logger.error(err);
    } else {
      // All permissions inserted
      logger.log("fetch over!");
    }
  });

  // drive.files.get({
  //     fileId: fileId,
  //     alt: 'media'
  //   })
  //   .on('error', function (err) {
  //     logger.error('Error downloading file', err);
  //   })
  //   .pipe(dest);

  //   dest
  //     .on('finish', function () {
  //       console.log('Downloaded %s!', fileId);
  //       logger.log('Downloaded %s!', fileId);
  //     })
  //     .on('error', function (err) {
  //       console.log('Error writing file', err);
  //       logger.info('Error writing file', err);
  //     });
};