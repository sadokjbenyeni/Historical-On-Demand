import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs';



import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';

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
  selector: 'app-ordersp',
  templateUrl: './ordersp.component.html',
  styleUrls: ['./ordersp.component.css']
})
export class OrderspComponent implements OnInit {
  dateSubmission: Date;
  state: string;
  states: Array<any>;
  search: string;
  message: string;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  listorders: Orders[] = [];
  symbols: any[];

  constructor(
    private router: Router,
    private http: HttpClient,
    private orderService: OrderService,
    private currencyService: CurrencyService
  ) { }

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;
  private countriesForm: NgForm;

  ngOnInit() {
    this.message = '';
    this.dtOptions = {};
    this.state = 'PVP';
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
        that.http
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

  changeState(col) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(this.state).draw();
    })
  }

  changeDate(col) {
    let val = "";
    if (this.dateSubmission && this.dateSubmission['year']) {
      val += this.dateSubmission['year'] + "-" + this.dateSubmission['month'] + '-' + this.dateSubmission['day']
      val += '|';
      val += this.dateSubmission['year'] + "-" + this.dateSubmission['month'] + '-' + (this.dateSubmission['day'] + 1);
    }
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(col).search(val).draw();
    })
  }

  onKey(event: any, col: number) {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      debugger;
      var columns = dtInstance.columns(col)
      columns.search(event.target.value).draw();
    })
  }

  getHt(val, currency, currencyTxUsd, currencyTx, discount) {
    if (currency !== 'usd') {
      let v = ((val / currencyTxUsd) * currencyTx);
      return v - (v * discount / 100);
    } else {
      return val - (val * discount / 100);
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
