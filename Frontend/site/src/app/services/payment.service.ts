import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  getPayments() { return this.http.get<any>(environment.api + '/payment') }

  getPaymentsActive() { return this.http.get<any>(environment.api + '/payment/active') }

  save(p) { return this.http.put<any>(environment.api + '/payment', p) }

}
