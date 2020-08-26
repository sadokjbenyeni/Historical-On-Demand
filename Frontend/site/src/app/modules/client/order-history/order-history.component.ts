import { Component, OnInit, ViewChild } from '@angular/core';

import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { map } from 'rxjs/operators';
import { DownloadInvoiceService } from '../../../services/Intern/download-invoice.service';
import { OrderPreview } from '../../../core/models/order-preview.model';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  pageSizeOptions: number[] = [5, 10, 25, 100];
  symbols: any[];
  statusList: Array<any>;
  clientOrderTableColumns: string[] = ['orderId', 'submissionDateTime', 'orderStatus', 'totalOrderAmount', 'invoice', 'details'];
  public dataSource: MatTableDataSource<any>;

  constructor(
    private orderService: OrderService,
    private currencyService: CurrencyService,
    private downloadInvoiceService: DownloadInvoiceService
  ) { }

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.symbols = [];
    this.listCurrencies();
    this.getOrders();
  }

  getOrders() {
    this.orderService.getClientOrders().pipe(map(
      orderTable =>
        orderTable['listorders'].map(order => new OrderPreview(order['id'], order['submissionDate'], this.getStatusName(order['state']), order.total.toFixed(2) + ' ' + this.getCurrency(order.currency), order, order['_id']))
    ))
      .subscribe(result => {
        this.dataSource = new MatTableDataSource(result);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, error => console.log(error));
  }

  getStatusName(statusId) {
    if (!this.statusList) return statusId;
    return this.statusList.filter(status => status.id === statusId)[0] ? this.statusList.filter(status => status.id === statusId)[0].name : statusId;
  }

  listCurrencies() {
    this.currencyService.getCurrencies().subscribe(list => { list.currencies.forEach(item => { this.symbols[item.id] = item.symbol }) });
  }

  getCurrency(currency) {
    return this.symbols[currency];
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.toLowerCase();
  }

  downloadInvoice(orderId, invoiceId, pdfType) {
    this.downloadInvoiceService.getInvoice(orderId, invoiceId, pdfType);
  }
}

