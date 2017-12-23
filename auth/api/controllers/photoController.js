'use strict';
var logger = require('../../logConfig.js');
const config = require('../../config');
var prefix = config.get('PREFIX_PATH');

exports.read_photo = function(req, res) {
    var email = req.params.userName;
    var serviceType = req.params.serviceType;
    var photoId = req.params.photoId;
    logger.info("read_photo:" + email + "|" + serviceType + "|" + photoId);
    var path = prefix + '/' + photoId;
    console.log(path);
    res.type('jpg').sendFile(path);
};