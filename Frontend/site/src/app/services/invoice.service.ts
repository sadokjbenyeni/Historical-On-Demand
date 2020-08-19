import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }

  downloadInvoice(orderId: any, pdfType: any): Observable<any> {
    const options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), observe: 'response' as 'body', responseType: 'blob' as 'blob' };
    return this.http.get(environment.api + "/invoice/download/" + orderId + '/' + pdfType, options).map((resObj: Blob) => resObj).catch((errorObj: any) => Observable.throw(errorObj || 'Server error'));
  }

  generateInvoice(orderId: any): Observable<any> { return this.http.get<any>(environment.api + "/invoice/generate/" + orderId) }
}


