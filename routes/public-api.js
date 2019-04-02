var Hapi = require('hapi');
var path = require('path');
var fs = require('fs');
var app_config = require(path.resolve('./common/config/app_settings.js'));

var logParseHandler =require(path.resolve('./handler/getLogsHandler.js'));


var publicRoute = [
    /************************* LOG VIEWER ROUTES ************************/
    {
        path: '/template',
        method: 'GET',
        handler: {
            file: './templates/templatePage.html',

        }
    },
    {
        path: '/keywords',
        method: 'GET',
        handler: {
            file: './templates/keywordmap.html',

        }
    },
    {
        path: '/',
        method: 'GET',
        handler: {
            file: './templates/readMail.html',
        }
    },
    {
        path: '/assets/{path*}',
        method: 'GET',
        handler: {
            directory: {
                path: './',
                listing: false
            }
        }
    },
    {
        path: '/logs/{file*}',
        method: 'GET',
        handler: {
            directory: {
                path: './handler/getLogsHandler.js'
            }
        }

    },
    {
        path: '/{file*}',
        method: 'GET',
        handler: {
            directory: {
                path: './'
            }
        }

    },
    {
        path: '/logs/getftplogs',
        method: 'GET',
        handler: function (req, reply) {
            logHandler.getFTPlogs(req,reply);
        }
    },
    {
        path: '/logs/getError',
        method: 'POST',
        handler: function (req, reply) {
            logParseHandler.parseLogs(req,reply);
        }
    },
    {
        path: '/keyword/write',
        method: 'POST',
        handler: function (req, reply) {
            logParseHandler.keywordWrite(req,reply);
        }
    },
    {
        path: '/logs/getLogs',
        method: 'POST',
        handler: function (req, reply) {
            logParseHandler.getDetails(req,reply);
        }
    }
];


module.exports = publicRoute;
