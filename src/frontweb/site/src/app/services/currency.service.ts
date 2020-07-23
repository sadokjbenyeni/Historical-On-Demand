import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class CurrencyService {

  constructor(private http: Http) { }

  getCurrencies() {
    return this.http.get( environment.api + '/currency')
    .map( res => res.json() );
  }

  getRib(rib) {
    return this.http.get( environment.api + '/currency/rib/'+ rib)
    .map( res => res.json() );
  }

  saverib(rib) {
    return this.http.post( environment.api + '/currency/saverib', rib)
    .map( res => res.json() );
  }

}
