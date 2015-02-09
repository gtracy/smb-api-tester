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
    '0161',
    '0435',
    '0962',
    '2447',
    '2969',
    '2899'
];
var host = "http://load-testing.msn-transit-api.appspot.com/";
var key = "fixme";

// response.statusCode

var apiCall = function() {
    var url;
    writableStream = fs.createWriteStream("requests.csv");
    csvStream.pipe(writableStream);

    stops.forEach(function(stop) {
        logme.info('API request for stop ' + stop);
        url = host + '/v1/getarrivals?key=' + key + '&stopID=' + stop;
        var start = now();
        var wall_clock_start = moment().format();
        request(url, function (error, response, body) {
            var end = now();
            var call_time = ((end-start)/1000).toFixed(0);
            logme.info('API speed ('+stop+') : ' + call_time);

            try {
                var results = JSON.parse(body);
            } catch( ex ) {
                logme.error('Parse ERROR');
                logme.error(body);
            }
            if (!error && response.statusCode == 200) {
                logme.info('API Success!');
                //console.dir(results);
            } else {
                logme.error('API Fail : ' + error);
                console.dir(results);
            }
            var stop_detail_id;
            var route_length = 0;
            if( results.stop ) {
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
        });
    });
};

module.exports.register = function(channel) {
    // 8:00am every Wednesday.
    new cronJob('* * * * *', apiCall, null, true, "America/Chicago");
};
