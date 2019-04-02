// TO-DO: DETERMINE THE CORRECT WSDLS TO USE FOR PAYMENT, PAYMENT ACTIVITY AND BILL DELIVERY
var path = require('path');
var Confidence = require('confidence');
var fs = require('fs');

const config = {
     // Specifies how the server will listen for requests, values: HTTP, HTTPS, BOTH
     "CONNECTION_MODE": {		
		"$filter": "env",
        "local": "HTTPS",
		"prod11": "BOTH",
        "prod12": "BOTH",
		"dev2_sus": "BOTH",
		"dr1": "BOTH",
        "dr2": "BOTH",
		"$default": "BOTH"
    },

    // The host that the Node server will listen on
    "APP_HOST": {
		"$filter": "env",
        "local": "127.0.0.1",
        "prod11": "10.231.7.47",
        "prod22": "10.231.7.48",
		"dev2_sus": "10.220.188.20",
        "dr1": "10.220.188.14",
        "dr2": "10.220.188.15",  
    },
    "APP_PORT": {
		"$filter": "env",
        "local": 3012,
        "prod11": 3010,
        "prod22": 3010,
		"dev2_sus": 3012,
        "dr1": 3010,
        "dr2": 3010,
        "$default": 3012
    },

    /* SSL Settings */
    "SSL": {
        "PORT": 443, // Default port for SSL
        // SSL private key
        "KEY": {
            "$filter": "env",
            "local": fs.readFileSync(path.resolve('./cert/ssl/ebpp-key.pem'), 'utf8'),
            "dev": fs.readFileSync(path.resolve('./cert/ssl/ebpp-key.pem'), 'utf8'),
            "prod11": fs.readFileSync(path.resolve('./cert/ssl/ebpp-key.pem'), 'utf8'),
            "prod12": fs.readFileSync(path.resolve('./cert/ssl/ebpp-key.pem'), 'utf8'),
            "dr1": fs.readFileSync(path.resolve('./cert/ssl/ebpp-key.pem'), 'utf8'),
            "dr2": fs.readFileSync(path.resolve('./cert/ssl/ebpp-key.pem'), 'utf8'),
            "$default": fs.readFileSync(path.resolve('./cert/ssl/ebpp-key.pem'), 'utf8')
        },
        // SSL certificate
        "CERT": {
            "$filter": "env",
            "local": fs.readFileSync(path.resolve('./cert/ssl/ebpp-cert.pem'), 'utf8'),
            "dev": fs.readFileSync(path.resolve('./cert/ssl/ebpp-cert.pem'), 'utf8'),
            "prod11": fs.readFileSync(path.resolve('./cert/ssl/ebpp-cert.pem'), 'utf8'),
            "prod12": fs.readFileSync(path.resolve('./cert/ssl/ebpp-cert.pem'), 'utf8'),
            "dr1": fs.readFileSync(path.resolve('./cert/ssl/ebpp-cert.pem'), 'utf8'),
            "dr2": fs.readFileSync(path.resolve('./cert/ssl/ebpp-cert.pem'), 'utf8'),
            "$default": fs.readFileSync(path.resolve('./cert/ssl/ebpp-cert.pem'), 'utf8')
        }
    },

    level: {
        console: 'debug',
        file: 'debug'
    },
    "FTP_SERVER_DETAILS": {
        "$filter": "env",
        "local": {
            "HOST": "",
            "USERNAME": "",
            "PASSWORD": ""
        },
        "dev": {
            "HOST": "",
            "USERNAME": "",
            "PASSWORD": ""
        }
    }
};

var criteria = {
    env: process.env.NODE_ENV

};
var store = new Confidence.Store();
store.load(config);

exports.get = function (key) {
    return store.get(key, criteria);
};
