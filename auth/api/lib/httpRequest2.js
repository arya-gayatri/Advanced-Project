var request = require('request');
const config = require('../../config');
var postUrl = config.get('POST_URL');
var logger = require('../../logConfig.js')


module.exports.sendpost = function (option) {
    // console.log(postUrl);
    logger.info("send to "+ postUrl);
    request({
      headers: {"Content-type": "application/json"},
      uri:     postUrl,
      body:    JSON.stringify(option),
      method: 'POST'
      }, function(error, response, body){
        console.log(body);
    });

};

module.exports.sendget = function (url, option) {
  request({
    headers: {"Content-type":"application/x-www-form-urlencoded"},
    uri: url,
    method: 'GET'
  }, function(error, response, body) {
    console.log(body);
    logger.info(body);
  })
};