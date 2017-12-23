'use strict';
const path = require('path');
const config = require('./config');
var fs = require('fs');
var express = require('express'),
  app = express(),
  port = process.env.PORT || config.get('PORT'),
  mongoose = require('mongoose'),
  Token = require('./api/models/tokenModel'), //created model loading here
  bodyParser = require('body-parser');
  
// mongoose instance connection url connection
mongoose.Promise = global.Promise;
var MONGOOSEURL = config.get('MONGO_URL');
var C = config.get('MONGO_COLLECTION');
console.log(MONGOOSEURL + '/' + C);
mongoose.connect(MONGOOSEURL);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/tokenRoutes'); //importing route
routes(app); //register the route


app.listen(port);

console.log('bayrest RESTful API server started on: ' + port);
