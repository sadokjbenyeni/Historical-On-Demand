import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable()
export class CurrencyService {

  constructor(private http: HttpClient) { }

  getCurrencies() {
    return this.http.get<any>( environment.api + '/currency')
    // .map( res => res.json() );
  }

  getRib(rib: string) {
    return this.http.get<any>( environment.api + '/currency/rib/' + rib)
    // .map( res => res.json() );
  }

  saveRib(rib: any) {
    return this.http.post<any>( environment.api + '/currency/saverib', rib)
    // .map( res => res.json() );
  }

}
