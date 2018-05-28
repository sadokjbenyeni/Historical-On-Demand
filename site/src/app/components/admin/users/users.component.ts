import { Component, OnInit, AfterViewChecked, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';

import { UserService } from '../../../services/user.service';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewChecked {

  message: string;
  users: Array<object>;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private http: Http,
    private router: Router,
    private userService: UserService
  ) { }

  @ViewChild('utilisateurForm')
  private userForm: NgForm;

  ngOnInit() {
    this.message = '';

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };

    this.userService.getUsers().subscribe(res => {
      this.users = res.users;
      // console.dir(res.users);
      // console.log(typeof res.users['roleName']);
      // this.users['roleName'] = res.users['roleName'].join(', ');
      this.dtTrigger.next();
    });
  }

  ngAfterViewChecked() {

  }

  add() {
  }
  edit(id): void {
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }
}
