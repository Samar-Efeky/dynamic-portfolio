import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    const uid = this.authService.getUidFromStorage();
    if (uid) {
      const url = state.url;
      if (url.includes('sign-in') || url.includes('sign-up')) {
        return this.router.parseUrl('/admin'); 
      }

      return true; 
    }
    else {
      const url = state.url;
      if (url.includes('admin')) {
        return this.router.parseUrl('/sign-in'); 
      }

      return true; 
    }
  }
}
