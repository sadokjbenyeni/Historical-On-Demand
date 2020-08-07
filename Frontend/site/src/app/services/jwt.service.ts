import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor(private http: HttpClient) { }

  verifyTokenValidity(token) {
    return this.http.post<any>(environment.api + "/jwt/checkTokenValidity", { token: token });
  }
}
