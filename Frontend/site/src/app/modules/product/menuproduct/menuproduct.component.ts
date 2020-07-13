import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-product',
  templateUrl: './menuproduct.component.html',
  styleUrls: ['./menuproduct.component.css']
})
export class MenuproductComponent implements OnInit {

  pageConfig: { page: string; active: boolean; link: string; }[];
  constructor() { }

  ngOnInit() {
    this.pageConfig = [
      {page: 'Client Orders', active: false, link: '/product/orders'},
      {page: 'Settings', active: false, link: '/product/config'}
    ];
  }

}
