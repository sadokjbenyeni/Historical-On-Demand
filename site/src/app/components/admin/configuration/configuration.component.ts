import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  pageConfig: { page: string; active: boolean; link: string; }[];
  constructor() {}

  ngOnInit() {
    this.pageConfig = [
      {page: 'Roles', active: false, link: '/admin/role'},
      {page: 'Users', active: false, link: '/admin/users'},
      {page: 'Client Order', active: false, link: '/admin/clientorder'},
      {page: 'Countries', active: false, link: '/admin/countries'},
      {page: 'Terms', active: false, link: '/admin/terms'},
      {page: 'Variables Environment', active: false, link: '/admin/variable'},
      {page: 'Management Help', active: false, link: '/admin/help'}
    ];
  }
}
