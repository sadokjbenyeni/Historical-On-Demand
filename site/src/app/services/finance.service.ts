import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable()
export class FinanceService {

  constructor(private http: HttpClient) { }

  getRoles() {
    return this.http.get( environment.api + '/role' )
    // .map( res => res.json() );
  }

}
