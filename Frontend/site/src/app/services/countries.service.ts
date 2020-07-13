import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  constructor(private http: HttpClient) { }

  getCountries() {
    return this.http.get<any>( environment.api + '/countries' );
    // .map( res => res.json() );
  }
  isUE(id) {
    return this.http.post<any>( environment.api + '/countries/isUE', id );
    // .map( res => res.json() );
  }
  saveUE(country) {
    return this.http.put<any>( environment.api + '/countries/ue', country );
    // .map( res => res.json() );
  }

}
