import { Component, OnInit, AfterViewChecked, ViewChild, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AdministratorServiceService } from '../../../services/administrator-service.service';
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
    private router: Router,
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
        { data: 'firstname' }
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
  updateUser() {

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to update this user!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.value) {
        this.adminsitratorService.updateUser(this.userToUpdate).subscribe(
          result => {
            Swal.fire({
              icon: 'success',
              title: 'User updated',
              showConfirmButton: false,
              timer: 1500
            })
          },
          error => {
            Swal.fire({
              icon: 'error',
              title: 'Update Failed !',
              text: error.message,
            })
          });
      }
    })
  }

  newUserRoles(newRoles) {
    // sending user role by reference, no needs to affect them ! 
    this.userToUpdate = this.user;
  }
}
