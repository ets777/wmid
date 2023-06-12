import { Injectable, isDevMode } from '@angular/core';
import { Router, CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return isDevMode()
      ? true
      : new Observable<boolean>((obs) => {
          this.authService.checkAuth().subscribe((a) => {
            if (a?.success) {
              obs.next(true);
            } else {
              this.router.navigate(['/login']);
              obs.next(false);
            }
          });
        });
  }
}
