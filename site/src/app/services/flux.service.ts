import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class FluxService {

  constructor(private http: Http) { }

  catalogue(dataset) {
    return this.http.get( environment.api + '/flux/eid/' + dataset )
    .map( res => res.json() );
  }
  
  pricingTier() {
    return this.http.get( environment.api + '/flux/pricingtier')
    .map( res => res.json() );
  }
  
  infoProduct(eid) {
    return this.http.get( environment.api + '/flux/infoProduit/' + eid )
    .map( res => res.json() );
  }

  rate(currency) {
    return this.http.post( environment.api + '/flux/rate', currency )
    .map( res => res.json() );
  }

  getAssets() {
    return this.http.get( environment.api + '/flux/assets')
    .map( res => res.json() );
  }

  getExchanges() {
    return this.http.get( environment.api + '/flux/exchanges')
    .map( res => res.json() );
  }
}
