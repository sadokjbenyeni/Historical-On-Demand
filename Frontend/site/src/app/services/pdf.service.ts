import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(private http: HttpClient) { }

  pdf(id) {
    return this.http.post<any>( environment.api + '/pdf/', id );
    // .map( res => res.json() );
  }

}
