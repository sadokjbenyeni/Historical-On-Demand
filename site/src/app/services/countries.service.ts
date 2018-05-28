import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class CountriesService {

  constructor(private http: Http) { }

  getCountries() {
    return this.http.get( environment.api + '/countries' )
    .map( res => res.json() );
  }
  isUE(id) {
    return this.http.post( environment.api + '/countries/isUE', id )
    .map( res => res.json() );
  }
  saveUE(country) {
    return this.http.put( environment.api + '/countries/ue', country )
    .map( res => res.json() );
  }

}
