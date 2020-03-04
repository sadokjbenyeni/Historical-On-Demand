import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable()
export class ConfigService {

  constructor(private http: HttpClient) { }

  getVat() {
    return this.http.get( environment.api + '/config/vat' );
    // .map( res => res.json() );
  }
  getPeriod() {
    return this.http.get( environment.api + '/config/period' );
    // .map( res => res.json() );
  }
  getPricingTier() {
    return this.http.get( environment.api + '/config/pricingTier' );
    // .map( res => res.json() );
  }
  setPricingTier(adtv) {
    return this.http.put( environment.api + '/config/pricingTier', adtv );
    // .map( res => res.json() );
  }
  setVat(vat) {
    return this.http.put( environment.api + '/config/vat', vat );
    // .map( res => res.json() );
  }
  getDownloadSetting() {
    return this.http.get( environment.api + '/config/downloadSetting' );
    // .map( res => res.json() );
  }
  setDownloadSetting(downloadSetting) {
    return this.http.put( environment.api + '/config/downloadSetting', downloadSetting );
    // .map( res => res.json() );
  }
  getElasticSetting() {
    return this.http.get( environment.api + '/config/elastic' );
    // .map( res => res.json() );
  }
  
}