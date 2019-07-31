import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';

import { OrderService } from '../../../services/order.service';

import { DataTableDirective } from 'angular-datatables';

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
  selector: 'app-client-order',
  templateUrl: './client-order.component.html',
  styleUrls: ['./client-order.component.css']
})
export class ClientOrderComponent implements OnInit {

  dateSubmission: Date;
  state: string;
  states: Array<any>;
  search: string;
  message: string;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  listorders: Orders[] = [];

  constructor(
    private http: Http,
    private router: Router,
    private httpc: HttpClient,
    private orderService: OrderService
  ) { }

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;
  private countriesForm: NgForm;

  ngOnInit() {
    this.message = '';
    this.dtOptions = {};
    this.state = '';
    this.states = [
      {id:'PLI', name: 'Pending Licensing Information' },
      {id:'PBI', name: 'Pending Billing Information' },
      {id:'PSC', name: 'Pending Submission by Client' },
      {id:'PVP', name: 'Pending Validation by Product' },
      {id:'PVC', name: 'Pending Validation by Compliance' },
      {id:'PVF', name: 'Pending Validation by Finance' },
      {id:'validated', name: 'Validated' },
      {id:'active', name: 'Active' },
      {id:'inactive', name: 'Inactive' },
      {id:'cancelled', name: 'Cancelled' },
      {id:'rejected', name: 'Rejected' }
    ];

    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
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
        // { data: 'period' },  
        { data: 'redistribution' },
        { data: 'review', searchable: false, orderable: false },
      ]
    };
    this.dtOptions.search = { search: this.search };
  }

  filter(f){
    this.search = f;
    // this.dtOptions.draw();
  }

  getList(){
    // this.orderService.getList({},{}).subscribe(res=>{
    //   this.listorders = res;
    // });
  }

  changeState(col){
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(this.state).draw();
    })    
  }

  changeDate(col){
    let val = "";
    if(this.dateSubmission && this.dateSubmission['year']){
      val += this.dateSubmission['year'] + "-" + this.dateSubmission['month'] + '-' + this.dateSubmission['day'];
      val += '|';
      val += this.dateSubmission['year'] + "-" + this.dateSubmission['month'] + '-' + (this.dateSubmission['day']+1);
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

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }

}
