import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import * as jwt_decode from 'jwt-decode';

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
    return this.http.get<any>(environment.api + '/user/profile');
    // .map( res => res.json() );
  }

  updateUser(user) {
    return this.http.put<any>(environment.api + '/user', user);
    // .map( res => res.json() );
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

  preferBilling(prefer) {
    return this.http.post<any>(environment.api + '/user/preferBilling', prefer);
    // .map( res => res.json() );
  }

  verifmail(email) {
    return this.http.post<any>(environment.api + '/user/verifmail', email);
    // .map( res => res.json() );
  }

  getUserById(id) {
    return this.http.get<any>(environment.api + '/user/' + id);
  }

  requestUpdateEmailAdress(email) {
    return this.http.post<any>(environment.api + '/user/UpdateEmailAdressVerification', { email: email });
  }

  requestUpdatePassword(oldPassword, newPassword) {
    return this.http.post<any>(environment.api + '/user/UpdatePasswordVerification', { oldPassword: oldPassword, newPassword: newPassword });
  }
  updateEmailAdress(token) {
    return this.http.post<any>(environment.api + '/user/UpdateEmailAdress/', { token: token });
  }

  checkEmailIfExist(email) {
    return this.http.get<any>(environment.api + '/user/checkEmailIfExist/' + email);
  }

  updateUserPassword(token) {
    return this.http.put<any>(environment.api + '/user/updateUserPassword', {  token: token });
  }
}
