import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, Response } from '@angular/http';

import 'rxjs/add/operator/map';

import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})

export class RoleComponent implements OnInit {
  roles: Array<object>;
  pages: Array<string>;
  // dtOptions: DataTables.Settings = {};
  
  constructor(
    private http: Http,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.getRoles();
    this.getPages();
    
    /*
    this.dtOptions = {
      searching: false,
      info: false,
      ordering: false,
      processing: false,
      paging: false,
      lengthChange: false
    }; */
  }

  getRoles() {
    this.roleService.getRoles()
    .subscribe(res => {
      this.roles = res.roles;
    });
  }

  getPages() {
    this.roleService.getPages()
    .subscribe(res => {
      this.pages = res.pages;
    });
  }

}
