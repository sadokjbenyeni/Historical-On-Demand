import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class OrderService {

  constructor(private http: Http) { }

  rib(order) {
    return this.http.post( environment.api + '/order/rib', order ).map( res => res.json() );
  }
  state(order) {
    return this.http.put( environment.api + '/order/state', order ).map( res => res.json() );
  }
  payment(order) {
    return this.http.post( environment.api + '/order/save', order ).map( res => res.json() );
  }
  verify(order) {
    return this.http.post( environment.api + '/order/verify', order ).map( res => res.json() );
  }

  updateOrder(order) {
    return this.http.put( environment.api + '/order/update', order ).map( res => res.json() );
  }

  updtProductCaddy(order) {
    return this.http.put( environment.api + '/order/updtProductCaddy', order ).map( res => res.json() );
  }
  
  updtCaddy(order) {
    return this.http.put( environment.api + '/order/updtCaddy', order ).map( res => res.json() );
  }

  delElemOrder(order) {
    return this.http.put( environment.api + '/order/delProductCaddy', order ).map( res => res.json() );
  }

  getIdCmd(iduser) {
    return this.http.post(environment.api + '/order/usercaddy',{id:iduser}).map( res => res.json() );
  }

  getOrder(user) {
    return this.http.get( environment.api + '/order/' +  user ).map( res => res.json() );
  }
  getIdOrder(id) {
    return this.http.get( environment.api + '/order/idCmd/' +  id ).map( res => res.json() );
  }

  getList(requete, order) {
    return this.http.post( environment.api + '/order/list',  {requete:requete, order: order} ).map( res => res.json() );
  }

  getCaddies(user) {
    return this.http.post( environment.api + '/order/caddies',  user ).map( res => res.json() );
  }

}
