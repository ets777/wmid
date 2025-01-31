import * as fs from 'fs';
import * as path from 'path';

export class LoggerService {
    private logFilePath: string;

    constructor() {
        const logDir = path.resolve('logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        this.logFilePath = path.join(logDir, this.getFileName());
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    }

    private writeToFile(logMessage: string): void {
        console.log('Writing to file...');
        console.log(this.logFilePath);
        try {
            fs.appendFileSync(this.logFilePath, logMessage + '\n');
        } catch (err) {
            console.error('Failed to write log:', err);
        }
    }

    private getFileName(): string {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return date.getFullYear() + month + day + '.log';
    }

    log(message: string): void {
        console.log('Logging...');
        const logMessage = this.formatMessage('info', message);
        this.writeToFile(logMessage);
    }

    warn(message: string): void {
        const logMessage = this.formatMessage('warn', message);
        this.writeToFile(logMessage);
    }

    error(message: string): void {
        const logMessage = this.formatMessage('error', message);
        this.writeToFile(logMessage);
    }
}