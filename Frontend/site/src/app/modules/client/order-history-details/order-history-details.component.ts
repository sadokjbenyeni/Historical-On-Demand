import { Component, OnInit, Inject, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, ObservableInput } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';
import { ConfigService } from '../../../services/config.service';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';


import { MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';
import { CancelOrderDialogComponent } from '../cancel-order-dialog/cancel-order-dialog.component';
import { HttpHeaders } from '@angular/common/http';
import { DeliverablesService } from '../../../services/deliverables.service';
import { InvoiceService } from '../../../services/invoice.service';
import { ClientInformation } from '../models/client-information.model';
import { DownloadInvoiceService } from '../../../services/Intern/download-invoice.service';
import { OrderAmount } from '../../order/models/order-amount.model';
import { OrderInformation } from '../../order/models/order-information.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-order-history-details',
  templateUrl: './order-history-details.component.html',
  styleUrls: ['./order-history-details.component.css']
})
export class OrderHistoryDetailsComponent implements OnInit {
  symbol: string
  token: any;
  gateway: string;
  id: string;
  idCmd: string;
  today: Date;
  vat: number;
  totalTTC: any;
  totalExchangeFees: any;
  totalHT: any;
  discount: any;
  totalVat: number;
  states: Array<any>;
  datasets: object;
  cmd: Array<object>;
  details: Array<any>;
  period: any;
  dtOptions: DataTables.Settings = {};
  clientOrderDetailsTableColumns: string[] = ['item', 'dataSet', 'instrumentID', 'productID', 'symbol', 'description', 'assetClass', 'exchange', 'mic', 'purchaseType'
    , 'engagementPeriod', 'dateFrom', 'dateTo', 'pricingTier', 'price', 'exchangeFees', 'expirationDate', 'remainingDays', 'delivrables'];
  public dataSource = new MatTableDataSource<Product>();
  print: boolean;
  onetime: number;
  subscription: number;
  path: string;
  link: string;
  clientInfo: ClientInformation;
  orderAmount: OrderAmount;
  orderInfo: OrderInformation;
  @Input() isSupport: boolean;

  constructor(
    public dialog: MatDialog,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private configService: ConfigService,
    private deliverablesService: DeliverablesService
  ) {
    this.route.params.subscribe(_ => { this.id = _.id; });
  }


  ngOnInit() {
    this.period = [];
    this.getPeriod();
    // this.listCurrencies();

    this.token = JSON.parse(sessionStorage.getItem('user'))?.token;
    this.gateway = environment.gateway;
    this.today = new Date();

    this.details = [];
    this.getListStates();
    this.getClientOrderDetails();
    this.datasets = {
      L1: 'L1 - Full',
      L1TRADEONLY: 'L1 - Trades',
      L2: 'L2'
    };
  }

  getState(stateId) {
    if (!this.states) return stateId;
    return this.states.filter(state => state.id === stateId)[0] ? this.states.filter(state => state.id === stateId)[0].name : stateId;
  }


  dateDiff(date1, date2) {
    let diff = { sec: 0, min: 0, hour: 0, day: 0 };
    let tmp = date2 - date1;
    tmp = Math.floor(tmp / 1000);
    diff.sec = tmp % 60;
    tmp = Math.floor((tmp - diff.sec) / 60);
    diff.min = tmp % 60;
    tmp = Math.floor((tmp - diff.min) / 60);
    diff.hour = tmp % 24;
    tmp = Math.floor((tmp - diff.hour) / 24);
    diff.day = tmp;
    return diff;
  }

  limitDownLoad(datelk) {
    let expired = new Date(datelk);
    if (this.onetime === 1 || this.subscription === 1) {
      return expired.setDate(expired.getDate() + this.period[0].periodOneOff);
    }
  }

  getPeriod() {
    this.configService.getDownloadSetting().subscribe(period => {
      return this.period = period;
    })
  }

  setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }

  dynamicDownloadByHtmlTag(orderId: number, dataset: string, eid: string, symbol: string, asset: string, type: string, debut: string, fin: string, text: Array<any>, path: string) {
    let fileName = "";
    fileName += orderId;
    fileName += "_" + this.datasets[dataset];
    fileName += "_" + eid;
    if (symbol !== "") {
      fileName += "_" + symbol;
    }
    if (asset !== "") {
      fileName += "_" + asset;
    }
    fileName += "_" + type;
    fileName += "_" + this.yyyymmdd(debut.split('T')[0]);
    fileName += "_" + this.yyyymmdd(fin.split('T')[0]);


    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    let links = [];
    text.forEach(ll => {
      ll.link.split('|').forEach(lien => {
        links.push(environment.gateway + '/api/v1/user/download/' + this.token + '/' + path + '/' + lien);
      });
    });

    const downloadeLinksString = links.join('\n');
    var textFileAsBlob = new Blob([downloadeLinksString], { type: 'text/plain', endings: 'native' });

    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
      // Chrome allows the link to be clicked
      // without actually adding it to the DOM.
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else {
      // Firefox requires the link to be added to the DOM
      // before it can be clicked.
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = ((mouseEvent) => document.body.removeChild(downloadLink));
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
    }
    downloadLink.click();
  }

  yyyymmdd = function (date) {
    let dat = date.split('-');
    let mm = parseInt(dat[1]);
    let dd = parseInt(dat[2]);

    return [
      dat[0],
      (mm > 9 ? '-' : '-0') + mm,
      (dd > 9 ? '-' : '-0') + dd
    ].join('');
  };

  countLink(lks) {
    let countlk = 0;
    lks.forEach(el => {
      countlk += el.link.split("|").length;
    });

    return countlk;
  }

  confirm() {
    this.orderService.state({ idCmd: this.id, status: 'cancelled', referer: 'Client' }).subscribe(() => { });
  }

  getListStates() {
    this.orderService.getListStates({}).subscribe(res => {
      this.states = res['states'];
    });
  }

  getClientOrderDetails() {
    // httpOptions.headers = httpOptions.headers.set('Authorization', this.token);
    this.orderService.getOrderDetailsById(this.id).subscribe((order) => {
      this.clientInfo = <ClientInformation>{}
      this.orderInfo = <OrderInformation>{}
      this.orderAmount = <OrderAmount>{};
      this.setOrderDetails(order);
    })
  }

  public setOrderDetails(order: any) {
    this.orderInfo.id = order.id;
    this.orderInfo.submissionDate = order.submissionDate;
    this.orderInfo.payment = order.payment;
    this.orderInfo.invoice = order.idCommande;
    this.orderInfo.proForma = order.idProForma;
    this.orderInfo.state = this.getState(order.state);
    this.clientInfo.company = order.companyName;
    this.clientInfo.firstName = order.firstname;
    this.clientInfo.lastName = order.lastname;
    this.clientInfo.job = order.job;
    this.clientInfo.countryBilling = order.countryBilling;
    this.orderAmount.currency = order.currency;
    this.vat = order.vatValue;
    this.totalExchangeFees = order.totalExchangeFees
    this.discount = order.discount;
    this.totalHT = order.totalHT
    this.totalVat = this.totalHT * (this.vat / 100);
    this.totalTTC = order.total
    let index = 0;
    this.details = [];
    if (order.products.length > 0) {
      order.products.forEach(product => {
        index++;
        this.print = product.print;
        let links = [];
        if (!product.links) {
          product['links'] = [];
        }
        product.links.forEach(link => {
          this.onetime = product.onetime;
          this.subscription = product.subscription;
          links.push(link);
        });
        let newProduct = new Product(index, product.dataset, product.qhid, product.eid, product.symbol, product.description, product.assetClass, product.exchangeName, product.mics, product.subscription, product.period, product.begin_date, product.end_date, product.pricingTier, product.ht, product.links, product.links, product.backfill_fee, product.ongoing_fee, product);
        this.details.push(newProduct);
      });
    }
    this.dataSource.data = this.details;
    this.orderAmount.currency = order.currency;
    this.orderAmount.totalExchangeFees = this.totalExchangeFees;
    this.orderAmount.vatValue = this.vat/100;
    this.orderAmount.discount = this.discount;
    this.orderAmount.totalHT = this.totalHT;
    this.orderAmount.totalTTC = this.totalTTC;
    this.orderAmount.totalVat = this.totalVat;
    this.listCurrencies();

  }

  public setToken(token: any) {
    this.token = token;
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  listCurrencies() {

    this.currencyService.getCurrencies().subscribe(list => {
      this.symbol = list.currencies.find(item => item.id == this.orderAmount.currency).symbol;
    });
  }

  openDialog(): void {
    const dialogReference = this.dialog.open(CancelOrderDialogComponent, {
      width: '250px',
      data: { idCmd: this.idCmd, status: 'cancelled', referer: 'Client', orderId: this.orderInfo.id }
    });
    dialogReference.afterClosed().subscribe(result => {
    });
  }

  downloadLinks() {
    let fileName = this.orderInfo.id + "_Manifest";
    let downloadablelinks = [];
    this.deliverablesService.getLinks(this.orderInfo.id)
      .subscribe(productslinks => {
        productslinks.forEach(links => {
          links.forEach(link => {
            downloadablelinks.push(link);
          });
        });
        //if (!this.setting.element.dynamicDownload) {
        //this.setting.element.dynamicDownload = document.createElement('a');
        const downloadeLinksString = downloadablelinks.join('\n');
        var textFileAsBlob = new Blob([downloadeLinksString], { type: 'text/plain', endings: 'native' });

        var downloadLink = document.createElement("a");
        downloadLink.download = fileName;
        downloadLink.innerHTML = "Download File";
        if (window.webkitURL != null) {
          // Chrome allows the link to be clicked
          if (!this.setting.element.dynamicDownload) {
            this.setting.element.dynamicDownload = document.createElement('a');  // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            //}
            //const element = this.setting.element.dynamicDownload;
            //const fileType = 'text/plain';
            //element.setAttribute('href', `data:${fileType};charset=utf-8,` + downloadablelinks.join('\n'));
            //element.setAttribute('download', fileName + '.txt');
            //var event = new MouseEvent("click");
            //element.dispatchEvent(event);
            document.body.appendChild(downloadLink);
          }

          downloadLink.click();
        }
      })
  }



  handleError(error): ObservableInput<any> {
    console.log(error);
    return Promise.all(new Array<any>());
  }
}


