var cronJob = require('cron').CronJob;
var request = require('request');
var logme = require('logme');
var now = require('performance-now');
var csv = require('fast-csv');
var fs = require('fs');
var moment = require('moment');


var csvStream = csv.createWriteStream({headers: true});

var stops = [
    '1101',
    '0455',
    '0100',
    '1650',
    '0435',
    '0962',
    '1959',
    '1309',
    '1505',
    '2447',
    '1878',
    '2899'
];
var host = "http://api.smsmybus.com/";
var key = process.env.KEY;

// response.statusCode

var apiCall = function(base_url) {
    var url;
    host = base_url;
    writableStream = fs.createWriteStream("requests-prod.csv");
    csvStream.pipe(writableStream);

    stops.forEach(function(stop) {
        logme.info('API request for stop ' + stop + ' at ' + url);
        url = host + '/v1/getarrivals?key=' + key + '&stopID=' + stop;
        var start = now();
        var wall_clock_start = moment().format();
        request(url, function (error, response, body) {
            if( !response ) {
                logme.error('Connect error. Bail');
                return;
            }
            var end = now();
            var call_time = ((end-start)/1000).toFixed(0);
            logme.info('API speed ('+stop+') : ' + call_time);

            var results;
            try {
                results = JSON.parse(body);
                if( !results ) {
                    logme.info('... no results for ' + stop);
                    return;
                }
            } catch( ex ) {
                logme.error('Parse ERROR');
                logme.error(body);
            }
            if (!error && response.statusCode == 200 && results.status >= 0 ) {
                logme.info('API Success!');
            } else {
                logme.error('API Fail : ' + error);
                console.dir(results);
            }
            var stop_detail_id;
            var route_length = 0;
            if( results && results.stop ) {
                stop_detail_id = results.stop.stopID;
                route_length = results.stop.route.length;
            }
            csvStream.write({
                'start when' : wall_clock_start,
                'end when' : moment().format(),
                'stop request' : stop,
                'request status' : response.statusCode,
                'time' : call_time,
                'api status' : results.status,
                'api details' : results.description,
                'api stop' : stop_detail_id,
                'route count' : route_length
            });
            return;
        });
    });
};

module.exports.register = function(base_url) {
    // 8:00am every Wednesday.
    new cronJob('* * * * *', apiCall, [base_url], true, "America/Chicago");
};
