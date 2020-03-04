import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable()
export class VatService {

  constructor(private http: HttpClient) { }

  checkVat(vat) {
    return this.http.get( environment.api + '/verifyvat/'+ vat );
    // .map( res => res.json() );
  }

}
