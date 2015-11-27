'use strict';
var logme = require('logme');
var fs = require('fs');

// CRON
var cron = require('./cron/smb_request');
//cron.register('http://threadsafe.msn-transit-api.appspot.com/');
cron.register('http://api.smsmybus.com/');

