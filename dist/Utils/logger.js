"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
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
    format: winston.format.combine(winston.format.colorize({ all: false }), // Colorize all logs (optional)
    // winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Optional timestamp format
    winston.format.simple() // Include level, message, and timestamp
    ),
    transports: [
        new winston.transports.Console(), // Log to the console
    ],
});
exports.default = logger;
