import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  changeDefaultAdress(vat: any, country: any, address: any, city: any, postalCode: any): Observable<any> {
    return this.http.post<any>(environment.api + "/user/changedefaultaddress", { vat: vat, country: country, address: address, city: city, postalCode: postalCode })
  }

  changeDefaultCurrency(currency: string): Observable<any> { return this.http.post<any>(environment.api + "/user/changedefaultcurrency", { currency: currency }) }

  protected authenticatedUser: boolean;

  constructor(private http: HttpClient) {
    this.authenticatedUser = false;
    this.getAuthenticatedUser();
  }

  create(user) { return this.http.post<any>(environment.api + '/user', user) }

  activation(token) { return this.http.post<any>(environment.api + '/user/activation', token) }

  info(user) { return this.http.post<any>(environment.api + '/user/info', user) }

  getUsers() { return this.http.get<any>(environment.api + '/user'); }

  getRoles() { return this.http.get<any>(environment.api + '/role') }

  getCompte() { return this.http.get<any>(environment.api + '/user/profile') }

  updateUser(user) { return this.http.put<any>(environment.api + '/user', user) }

  mdpmail(val) { return this.http.post<any>(environment.api + '/mail/mdp', val) }

  mdpmodif(val) { return this.http.put<any>(environment.api + '/user/mdpmodif', val) }

  public getAuthenticatedUser() { return this.authenticatedUser }

  preferBilling(prefer) { return this.http.post<any>(environment.api + '/user/preferBilling', prefer) }

  verifmail(email) { return this.http.post<any>(environment.api + '/user/verifmail', email) }

  getUserById(id) { return this.http.get<any>(environment.api + '/user/' + id) }

  requestUpdateEmailAdress(email) { return this.http.post<any>(environment.api + '/user/UpdateEmailAdressVerification', { email: email }) }

  updateUserPassword(oldPassword, newPassword) { return this.http.post<any>(environment.api + '/user/UpdatePassword', { oldPassword: oldPassword, newPassword: newPassword }) }

  updateEmailAdress(token) { return this.http.post<any>(environment.api + '/user/UpdateEmailAdress/', { token: token }) }

  checkEmailIfExist(email) { return this.http.get<any>(environment.api + '/user/checkEmailIfExist/' + email) }

  requestForResetPassword(email) { return this.http.post<any>(environment.api + '/user/requestForResetPassword', { email: email }) }

  resetPassword(token, password) { return this.http.post<any>(environment.api + '/user/resetPassword', { token: token, password: password }) }

}
