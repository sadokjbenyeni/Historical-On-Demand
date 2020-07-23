import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class CompanytypesService {

  constructor(private http: Http) { }
  getCompanytypes() {
    return this.http.get( environment.api + '/companytype' )
    .map( res => res.json() );
  }

}
