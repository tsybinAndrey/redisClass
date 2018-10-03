const redis = require('redis');
const { promisify } = require('util');

class RedisClass {
  constructor(config) {
    this.connection = redis.createClient(config);

    this.quitAsync = promisify(this.connection.quit).bind(this.connection);

    this.hsetAsync = promisify(this.connection.hset).bind(this.connection);
    this.setexAsync = promisify(this.connection.setex).bind(this.connection);
    this.setAsync = promisify(this.connection.set).bind(this.connection);
    this.getAsync = promisify(this.connection.get).bind(this.connection);
    this.expireAsync = promisify(this.connection.expire).bind(this.connection);
    this.delAsync = promisify(this.connection.del).bind(this.connection);
    this.connection.on('connect', () => {
      console.info('INFO:', 'Redis client connected');
    });

    this.connection.on('error', (error) => {
      console.error(`Something went wrong with Redis${error}`);
      throw error;
    });
  }
}

module.exports = RedisClass;
