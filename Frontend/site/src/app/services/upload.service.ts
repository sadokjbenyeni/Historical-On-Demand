import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor( private http: HttpClient ) { }

  upload(bodyRequest): Observable<any> {
    return this.http.post<any>(environment.api + '/upload', bodyRequest)
    // .map( res  => res.json() );
  }

  pdfOrderFrom(bodyRequest): Observable<any> {
    return this.http.post<any>(environment.api + '/upload/pdfOrderFrom', bodyRequest)
    // .map( res  => res.json() );
  }

  upd(){
    return this.http.post<any>(environment.api + '/upload/link', {})
    // .map( res  => res );
  }
}
