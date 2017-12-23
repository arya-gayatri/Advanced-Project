'use strict';
module.exports = function(app) {
  var token = require('../controllers/tokenController');
  var photo = require('../controllers/photoController');

  // todoList Routes
  app.route('/api/auth/user/authurl')
    .get(token.create_a_user);

  app.route('/api/auth/token/service/:serviceType')
    .post(token.create_a_token);


  app.route('/api/auth/token/service/:serviceType/user/:userName')
    .get(token.read_a_token);

  app.route('/api/auth/service/user/:userName')
    .get(token.get_user_service);

  app.route('/api/auth/logout/service/:serviceType/user/:userName')
    .post(token.logout);

  app.route('/test2')
    .get(token.test2);

  app.route('/callback')
    .get(token.callback);

  app.route('/api/auth/p/service/:serviceType/user/:userName/photo/:photoId')
    .get(photo.read_photo);
};
