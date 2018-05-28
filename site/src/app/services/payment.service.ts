import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class PaymentService {

  constructor(private http: Http) { }

  getPayments(){
    return this.http.get( environment.api + '/payment' )
    .map( res => res.json() );
  }

  getPaymentsActive(){
    return this.http.get( environment.api + '/payment/active' )
    .map( res => res.json() );
  }

  save(p){
    return this.http.put( environment.api + '/payment', p )
    .map( res => res.json() );
  }

}
