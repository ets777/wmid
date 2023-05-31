import { Injectable, isDevMode } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return isDevMode()
      ? true
      : new Observable<boolean>((obs) => {
          this.authenticationService.checkAuth().subscribe(a => {
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
