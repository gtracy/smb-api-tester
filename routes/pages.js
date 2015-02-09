var logme = require('logme');
var jade = require('jade');
var fs = require('fs');
var path = require('path');



module.exports = function(app) {
    
    app.get('/', function(req, res, next) {
        res.render('start.jade');
    });

};