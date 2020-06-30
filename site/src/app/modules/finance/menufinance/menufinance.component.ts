import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-finance',
  templateUrl: './menufinance.component.html',
  styleUrls: ['./menufinance.component.css']
})
export class MenufinanceComponent implements OnInit {

  pageConfig: { page: string; active: boolean; link: string; }[];
  constructor() { }

  ngOnInit() {
    this.pageConfig = [
      {page: 'Client Orders', active: false, link: '/finance/orders'},
      {page: 'Settings', active: false, link: '/finance/config'}
    ];
  }

}
