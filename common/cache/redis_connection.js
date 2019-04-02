var redis = require('redis');
var app_config = require('../config/app_settings');
var _redisClient = null;

// Connects to Redis and creates Redis client
exports.getRedisClient = function() {
  if (_redisClient === null) {
    _redisClient = redis.createClient(
      process.env.REDIS_INSTANCE_PORT || app_config.get('/REDIS_INSTANCE_PORT'),
      process.env.REDIS_INSTANCE_HOST || app_config.get('/REDIS_INSTANCE_HOST'), {}
    );
    console.log('Redis Client Created: ' + _redisClient.address);
  }

  return _redisClient;
};
