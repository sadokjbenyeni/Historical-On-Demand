import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class VatService {

  constructor(private http: Http) { }

  checkVat(vat) {
    return this.http.get( environment.api + '/verifyvat/'+ vat )
    .map( res => res.json() );
  }

}
