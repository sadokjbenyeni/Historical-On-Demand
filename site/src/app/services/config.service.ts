import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class ConfigService {

  constructor(private http: Http) { }

  getVat() {
    return this.http.get( environment.api + '/config/vat' )
    .map( res => res.json() );
  }
  getPeriod() {
    return this.http.get( environment.api + '/config/period' )
    .map( res => res.json() );
  }
  getPricingTier() {
    return this.http.get( environment.api + '/config/pricingTier' )
    .map( res => res.json() );
  }
  setPricingTier(adtv) {
    return this.http.put( environment.api + '/config/pricingTier', adtv )
    .map( res => res.json() );
  }
  setVat(vat) {
    return this.http.put( environment.api + '/config/vat', vat )
    .map( res => res.json() );
  }
  getDownloadSetting() {
    return this.http.get( environment.api + '/config/downloadSetting' )
    .map( res => res.json() );
  }
  setDownloadSetting(downloadSetting) {
    return this.http.put( environment.api + '/config/downloadSetting', downloadSetting )
    .map( res => res.json() );
  }

}