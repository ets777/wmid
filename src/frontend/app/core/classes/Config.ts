import { isDevMode } from '@angular/core';

export class Config {
    public static getRoot(): string {
        return isDevMode() ? 'http://localhost/wmid' : 'https://etsbox.ru/wmid';
    }

    public static getApiPath(): string {
        return isDevMode() ? 'http://localhost:3000/api' : 'https://etsbox.ru/wmid';
    }
}
