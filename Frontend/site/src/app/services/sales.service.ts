import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor(private Http: HttpClient) { }

  public getSales(): Observable<any> { return this.Http.get<any>(environment.api + '/sales') }
}
