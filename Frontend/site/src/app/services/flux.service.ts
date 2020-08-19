import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FluxService {

  constructor(private http: HttpClient) { }

  catalogue(dataset) { return this.http.get<any>(environment.api + '/flux/eid/' + dataset) }

  pricingTier() { return this.http.get<any>(environment.api + '/flux/pricingtier') }

  infoProduct(eid) { return this.http.get<any>(environment.api + '/flux/infoProduit/' + eid) }

  rate(currency) { return this.http.post<any>(environment.api + '/flux/rate', currency) }

  getAssets() { return this.http.get<any>(environment.api + '/flux/assets') }

  getExchanges() { return this.http.get<any>(environment.api + '/flux/exchanges') }
}
