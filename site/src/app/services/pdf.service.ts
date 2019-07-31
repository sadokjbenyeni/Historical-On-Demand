import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

@Injectable()
export class PdfService {
  constructor(private http: Http) { }

  pdf(id) {
    return this.http.post( environment.api + '/pdf/', id )
    .map( res => res.json() );
  }

}
