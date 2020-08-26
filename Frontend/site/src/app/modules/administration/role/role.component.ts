import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})

export class RoleComponent implements OnInit {
  roles: Array<object>;
  pages: Array<string>;

  constructor(
    private http: HttpClient,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.getRoles();
    this.getPages();
  }

  getRoles() {
    this.roleService.getRoles().subscribe(res => { this.roles = res.roles });
  }

  getPages() {
    this.roleService.getPages().subscribe(res => { this.pages = res.pages });
  }
}
