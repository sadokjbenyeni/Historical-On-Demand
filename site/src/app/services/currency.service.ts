import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable()
export class CurrencyService {

  constructor(private http: HttpClient) { }

  getCurrencies() {
    return this.http.get( environment.api + '/currency')
    // .map( res => res.json() );
  }

  getRib(rib) {
    return this.http.get( environment.api + '/currency/rib/'+ rib)
    // .map( res => res.json() );
  }

  saverib(rib) {
    return this.http.post( environment.api + '/currency/saverib', rib)
    // .map( res => res.json() );
  }

}
