import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * The purpose of this service is collect all decisions made while appointing
 * a task and save them as on log message after.
 */
@Injectable()
export class TaskLoggerService extends LoggerService {
    private logs: string[];

    constructor() {
        super();
        this.logs = [];
    }

    init(): void {
        this.logs = [];
    }

    collect(message: string): void {
        this.logs.push(message);
    }

    save(): void {
        console.log('Saving task log...');
        console.log(this.logs);
        const message = this.logs.join('\n');
        this.log(message)
    }
}
