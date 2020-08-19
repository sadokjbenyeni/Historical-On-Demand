import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliverablesService {

  constructor(private http: HttpClient) { }

  getLinks(orderId: String): Observable<any> {
    return this.http.get<any>(environment.api + "/deliverables/links/" + orderId, { headers: { authorization: JSON.parse(sessionStorage.getItem('user')).token } })
  }
}

