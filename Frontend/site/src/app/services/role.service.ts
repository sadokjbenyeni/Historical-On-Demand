import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private http: HttpClient) { }

  getRoles() {
    return this.http.get<any>( environment.api + '/role' );
    // .map( res => res.json() );
  }

  getPages() {
    return this.http.get<any>( environment.api + '/role/page' );
    // .map( res => res.json() );
  }

}