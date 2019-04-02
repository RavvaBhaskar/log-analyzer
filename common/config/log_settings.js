var bunyan = require('bunyan');
// THIS FUNCTION CONFIGURES THE REQUEST OBJECT LOG TO ENSURE THAT NO PRIVATE DATA IS LOGGED TO FILE
requestLogger = function(req){
  return {
    method: req.method,
    url: req.url,
    headers: {
      factory: req.headers.factory,
      service: req.headers.service,
      jwt: req.headers.jwt,
      faid: req.headers.faid,
      guid: req.headers.guid
    }
  };
};

exports.loggerConfig = function(){
  return {
  logger: bunyan.createLogger({
      name: 'node',
      serializers: {
        req: requestLogger,
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err
      },
      streams: [
        {
          level: 'trace',
          path: './common/audit_log/logs/trace.log'
        },
        {
          level: 'info',
          path: './common/audit_log/logs/info.log'
        },
        {
          level: 'fatal',
          path: './common/audit_log/logs/fatal.log'

        },
        {
          level: 'error',
          path: './common/audit_log/logs/error.log'
        }
      ]
    })
  };
};
