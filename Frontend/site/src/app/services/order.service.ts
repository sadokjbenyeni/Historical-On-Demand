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

  rib(order) { return this.http.post<any>(environment.api + '/order/rib', order) }

  payment(order) { return this.http.post<any>(environment.api + '/order/save', order) }

  verify(order) { return this.http.post<any>(environment.api + '/order/verify', order) }

  logPayement(log) { return this.http.post<any>(environment.api + '/order/logPayement', log) }

  updateOrder(order) { return this.http.put<any>(environment.api + '/order/update', order) }

  updateProductDate(order) { return this.http.put<any>(environment.api + '/order/updateProductDate', order) }

  updtProductCaddy(order) { return this.http.put<any>(environment.api + '/order/updtProductCaddy', order) }

  updateDiscount(order) { return this.http.put<any>(environment.api + '/order/updateDiscount', order) }

  updateEngagementPeriod(order) { return this.http.put<any>(environment.api + '/order/updateEngagementPeriod', order) }

  delElemOrder(order) { return this.http.put<any>(environment.api + '/order/delProductCaddy', order) }

  getIdCmd(iduser) { return this.http.post<any>(environment.api + '/order/usercaddy', { id: iduser }) }

  getOrder(user) { return this.http.get<any>(environment.api + '/order/' + user) }

  postOrder(user, sort = 1) { return this.http.post<any>(environment.api + '/order', { user: user, sort: sort }) }

  getIdOrder(id) { return this.http.get<any>(environment.api + '/order/idCmd/' + id) }

  getRetry(id, mode) { return this.http.get<any>(environment.api + '/order/retry/' + id + '/' + mode) }

  getList(requete, order) { return this.http.post<any>(environment.api + '/order/list', { requete: requete, order: order }) }

  getListExport(requete) { return this.http.post<any>(environment.api + '/order/listExport', requete) }

  getCaddies(currency = null) { return this.http.post<any>(environment.api + '/order/caddies', { currency: currency }) }

  getCaddy() { return this.http.get<any>(environment.api + '/order/caddy') }

  getListStates(requete) { return this.http.get<any>(environment.api + '/order/listStates', requete) }

  sortProducts(requete) { return this.http.post<any>(environment.api + '/order/sortProducts', requete) }

  SaveOrderMetadata(orderId: Number, internalNote: String, sales: String, OrderType: String) {
    return this.http.put<any>(environment.api + '/order/updatemetadata', { id: orderId, note: internalNote, sales: sales, type: OrderType })
  }

  getClientOrders() { return this.http.get<any>(environment.api + '/order') }

  getOrderDetailsById(orderId) { return this.http.get<any>(environment.api + '/order/details/' + orderId) }

  getSupportOrderDetailsById(orderId) { return this.http.get<any>(environment.api + '/support/order/details/' + orderId) }

  getSupportLogsOrdersById(orderId) { return this.http.get<any>(environment.api + '/support/orderProductLog/' + orderId) }

  cancelProductValidation(orderId) { return this.http.put<any>(environment.api + '/order/cancelValidation', { id: orderId }) }

  abortOrder(orderId) { return this.http.put<any>(environment.api + '/order/abortOrder', { id: orderId }) }

  complianceStatusUpdate(idCmd, status, referer, email) { return this.http.put<any>(environment.api + '/order/complianceStatusUpdate', { idCmd: idCmd, status: status, referer: referer, email: email }) }

  productStatusUpdate(order) { return this.http.put<any>(environment.api + '/order/productStatusUpdate', { order }) }

  financeStatusUpdate(order) { return this.http.put<any>(environment.api + '/order/financeStatusUpdate', { order }) }

  clientStatusUpdate(order) { return this.http.put<any>(environment.api + '/order/clientStatusUpdate', { order }) }
}

