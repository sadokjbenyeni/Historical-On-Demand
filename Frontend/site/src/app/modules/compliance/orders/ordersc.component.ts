import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs';



import { OrderService } from '../../../services/order.service';

import { DataTableDirective } from 'angular-datatables';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

class DataTablesResponse {
  listorders: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

class Orders {
  _id: string;
  id: string;
  name: string;
}

@Component({
  selector: 'app-ordersc',
  templateUrl: './ordersc.component.html',
  styleUrls: ['./ordersc.component.css']
})
export class OrderscComponent implements OnInit {
  dateSubmission: Date;
  state: string;
  states: Array<any>;
  purchasetype: string;
  search: string;
  message: string;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  listorders: Orders[] = [];

  constructor(
    private router: Router,
    private httpc: HttpClient,
    private orderService: OrderService
  ) { }

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;
  private countriesForm: NgForm;

  ngOnInit() {
    this.message = '';
    this.dtOptions = {};
    this.state = 'PVC';
    this.purchasetype = 'Select Type'
    this.getListStates();

    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      order: [[1, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.state = this.state;
        that.httpc
          .post<DataTablesResponse>(environment.api + '/order/list', dataTablesParameters, {})
          .subscribe(res => {
            that.listorders = res.listorders;
            callback({
              recordsTotal: res.recordsTotal,
              recordsFiltered: res.recordsFiltered,
              data: [],
            });
          });
      },
      columns: [
        { data: 'companyName' },
        { data: 'id' },
        { data: 'state' },
        { data: 'submissionDate' },
        { data: 'purchasetype' },
        { data: 'redistribution' },
        { data: 'review', searchable: false, orderable: false },
      ]
    };
    this.dtOptions.search = { search: this.search };
  }

  filter(f) {
    this.search = f;
  }

  getList() {
  }

  changeState(col) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(this.state).draw();
    })
  }

    changeType(col) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(this.purchasetype).draw();
    })
  }

  changeDate(col) {
    let val = '';
    if (this.dateSubmission && this.dateSubmission['year']) {
      val += this.dateSubmission['year'] + '-' + this.dateSubmission['month'] + '-' + this.dateSubmission['day']
      val += '|';
      val += this.dateSubmission['year'] + '-' + this.dateSubmission['month'] + '-' + (this.dateSubmission['day'] + 1);
    }
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(val).draw();
    })
  }

  onKey(event: any, col: number) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(event.target.value).draw();
    })
  }

  getListStates() {
    this.orderService.getListStates({}).subscribe(res => {
      this.states = res['states'];
    });
  }
  getStateName(stateId) {
    if (!this.states)
      return stateId;
    return this.states.filter(e => e.id === stateId)[0] ? this.states.filter(e => e.id === stateId)[0].name : stateId;
  }

}
