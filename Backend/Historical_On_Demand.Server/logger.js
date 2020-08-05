// global.environment = require("./server/environment/environment.json");
const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;
// import { format } from 'winston';
const baseFormatLogger = printf(({ level, message, label, timestamp, className }) => {
  return `${timestamp} | ${level} | [${label}] | ${className} | ${message}`;
});

class LoggerFactory {
       
    createLogger(identifier)
    {
        return winston.createLogger({
            level: global.environment.logger.level,
            format: combine(
              label({ label: identifier }),
              timestamp(),
              // errors({ stack: true }),
              baseFormatLogger
            ),
            defaultMeta: { service: 'user-service' },
            transports: [
              // new winston.transports.File({ filename: '/var/log/histoweb-error.log', level: 'error' }),
              // new winston.transports.File({ filename: '/var/log/histoweb-combined.log' }),
              new winston.transports.Console({level: 'info', format: winston.format.combine( winston.format.colorize(), label({ label: identifier }), timestamp(), baseFormatLogger) })
            ]
          });
    }
}

class LoggerBuilder {
  
  setLevel(level) {
    this.level = level;
    return this;
  }

  setFileError(filepath) {
    
  }
  
  createLogger(identifier)
  {
      return winston.createLogger({
          level: global.environment.logger.level,
          format: combine(
            label({ label: identifier }),
            timestamp(),
            // errors({ stack: true }),
            baseFormatLogger
          ),
          defaultMeta: { service: 'user-service' },
          transports: [
            // new winston.transports.File({ filename: '/var/log/histoweb-error.log', level: 'error' }),
            // new winston.transports.File({ filename: '/var/log/histoweb-combined.log' }),
            new winston.transports.Console({level: 'info', format: winston.format.combine( winston.format.colorize(), label({ label: identifier }), timestamp(), baseFormatLogger) })
          ]
        });
  }
}

module.exports = LoggerFactory