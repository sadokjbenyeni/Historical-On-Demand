import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable()
export class ElasticService {

  constructor(private http: HttpClient) { }

  getSearch(search) {
    return this.http.post<any>( environment.api + '/search', search )
    // .map( res => res.json() );
  }

}
