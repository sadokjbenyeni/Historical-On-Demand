import { Injectable, Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs';




import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';
import { DataTableDirective } from 'angular-datatables';
import { environment } from '../../../../environments/environment';

import * as XLSX from 'xlsx';
import { AngularCsv } from 'angular7-csv/dist/Angular-csv';
import { HttpClient } from '@angular/common/http';

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

class DataExport {
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
  beginDate: any;
  endDate: any;
  dateSubmission: Date;
  purchasetype: string;
  state: string;
  states: Array<any>;
  search: string;
  message: string;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  listorders: Orders[] = [];
  listextract: DataExport[] = [];
  ncol: string;
  typeexport: string;
  beginID: any;
  endID: any;
  symbols: any[];
  internalNotes: string;

  constructor(

    private httpc: HttpClient,
    private orderService: OrderService,
    private currencyService: CurrencyService
  ) { }

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;
  private countriesForm: NgForm;

  ngOnInit() {
    this.export = false;
    this.message = '';
    this.ncol = '';
    this.beginID = null;
    this.endID = null;
    this.beginDate = null;
    this.purchasetype = 'Select Type';
    this.endDate = null;
    this.typeexport = "csv";
    this.columnsSelect = [];
    this.dtOptions = {};
    this.state = 'PVF';
    this.columns = [
      { id: 'idFacture', name: 'Invoice ID' },
      { id: 'idUser', name: 'Client ID' },
      { id: 'firstname|lastname', name: 'Client Name' },
      { id: 'createdAT', name: 'Order Date' },
      { id: 'paymentDate', name: 'Payment Date' },
      { id: 'total', name: 'TOTAL Order Amount' },
      { id: 'currency', name: 'Order Currency' },
    ];
    this.getListStates();
    this.getCurrencies();

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
        { data: 'total' },
        { data: 'purchasetype' },
        { data: 'discount' },
        { data: 'redistribution' },
        { data: 'review', searchable: false, orderable: false },
      ]
    };
    this.dtOptions.search = { search: this.search };
  }

  filter(f) {
    this.search = f;
    // this.dtOptions.draw();
  }

  getList() {
    // this.orderService.getList({},{}).subscribe(res=>{
    //   this.listorders = res;
    // });
  }

  changeState(col) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(this.state).draw();
    });
  }

  changeType(col) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(this.purchasetype).draw();
    });
  }

  changeDate(col) {
    let val = "";
    if (this.dateSubmission && this.dateSubmission['year']) {
      val += this.dateSubmission['year'] + "-" + this.dateSubmission['month'] + '-' + this.dateSubmission['day'];
      val += '|';
      val += this.dateSubmission['year'] + "-" + this.dateSubmission['month'] + '-' + (this.dateSubmission['day'] + 1);
    }
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(val).draw();
    });
  }

  onKey(event: any, col: number) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(event.target.value).draw();
    });
  }

  openExport() {
    this.export = true;
  }
  closeExport() {
    this.export = false;
  }

  addCol(e) {
    let c = e.split('§');
    this.columnsSelect.push({ id: c[0], name: c[1] });
  }

  exportFile() {
    let req = { state: { $in: ["PVF", "validated"] } };
    // if( this.beginID !== "" && this.endID !== "" ){
    //   req["id"] = { $gte: this.beginID, $lte: this.endID };
    // }
    let ids = {};
    if (this.beginID) {
      ids["$gte"] = this.beginID;
    }
    if (this.endID) {
      ids["$lte"] = this.endID;
    }
    if (this.beginID || this.endID) { req["id"] = ids; }

    let dates = {};
    if (this.beginDate) {
      dates["$gte"] = new Date(this.beginDate.year + '-' + this.beginDate.month + '-' + this.beginDate.day);
    }
    if (this.endDate) {
      dates["$lte"] = new Date(this.endDate.year + '-' + this.endDate.month + '-' + this.endDate.day);
    }
    if (this.endDate || this.beginDate) { req["submissionDate"] = dates; }

    if (this.typeexport === "csv") {
      this.orderService.getListExport(req).subscribe(data => {
        let options = {
          fieldSeparator: ',',
          quoteStrings: '"',
          decimalseparator: '.',
          showTitle: true,
          useBom: true,
          headers: [
            "Invoice_ID",
            "Client_ID",
            "Client_Name",
            "Client_Country",
            "Order_Date",
            "Payment_Date",
            "Order_Currency",
            "Order_Amount_Before_Taxes",
            "Exchange_Fees",
            "VAT",
            "Payment_Method",
            "Payment_Reference",
            "TOTAL_Order_Amount",
          ]
        };
        new AngularCsv(data, 'Invoices_export_' + new Date().getTime(), options);
      });
    }
    if (this.typeexport === "xlsx") {
      this.orderService.getListExport(req).subscribe(data => {
        this.exportAsExcelFiles(data, "Invoices");
      });
    }
  }

  toExportFileName(excelFileName: string): string {
    return `${excelFileName}_export_${new Date().getTime()}.xlsx`;
  }

  exportAsExcelFiles(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, this.toExportFileName(excelFileName));
  }

  // saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob(['\ufeff' + buffer], { type: 'text/csv;charset=utf-8;' });
  //   FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + ".csv");
  // }

  delCol(a) {
    this.columnsSelect.splice(this.columnsSelect.indexOf(a), 1);
  }

  getHt(val, currency, currencyTxUsd, currencyTx, discount, vatValue) {
    let v = 0;
    if (currency !== 'usd') {
      v = ((val / currencyTxUsd) * currencyTx);
      v = v - (v * discount / 100);
      return v * (1 + vatValue);
    } else {
      v = val - (val * discount / 100);
      return v * (1 + vatValue);
    }
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
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

  getCurrencies() {
    this.currencyService.getCurrencies().subscribe(r => {
      this.symbols = [];
      r.currencies.forEach(s => {
        this.symbols[s.id] = s.symbol;
      });
    });
  }

}
