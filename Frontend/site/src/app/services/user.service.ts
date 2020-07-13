import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// export interface User {
//   islogin: boolean;
// }

// const ANONYMOUS_USER = <User>{
//   islogin: false
// };

@Injectable({
  providedIn: 'root'
})
export class UserService {
  changeDefaultAdress(vat: any, country: any, address: any, city: any, postalCode: any): Observable<any> {
    return this.http.post<any>(environment.api + "/user/changedefaultaddress",
      {
        vat: vat, country: country, address: address, city: city, postalCode: postalCode
      })
  }
  changeDefaultCurrency(currency: string): Observable<any> {
    return this.http.post<any>(environment.api + "/user/changedefaultcurrency",
      {
        currency: currency
      })
  }

  protected authenticatedUser: boolean;

  constructor(private http: HttpClient) {
    this.authenticatedUser = false;
    this.getAuthenticatedUser();
  }

  create(user) {
    return this.http.post<any>(environment.api + '/user', user);
    // .map( res => res.json() );
  }

  activation(token) {
    return this.http.post<any>(environment.api + '/user/activation', token);
    // .map( res => res.json() );
  }

  check(user) {
    return this.http.post<any>(environment.api + '/user/check', user);
    // .map( res => res.json() );
  }

  info(user) {
    return this.http.post<any>(environment.api + '/user/info', user);
    // .map( res => res.json() );
  }

  getUsers() {
    return this.http.get<any>(environment.api + '/user');
    // .map( res => res.json() );
  }

  getRoles() {
    return this.http.get<any>(environment.api + '/role');
    // .map( res => res.json() );
  }

  getCompte() {
    return this.http.get<any>(environment.api + '/user/profile' );
    // .map( res => res.json() );
  }

  updateUser(user) {
    return this.http.put<any>(environment.api + '/user', user);
    // .map( res => res.json() );
  }

  islogin(url) {
    return this.http.post<any>(environment.api + '/user/islogin', url);// .map( res => res.json() );
  }

  mdpmail(val) {
    return this.http.post<any>(environment.api + '/mail/mdp', val);
    // .map( res => res.json() );
  }


  mdpmodif(val) {
    return this.http.put<any>(environment.api + '/user/mdpmodif', val);
    // .map( res => res.json() );
  }

  public getAuthenticatedUser() {
    return this.authenticatedUser;
  }

  logout(token) {
    return this.http.post<any>(environment.api + '/user/logout', token);
    // .map( res => res.json() );
  }
  preferBilling(prefer) {
    return this.http.post<any>(environment.api + '/user/preferBilling', prefer);
    // .map( res => res.json() );
  }

  verifmail(email) {
    return this.http.post<any>(environment.api + '/user/verifmail', email);
    // .map( res => res.json() );
  }

}