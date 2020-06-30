import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  search: string;

  constructor(private data: DataService) { }

  ngOnInit() {
    this.data.currentSearch.subscribe(search => this.search = search);
  }

  changeSearch(dataset, search) {
    sessionStorage.setItem('dataset', JSON.stringify({ dataset: dataset, title: search }));
    this.data.changeSearch(search);
  }

}
