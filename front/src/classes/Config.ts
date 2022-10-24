import { isDevMode } from '@angular/core';
export class Config {
    static getRoot() {
        return isDevMode() ? 'http://localhost/wmid' : 'https://etsbox.ru/wmid';
    }
}