import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DataService {

  private searchSource = new BehaviorSubject<string>('');
  currentSearch = this.searchSource.asObservable();
  constructor() { }
  changeSearch(search: string) {
    this.searchSource.next(search);
  }

}
