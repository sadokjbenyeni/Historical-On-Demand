import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

// export interface User {
//   islogin: boolean;
// }

// const ANONYMOUS_USER = <User>{
//   islogin: false
// };

@Injectable()
export class UserService {

  protected authenticatedUser: boolean;

  constructor(private http: HttpClient) {
    this.authenticatedUser = false;
    this.getAuthenticatedUser();
  }

  create(user) {
    return this.http.post( environment.api + '/user', user );
      // .map( res => res.json() );
  }

  activation(token) {
    return this.http.post( environment.api + '/user/activation', token );
    // .map( res => res.json() );
  }

  check(user) {
    return this.http.post( environment.api + '/user/check', user );
      // .map( res => res.json() );
  }
  
  info(user) {
    return this.http.post( environment.api + '/user/info', user );
      // .map( res => res.json() );
  }
  
  getUsers() {
    return this.http.get( environment.api + '/user' );
    // .map( res => res.json() );
  }

  getRoles() {
    return this.http.get( environment.api + '/role' );
    // .map( res => res.json() );
  }

  getCompte(user) {
    return this.http.get( environment.api + '/user/' + user );
      // .map( res => res.json() );
  }

  updateUser(user) {
    return this.http.put( environment.api + '/user', user );
      // .map( res => res.json() );
  }

  islogin(token) {
    return this.http.post( environment.api + '/user/islogin', token );// .map( res => res.json() );
  }

  mdpmail(val) {
    return this.http.post( environment.api + '/mail/mdp', val );
    // .map( res => res.json() );
  }


  mdpmodif(val) {
    return this.http.put( environment.api + '/user/mdpmodif', val );
    // .map( res => res.json() );
  }

  public getAuthenticatedUser() {
      return this.authenticatedUser;
  }

  logout(token) {
    return this.http.post( environment.api + '/user/logout', token );
      // .map( res => res.json() );
  }
  preferBilling(prefer) {
    return this.http.post( environment.api + '/user/preferBilling', prefer );
      // .map( res => res.json() );
  }

  verifmail(email) {
    return this.http.post( environment.api + '/user/verifmail', email );
    // .map( res => res.json() );
  }

}
