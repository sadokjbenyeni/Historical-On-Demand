import { Injectable, Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';


import { OrderService } from '../../../services/order.service';
import { DataTableDirective } from 'angular-datatables';
import { environment } from '../../../../environments/environment';

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

class DataTablesResponse {
  listorders: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

class column {
  id: string;
  name: string;
}

class Orders {
  _id: string;
  id: string;
  name: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})

@Injectable()
export class OrdersComponent implements OnInit {
  columns: Array<column>;
  columnsSelect: Array<column>;
  export: boolean;
  beginDate: Date;
  endDate: Date;
  dateSubmission: Date;
  state: string;
  states: Array<any>;
  search: string;
  message: string;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  listorders: Orders[] = [];
  ncol: string;

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
    this.export = false;
    this.message = '';
    this.ncol = '';
    this.columnsSelect = [];
    this.dtOptions = {};
    this.state = 'PVF';
    this.columns = [
      {id:'idFacture', name:'Invoice ID'},
      {id:'idUser', name:'Client ID'},
      {id:'firstname|lastname', name:'Client Name'},
      {id:'createdAT', name:'Order Date'},
      {id:'paymentDate', name:'Payment Date'},
      {id:'total', name:'TOTAL Order Amount'},
      {id:'currency', name:'Order Currency'},
    ];
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
            recordsFiltered: res.recordsTotal,
            data: [],
          });
        });
      },
      columns: [ 
        { data: 'companyName' },
        { data: 'id' },
        { data: 'state' },
        { data: 'updatedAt' },
        { data: 'total' },
        { data: 'discount' },
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
    if(this.dateSubmission){
      val += this.dateSubmission['year'] + "-" + this.dateSubmission['month'] + '-' + this.dateSubmission['day']
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

  openExport() {
    this.export = true;
  }
  closeExport() {
    this.export = false;
  }

  addCol(e) {
    let c = e.split('§');
    this.columnsSelect.push({id: c[0], name: c[1]});
  }

  exportFile() {
    // let filter = {this.columnsSelect
  }

  delCol(a) {
    this.columnsSelect.splice(this.columnsSelect.indexOf(a), 1);
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['Invoice'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  getHt(val, currency, currencyTxUsd, currencyTx, discount, vatValue){
    let v = 0;
    if (currency !== 'usd') {
      v = ((val / currencyTxUsd) * currencyTx);
      v = v - (v * discount/100)
      return v * (1 + vatValue);
    } else{
      v = val - (val * discount/100);
      return v * (1 + vatValue);
    }
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }


  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }
}
