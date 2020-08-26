import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdministratorServiceService } from '../../../services/administrator-service.service';
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
  users: Array<object>;
  displayedColumns: string[] = ['firstname', 'lastname', 'companyName'];
  dataSource: MatTableDataSource<any>;
  totalCount: number;
  limit: number = 10;
  page: number = 0;
  offset: number = 0;
  order: any[] = [{ column: 'lastname', dir: "asc" }];
  selectedUser: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("search") search: ElementRef;

  constructor(private adminsitratorService: AdministratorServiceService) { }

  @ViewChild('utilisateurForm', { static: false })

  ngOnInit() { this.getUsers(this.displayedColumns, this.order, "", this.offset, this.limit, this.page) }
  getUser(id) {
    if (this.user._id != id) {

      this.adminsitratorService.getUserById(id).subscribe(res => {
        this.user = res.user;
        this.selectedUser = this.user._id;
      });
    }
  }

  getUsersSorted(event?: PageEvent) {
    this.dataSource = null;
    this.offset = 0;
    this.page = 0;
    if (event) {
      this.limit = event.pageSize;
      this.page = event.pageIndex;
      this.offset = this.limit * (event.pageIndex);
    }
    if (this.sort.active != undefined) this.order = [{ column: this.sort.active, dir: this.sort.direction }];
    this.getUsers(this.displayedColumns, this.order, this.search.nativeElement.value, this.offset, this.limit, this.page);
  }

  getUsers(columns, order, search, offset, limit, page) {
    this.adminsitratorService.getUsers(columns, order, search, offset, limit, page).subscribe(res => {
      this.users = res.listusers;
      this.user = this.users[0];
      this.selectedUser = this.user?._id;
      this.dataSource = new MatTableDataSource(this.users);
      this.totalCount = res.totalRows;
      if (parseInt(res.totalRows) != parseInt(res.recordsFiltered)) this.totalCount = res.recordsFiltered;
    })
  }
}
