
const winston = require('winston');
const { combine, timestamp, label, printf, className } = winston.format;
const baseFormatLogger = printf(({ level, message, label, timestamp, className }) => {
    return `${timestamp} | ${level} | [${label}] | ${className} | ${message}`;
});

class LoggerFactory {
       
    createLogger(identifier)
    {
        return winston.createLogger({
            level: 'info',
            format: combine(
              label({ label: identifier }),
              timestamp(),
              baseFormatLogger
            ),
            defaultMeta: { service: 'user-service' },
            transports: [
              new winston.transports.File({ filename: '/var/log/histoweb-error.log', level: 'error' }),
              new winston.transports.File({ filename: '/var/log/histoweb-combined.log' }),
              new winston.transports.Console()
            ]
          });
    }
}

module.exports = LoggerFactory