import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-compliance',
  templateUrl: './menucompliance.component.html',
  styleUrls: ['./menucompliance.component.css']
})
export class MenucomplianceComponent implements OnInit {

  pageConfig: { page: string; active: boolean; link: string; }[];
  constructor() { }

  ngOnInit() {
    this.pageConfig = [
      {page: 'Client Orders', active: false, link: '/compliance/orders'},
      // {page: 'Configuration', active: false, link: '/compliance/config'}
    ];
  }

}
