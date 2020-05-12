import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let sessionUser = sessionStorage.getItem('user');
    if(sessionUser) {
      let user = JSON.parse(sessionUser);
      if(user && user.token){
        request = request.clone({
          setHeaders: {
            Authorization: `${user.token}`
          }
        });
      }
    }
    return next.handle(request);
  }
}
