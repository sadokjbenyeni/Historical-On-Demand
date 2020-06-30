import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { map } from 'rxjs/operators';
import { DownloadInvoiceService } from '../../../services/Intern/download-invoice.service';
import { OrderPreview } from '../../../models/Order/order-preview';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token',
  })
};

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  pageSizeOptions: number[] = [5, 10, 25, 100];

  token: any;
  currencyTx: any;
  currencyTxUsd: any;
  currency: any;
  symbols: any[];
  totalExchangeFees: any;
  totalHT: any;
  discount: any;
  statusList: Array<any>;
  command: Array<any>;
  userId: string;


  clientOrderTableColumns: string[] = ['orderId', 'submissionDateTime', 'orderStatus', 'totalOrderAmount', 'invoice', 'details'];
  public dataSource = new MatTableDataSource();

  constructor(
    private orderService: OrderService,
    private currencyService: CurrencyService,
    private downloadInvoiceService: DownloadInvoiceService
  ) {
  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.symbols = [];
    this.listCurrencies();
    this.userId = JSON.parse(sessionStorage.getItem('user'))._id;
    this.token = JSON.parse(sessionStorage.getItem('user')).token;
    this.getOrders();
  }

  getOrders() {
    httpOptions.headers = httpOptions.headers.set('Authorization', this.token);
    this.orderService.getClientOrders(httpOptions).pipe(map(
      orderTable =>
        orderTable['listorders'].map(order => new OrderPreview(order['id'], order['submissionDate'], this.getStatusName(order['state']), this.getTTCWithCurrency(order, order['currency']), order, order['_id']))
    ))
      .subscribe(result => {
        this.dataSource.data = result;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, error => console.log(error));
  }

  getStatusName(statusId) {
    if (!this.statusList)
      return statusId;
    return this.statusList.filter(status => status.id === statusId)[0] ? this.statusList.filter(status => status.id === statusId)[0].name : statusId;
  }

  listCurrencies() {
    this.currencyService.getCurrencies().subscribe(list => {
      list.currencies.forEach(item => {
        this.symbols[item.id] = item.symbol;
      });
    });
  }

  getCurrency(currency) {
    return this.symbols[currency];
  }

  getTTC(order) {
    let ttc = 0;
    if (order.currency !== 'usd') {
      ttc = (((order.totalHT + order.totalExchangeFees) / order.currencyTxUsd) * order.currencyTx);
    }
    else {
      ttc = order.totalHT + order.totalExchangeFees;
    }
    if (order.discount > 0) {
      ttc = ttc - (ttc * (order.discount / 100));
    }
    return this.precisionRound((ttc * (1 + order.vatValue)), 2);
  }

  getTTCWithCurrency(order, currency) {
    return this.getTTC(order) + this.getCurrency(currency);
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.toLowerCase();
  }

  downloadInvoice(orderId, invoiceId, pdfType) {
    this.downloadInvoiceService.getInvoice(orderId, invoiceId, pdfType);
  }
}

