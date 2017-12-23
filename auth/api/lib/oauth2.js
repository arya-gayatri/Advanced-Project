'use strict';

const config = require('../../config');
var google = require('googleapis');
var async = require("async");

var OAuth2Client = google.auth.OAuth2;
var photos = google.drive({version:'v3', auth:OAuth2Client});
var CLIENT_ID = config.get('OAUTH2_CLIENT_ID');
var CLIENT_SECRET = config.get('OAUTH2_CLIENT_SECRET');
var REDIRECT_URL = config.get('OAUTH2_CALLBACK');
// 'http://localhost:3000/callback';
// var YOUR_REDIRECT_URL = 'http://login.com:4000/auth/google/callback',

// var http = require('http');
var url = require('url');
var querystring = require('querystring');
// var opn = require('opn');
// var openurl = require("openurl");
// var secrets = require('./secrets.json');
var logger = require('../../logConfig.js')

function SampleClient (options) {
  var self = this;
  self.isAuthenticated = false;
  this._options = options || { scopes: [] };

  // create an oAuth client to authorize the API call
  this.oAuth2Client = new OAuth2Client(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  this.drive = google.drive({
    version: 'v3',
    auth: this.oAuth2Client
  });

  this.plus = google.plus('v1');

  // Open an http server to accept the oauth callback. In this
  // simple example, the only request to our webserver is to
  // /callback?code=<code>
  this._authenticate = function (scopes, callback) {
    // grab the url that will be used for authorization
    var url = self.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
      approval_prompt: 'force'
    });
    // console.log(url);
    callback(url);
    // openurl.open(self.authorizeUrl);
  };

  self.execute = function (scopes, callback) {
    self._authenticate(scopes, callback);
  };

  self.handler = function(request, response, code, callback) {
    // var qs = querystring.parse(url.parse(request.url).query);
    var email;
    // self.oAuth2Client.getToken(qs.code, function (err, tokens) {
    self.oAuth2Client.getToken(code, function (err, tokens) {
      if (err) {
        logger.error('Error getting oAuth tokens: ' + err);
        // console.error('Error getting oAuth tokens: ' + err);
        response.json({status: 0, message: err});
      }
      else {
        self.oAuth2Client.setCredentials(tokens);
        self.plus.people.get({userId:'me', auth: self.oAuth2Client}, function(err, profile){
          if (err) {
            logger.error('Get profile err' + err);
            // console.log('Get profile err', err);
            response.json({status: 0, message: "Get profile error"});
          }
          email = profile.emails[0].value;
          callback(tokens, email);
        })
      }
    });
  };

  self.refreshabc = function(response, token, refresh_token, callback) {
    // console.log("oauth2.refres: token: " + token);
    // console.log("oauth2.refresh: refresh_token: " + refresh_token);
    self.oAuth2Client.setCredentials({
      access_token: token,
      refresh_token: refresh_token
    });

    self.oAuth2Client.refreshAccessToken(function(err, tokens) {
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

  self.get_metadata = function(params, email, token, refresh_token, callback) {
    logger.info("get_metadata" + email + "|" + token + "|" + refresh_token);
    // console.log(email + "|" + token + "|" + refresh_token);
    self.oAuth2Client.setCredentials({
      access_token: token,
      refresh_token: refresh_token
    });
    
    // get metadata
    var modified_time = Date.UTC(2000, 1, 1, 0);
    var pageToken = null;
    var result_flag = false;
    async.doWhilst(function (cb) {
      params.pageToken = pageToken;
      self.drive.files.list(params, function (err, result) {
        if (err) {
          logger.error(err);
          // console.error(err);
          cb(error);
        }
        else {
          result.files.forEach(function (file) {
            console.log(file.id);
            console.log(file.modifiedTime);
          });
          pageToken = result.nextPageToken;
          var len = result.files.length;
          if (pageToken == undefined && len > 0) {
            result_flag = true;
            modified_time = result.files[len-1].modifiedTime;
          }
          // console.log(pageToken);
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
        // console.log(modified_time);
        if (result_flag) {
          callback(modified_time);
        }
      }
    });
    
  };

  return self;
}

module.exports = new SampleClient();
