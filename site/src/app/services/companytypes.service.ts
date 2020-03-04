import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



import { environment } from '../../environments/environment';

@Injectable()
export class CompanytypesService {

  constructor(private http: HttpClient) { }
  getCompanytypes() {
    return this.http.get( environment.api + '/companytype' );
    // .map( res => res.json() );
  }

}
