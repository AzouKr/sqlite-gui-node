import * as winston from "winston";

// Define colors of levels (optional, for colored output)
const colorsLogger = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green",
};

// Add colors to winston (optional)
winston.addColors(colorsLogger);

// Define the logger configuration
const logger = winston.createLogger({
  level: "info", // Set the minimum log level (optional)
  format: winston.format.combine(
    winston.format.colorize({ all: false }), // Colorize all logs (optional)
    // winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Optional timestamp format
    winston.format.simple() // Include level, message, and timestamp
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
  ],
});

export default logger;
