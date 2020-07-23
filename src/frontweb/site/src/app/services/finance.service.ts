import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class FinanceService {

  constructor(private http: Http) { }

  getRoles() {
    return this.http.get( environment.api + '/role' )
    .map( res => res.json() );
  }

}
