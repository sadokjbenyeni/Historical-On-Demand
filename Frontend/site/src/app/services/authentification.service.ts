import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subscription } from 'rxjs';
import * as jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  private logoutEvent: EventEmitter<any>;

  constructor(private http: HttpClient) {
    this.logoutEvent = new EventEmitter<any>();
  }
  
  getRoles(): Array<string> {
    var token = sessionStorage.getItem('token');
    if(token) {
      return jwt_decode(token).roleName;
    }
    return [];
  }
  
  login(user): Observable<any> {    
    return this.http.post<any>(environment.api + '/user/check', user).map( res => {
      sessionStorage.setItem('token', res.token);
      localStorage.setItem('ula', 'true');
      sessionStorage.removeItem('register');
      this.logoutEvent.emit({ source: this, event: "login"});
      return res;
    });
  }
  
  logout() :Observable<any> {
    var token = sessionStorage.getItem('token');    
    if(token) {
      return this.http.post<any>(environment.api + '/user/logout', token).map(res => {
          sessionStorage.removeItem('token');
          sessionStorage.setItem('dataset', JSON.stringify({ "dataset": "", "title": "" }));
          this.logoutEvent.emit({ source: this, event: "logout"});
          return res;
      })
      .catch((e: any) => Observable.throw(this.errorHandler(e))); 
    }
    sessionStorage.removeItem('token');
    sessionStorage.setItem('dataset', JSON.stringify({ "dataset": "", "title": "" }));
    this.logoutEvent.emit({ source: this, event: "logout"});
  }

  errorHandler(error: any): void {
    sessionStorage.removeItem('token');
    sessionStorage.setItem('dataset', JSON.stringify({ "dataset": "", "title": "" }));
    this.logoutEvent.emit({ source: this, event: "logout"});
    console.log(error.message);
  }

  islogin(url): Observable<any> {
    return this.http.post<any>(environment.api + '/user/islogin', url);// .map( res => res.json() );
  }

  subscribe(generatorOrNext?: any, error?: any, complete?: any): Subscription {
    return this.logoutEvent.subscribe(generatorOrNext, error, complete);
  }

}
