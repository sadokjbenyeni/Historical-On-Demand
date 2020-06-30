import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menusupport',
  templateUrl: './menusupport.component.html',
  styleUrls: ['./menusupport.component.css']
})
export class MenusupportComponent implements OnInit {

  pageConfig: { page: string; active: boolean; link: string; }[];
  constructor() { }

  ngOnInit() {
    this.pageConfig = [
      {page: 'Client Orders', active: false, link: '/support/clientorder'},
    ];
  }

}
