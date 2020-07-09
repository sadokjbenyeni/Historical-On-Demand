import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class GuardGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let token = sessionStorage.getItem('token');
    if (token) {
      return new Promise((resolve, reject) => {
        this.userService.islogin({ page: state.url }).subscribe(res => {
          if (res.role > 0) {
            resolve(true);
          } else {
            this.router.navigate(['/login']);
            resolve(false);
          }
        });
      });
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }




}
