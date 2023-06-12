import { isDevMode } from '@angular/core';

export class Config {
  static getRoot(): string {
    return isDevMode() ? 'http://localhost/wmid' : 'https://etsbox.ru/wmid';
  }

  static getApiPath(): string {
    return isDevMode() ? 'http://localhost:3000/api' : 'https://etsbox.ru/wmid';
  }
}
