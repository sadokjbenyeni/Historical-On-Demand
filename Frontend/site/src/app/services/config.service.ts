import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private http: HttpClient) { }

  getVat() { return this.http.get<any>(environment.api + '/config/vat') }

  getPeriod() { return this.http.get<any>(environment.api + '/config/period') }

  getPricingTier() { return this.http.get<any>(environment.api + '/config/pricingTier') }

  setPricingTier(adtv) { return this.http.put<any>(environment.api + '/config/pricingTier', adtv) }

  setVat(vat) { return this.http.put<any>(environment.api + '/config/vat', vat) }

  getDownloadSetting() { return this.http.get<any>(environment.api + '/config/downloadSetting') }

  setDownloadSetting(downloadSetting) { return this.http.put<any>(environment.api + '/config/downloadSetting', downloadSetting) }
  
  getElasticSetting() { return this.http.get<any>(environment.api + '/config/elastic') }
}