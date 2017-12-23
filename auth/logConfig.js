const log4js = require('log4js');
log4js.configure({
  appenders: { 
    login: { type: 'file', 
    filename: 'login.log', 
    pattern: 'yyyy-MM-dd-hh'} },
  categories: { default: { appenders: ['login'], level: 'info' } }
});

module.exports = log4js.getLogger('login');