import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdministratorServiceService {

  constructor(private http: HttpClient) { }

  getUserById(id) {
    return this.http.get<any>(environment.api + '/administrator/user/' + id);
  }

  getUsers(columns, order, search, offset, limit, page) {
    return this.http.post<any>(environment.api + '/user/list', { parameters: { columns: columns, order: order, search: search, offset: offset, limit: limit, page: page } });
  }
  updateUser(user) {
    return this.http.put<any>(environment.api + '/administrator/user', { user: user });
  }
}
