import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AdministratorServiceService } from '../../../services/administrator-service.service';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  user: any;
  userToUpdate: any;
  //search: string = "";
  users: Array<object>;
  displayedColumns: string[] = ['firstname', 'lastname', 'companyName'];
  dataSource: MatTableDataSource<any>;
  totalCount: number;
  limit: number = 7;
  page: number = 0;
  offset: number = 0;
  order: any[] = [{ column: 'lastname', dir: "asc" }];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("search") search: ElementRef;

  constructor(
    private swalService: SwalAlertService,
    private adminsitratorService: AdministratorServiceService
  ) { }


  @ViewChild('utilisateurForm', { static: false })

  ngOnInit() {
    this.getUsers(this.displayedColumns, this.order, "", 0, 7, 1);
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

  getUsersSorted(event?: PageEvent) {
    if (event) {
      this.limit = event.pageSize;
      this.page = event.pageIndex;
      this.offset = this.limit * (event.pageIndex);
    }
    if (this.sort.active != undefined) {
      this.order = [{ column: this.sort.active, dir: this.sort.direction }];
    }
    this.getUsers(this.displayedColumns, this.order, this.search.nativeElement.value, this.offset, this.limit, this.page);
  }


  getUsers(columns, order, search, offset, limit, page) {
    this.adminsitratorService.getUsers(columns, order, search, offset, limit, page).subscribe(res => {
      this.users = res.listusers;
      this.user = this.users[0];
      this.dataSource = new MatTableDataSource(this.users);
      this.totalCount = res.totalRows;
      if (parseInt(res.totalRows) != parseInt(res.recordsFiltered)) {
        this.totalCount = res.recordsFiltered;
      }

    })
  }
}
