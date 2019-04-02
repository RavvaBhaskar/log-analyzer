var Hapi = require('hapi');
var path = require('path');
var inert = require('inert');
var h2o2 = require('h2o2');
var app_config = require(path.resolve('./common/config/app_settings.js')); // confidence

//var ftp = require(path.resolve('./handler/ftpClient.js'));
/*********************************************************************/
var server = new Hapi.Server();

// Create HTTP connection
if (app_config.get('/CONNECTION_MODE') == "HTTP" || app_config.get('/CONNECTION_MODE') == "BOTH") {
    var connection = {
        port: process.env.PORT || app_config.get('/APP_PORT'),
        host: process.env.HOST || app_config.get('/APP_HOST')
    };
    server.connection(connection);
}
// Create HTTPS connection
if (app_config.get('/CONNECTION_MODE') == "HTTPS" || app_config.get('/CONNECTION_MODE') == "BOTH") {

    var connection = {
        port: process.env.PORT || app_config.get('/SSL/PORT'),
        host: process.env.HOST || app_config.get('/APP_HOST'),
        tls: {
            key: process.env.SSL_KEY || app_config.get('/SSL/KEY'),
            cert: process.env.SSL_CERT || app_config.get('/SSL/CERT'),
            secureProtocol: 'TLSv1_2_method'
        }
    };
    server.connection(connection);
}

var plugins = [inert,h2o2];

server.register(plugins, function(err){
    if(err){
        console.log('err = register'+ err);
        return err;
    } else {
        server.start(function(err){
            if(err){
                console.log('err = start if '+ err);
                throw err;
            } else {
                console.log('server started = start else');
                server.route(require('./routes/public-api'));
                console.log('Server listening on ', server);
            }
        });
    }
});
module.exports = server; 