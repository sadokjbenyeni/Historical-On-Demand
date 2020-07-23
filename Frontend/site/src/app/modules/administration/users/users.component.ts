import { Component, OnInit, AfterViewChecked, ViewChild, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AdministratorServiceService } from '../../../services/administrator-service.service';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';
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
export class UsersComponent implements OnInit {

  user: any;
  userToUpdate: any;
  message: string;
  users: Array<object>;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private swalService: SwalAlertService,
    private httpc: HttpClient,
    private adminsitratorService: AdministratorServiceService
  ) { }

  @ViewChild('utilisateurForm', { static: false })
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
            this.user = this.users[0];
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
        { data: 'companyName' }
      ]
    };
  }
  getUser(id) {
    if (this.user._id != id) {
      this.adminsitratorService.getUserById(id).subscribe(res => {
        this.user = res.user;
      });
    }
  }
  async updateUser() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', `You are going to update ${this.userToUpdate.firstname} ${this.userToUpdate.lastname} roles!`)
    if (result.value) {
      this.adminsitratorService.updateUser(this.userToUpdate)
        .subscribe(result => {
          if (result) {
            this.swalService.getSwalForNotification(`${this.userToUpdate.firstname} ${this.userToUpdate.lastname} roles updated`, `${this.userToUpdate.firstname} ${this.userToUpdate.lastname}roles have been updated!`),
              error => {
                this.swalService.getSwalForNotification('Updating roles Failed !', error.message, 'error')
              }
          }
        })
    }
  }

  newUserRoles(newRoles) {
    // sending user role by reference, no needs to affect them ! 
    this.userToUpdate = this.user;
  }
}
