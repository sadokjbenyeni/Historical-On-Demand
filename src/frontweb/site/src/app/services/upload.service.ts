import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from '../../environments/environment';

@Injectable()
export class UploadService {

  constructor( private http: Http ) { }

  upload(bodyRequest): Observable<any> {
    return this.http.post(environment.api + '/upload', bodyRequest)
    .map( res  => res.json() );
  }

  pdfOrderFrom(bodyRequest): Observable<any> {
    return this.http.post(environment.api + '/upload/pdfOrderFrom', bodyRequest)
    .map( res  => res.json() );
  }

  upd(){
    return this.http.post(environment.api + '/upload/link', {})
    .map( res  => res );
  }
}
