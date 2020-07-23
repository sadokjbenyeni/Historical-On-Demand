import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class ElasticService {

  constructor(private http: Http) { }

  getSearch(search) {
    return this.http.post( environment.api + '/search', search )
    .map( res => res.json() );
  }

}
