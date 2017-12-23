'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
const nconf = module.exports = require('nconf');
const path = require('path');

nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'MONGO_URL',
    'MONGO_COLLECTION',
    'OAUTH2_CLIENT_ID',
    'OAUTH2_CLIENT_SECRET',
    'OAUTH2_CALLBACK',
    'PORT'
  ])
  // 3. Config file
  .file({ file: path.join(__dirname, 'config.json') })
  // 4. Defaults
  .defaults({
    // MongoDB connection string
    // https://docs.mongodb.org/manual/reference/connection-string/
    // MONGO_URL: 'mongodb://localhost/login',
    MONGO_URL: 'mongodb://auth_mongo:27017',
    MONGO_COLLECTION: 'user',

    OAUTH2_CLIENT_ID: '371510466976-p064kvii1ap1rtu1k0n141ccr2r8r70a.apps.googleusercontent.com',
    OAUTH2_CLIENT_SECRET: 'XgLCFDTibYc9ACUnBKpF3Zdg',
    OAUTH2_CALLBACK: 'http://localhost:3000/callback',
    // OAUTH2_CALLBACK: 'http://localhost:4000/callback',
    // PREFIX_PATH: '/Users/fan/MyProject/CSE523/auth/uploads/google',
    PREFIX_PATH: '/home/ubuntu/auth/uploads/google',
    PORT: 3001,

    POST_URL: 'http://pensive.cewit.stonybrook.edu/moments/api/moments/'
  });
