'use strict';
var logme = require('logme');
var express = require('express');
var fs = require('fs');


// create the express web application server
var app = express.createServer();

app.configure(function() {

    app.use(express.errorHandler({ dumpExceptions: true }));
    app.use(express.logger(':date :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'));
    app.set('view engine', 'jade');
    app.set('view options', {layout: false});
    // set the favicon
    app.use(express.favicon(__dirname + '/public/img/favicon.ico'));

    // parse JSON requests
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express['static'](__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.session( {'secret' : 'hackme'} ));
    app.use(app.router);

    require('./routes/pages')(app);

    // CRON
    var cron = require('./cron/smb_request');
    cron.register("http://load-testing.msn-transit-api.appspot.com/");

});

// start the web application server
var port = process.env.PORT || 8088;
app.listen(port);
logme.info('Asthmapolis server started on port ' + port);
