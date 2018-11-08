const redis = require('redis');
const { promisify } = require('util');

class RedisClass {
  constructor(config) {
    this.connection = redis.createClient({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('The server refused the connection')
        }
        if (options.total_retry_time > config.reconnectTime || 1000 * 60 * 60 * 24 * 2) {
          return new Error('Retry time exhausted')
        }
        if (options.attempt > config.reconnectTries || Number.MAX_VALUE) {
          return undefined
        }
        return config.reconnectInterval || 5000
      },
    });

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
