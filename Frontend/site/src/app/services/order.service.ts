import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { env } from 'process';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  updateCaddyState(state: string): Observable<any> {
    return this.http.put(environment.api + '/order/changePresubmitState', { state: state })
  }

  submitCaddy(currency: string, survey: any, billingInfo: any): Observable<any> {
    return this.http.post(environment.api + '/order/submitCaddy', { currency: currency, survey: survey, billingInfo: billingInfo })
  }

  constructor(private http: HttpClient) { }

  rib(order) {
    return this.http.post<any>(environment.api + '/order/rib', order);// .map( res => res.json() );
  }
  state(order) {
    return this.http.put<any>(environment.api + '/order/state', order);// .map( res => res.json() );
  }
  payment(order) {
    return this.http.post<any>(environment.api + '/order/save', order);// .map( res => res.json() );
  }
  verify(order) {
    return this.http.post<any>(environment.api + '/order/verify', order);// .map( res => res.json() );
  }

  logPayement(log) {
    return this.http.post<any>(environment.api + '/order/logPayement', log);// .map( res => res.json() );
  }

  updateOrder(order) {
    return this.http.put<any>(environment.api + '/order/update', order);// .map( res => res.json() );
  }
  updateProductDate(order) {
    return this.http.put<any>(environment.api + '/order/updateProductDate', order);// .map( res => res.json() );
  }

  updtProductCaddy(order) {
    return this.http.put<any>(environment.api + '/order/updtProductCaddy', order);// .map( res => res.json() );
  }

  updateDiscount(order) {
    return this.http.put<any>(environment.api + '/order/updateDiscount', order);// .map( res => res.json() );
  }

  updateEngagementPeriod(order) {
    return this.http.put<any>(environment.api + '/order/updateEngagementPeriod', order);// .map( res => res.json() );
  }

  delElemOrder(order) {
    return this.http.put<any>(environment.api + '/order/delProductCaddy', order);// .map( res => res.json() );
  }

  getIdCmd(iduser) {
    return this.http.post<any>(environment.api + '/order/usercaddy', { id: iduser });// .map( res => res.json() );
  }

  getOrder(user) {
    return this.http.get<any>(environment.api + '/order/' + user);// .map( res => res.json() );
  }
  postOrder(user, sort = 1) {
    return this.http.post<any>(environment.api + '/order', { user: user, sort: sort });// .map( res => res.json() );
  }

  getIdOrder(id) {
    var result = this.http.get<any>(environment.api + '/order/idCmd/' + id);// .map( res => res.json() );
    return result
  }

  getRetry(id, mode) {
    return this.http.get<any>(environment.api + '/order/retry/' + id + '/' + mode);// .map( res => res.json() );
  }

  getList(requete, order) {
    return this.http.post<any>(environment.api + '/order/list', { requete: requete, order: order });// .map( res => res.json() );
  }
  getListExport(requete) {
    return this.http.post<any>(environment.api + '/order/listExport', requete);// .map( res => res.json() );
  }

  getCaddies(currency = null) {
    return this.http.post<any>(environment.api + '/order/caddies', { currency: currency });// .map( res => res.json() );
  }
  getCaddy() {
    return this.http.get<any>(environment.api + '/order/caddy');// .map( res => res.json() );
  }

  getListStates(requete) {
    return this.http.get<any>(environment.api + '/order/listStates', requete);// .map( res => res.json() );
  }

  sortProducts(requete) {
    return this.http.post<any>(environment.api + '/order/sortProducts', requete);// .map( res => res.json() );
  }

  SaveOrderMetadata(orderId: Number, internalNote: String, sales: String, OrderType: String) {
    return this.http.put<any>(environment.api + '/order/updatemetadata', { id: orderId, note: internalNote, sales: sales, type: OrderType });
  }

  getClientOrders() {
    return this.http.get<any>(environment.api + '/order');
  }

  getOrderDetailsById(orderId) {
    return this.http.get<any>(environment.api + '/order/details/' + orderId);
  }

  getSupportOrderDetailsById(orderId) {
    return this.http.get<any>(environment.api + '/support/order/details/' + orderId);
  }

  getSupportLogsOrdersById(orderId) {
    return this.http.get<any>(environment.api + '/support/orderProductLog/' + orderId);
  }

  cancelProductValidation(orderId) {
    return this.http.put<any>(environment.api + '/order/cancelValidation', { id: orderId });
  }

  abortOrder() {
    return this.http.put<any>(environment.api + '/order/abortOrder', {});
  }

}

