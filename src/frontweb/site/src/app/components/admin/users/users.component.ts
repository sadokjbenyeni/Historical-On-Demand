import { Component, OnInit, AfterViewChecked, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpResponse } from '@angular/common/http';

import 'rxjs/add/operator/map';

import { UserService } from '../../../services/user.service';

import { environment } from '../../../../environments/environment';

class DataTablesResponse {
  listusers: any[];
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
    private httpc: HttpClient,
    private userService: UserService
  ) { }

  @ViewChild('utilisateurForm')
  private userForm: NgForm;

  ngOnInit() {
    this.message = '';

    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.httpc
        .post<DataTablesResponse>(environment.api + '/user/list', dataTablesParameters, {})
        .subscribe(res => {
          that.users = res.listusers;
          callback({
            recordsTotal: res.recordsTotal,
            recordsFiltered: res.recordsFiltered,
            data: [],
          });
        });
      },
      columns: [
        { data: 'lastname' },
        { data: 'firstname' },
        { data: 'roleName', orderable: false },
      ]
    };
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
