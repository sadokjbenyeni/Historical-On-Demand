import { Component, OnInit, Inject, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, ObservableInput } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';
import { ConfigService } from '../../../services/config.service';
import { ActivatedRoute, Router } from '@angular/router';
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
import { SwalAlertService } from '../../../../app/shared/swal-alert/swal-alert.service';
import { result } from 'lodash';
import { TestBed } from '@angular/core/testing';
import Swal from 'sweetalert2';
import { BurgerMenuService } from '../../../../app/shared/burger-menu/burger-menu.service';

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
  userId: string;
  isCartFull: boolean = false;

  @Input() isSupport: boolean;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private configService: ConfigService,
    private deliverablesService: DeliverablesService,
    private swalService: SwalAlertService,
    private burgerMenuService: BurgerMenuService
  ) {
    this.route.params.subscribe(_ => { this.id = _.id; });
  }


  ngOnInit() {
    this.period = [];
    this.getListStates();
    this.getClientOrderDetails();
    this.getPeriod();
    this.verifyOrderInCart();

    this.token = JSON.parse(sessionStorage.getItem('user'))?.token;
    this.gateway = environment.gateway;
    this.today = new Date();

    this.details = [];
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

  getListStates() {
    this.orderService.getListStates({}).subscribe(res => {
      this.states = res['states'];
    });
  }

  getClientOrderDetails() {
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
    this.userId = order.idUser;
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
    this.orderAmount.vatValue = this.vat / 100;
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

  verifState() {
    let state = this.orderInfo.state;
    let pvp = 'Pending Validation by Product';
    let pvf = 'Pending Validation by Finance';
    let pvc = 'Pending Validation by Compliance';
    if (state === pvc || state === pvp || state === pvf) return true;
    else return false;
  }

  verifyOrderInCart() {
    return new Promise((resolve, reject) => {
      this.orderService.getCaddy().subscribe(caddy => {
        if (caddy) this.isCartFull = true
        resolve(caddy)
      }, error => {
        reject(error);
      })
    })
  }


  async abortOrder() {
    if (this.isCartFull) {
      var isReadyToAbort = await this.swalService.getSwalCheckboxNotification(`You are about to edit your order !`, '', 'warning', 'Delete current cart items', 'Check the box to confirm');
    }
    else {
      var isReadyToAbort = await this.swalService.getSwalForConfirm(`You are about to edit your order !`, '');
    }
    if (isReadyToAbort.value) {
      this.orderService.abortOrder(this.orderInfo.id).subscribe(result => {
        if (result) {
          this.swalService.getSwalForNotification(`Order ${this.orderInfo.id} aborted`, ` <b> Order ${this.orderInfo.id} aborted`)
        }
        error => {
          this.swalService.getSwalForNotification('Abortion Failed !', error.message, 'error')
        }
      })
    }
    this.router.navigate(['/order/history']);
  }

  async cancelOrder() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', `You are going to cancel order number <b> ${this.orderInfo.id}</b>`)
    if (result.value) {
      this.orderService.state({ idCmd: this.id, status: 'cancelled', referer: 'Client' })
        .subscribe(result => {
          if (result) {
            this.swalService.getSwalForNotification(`Order ${this.orderInfo.id} cancelled`, ` <b> Order ${this.orderInfo.id} cancelled`),
              error => {
                this.swalService.getSwalForNotification('Cancellation Failed !', error.message, 'error')
              }
          }
        })
    }
    this.router.navigate(['/order/history']);
  }

  expandMenu() {
    let element = <HTMLElement>document.getElementById('toggle');
    this.burgerMenuService.toggleClass(element, 'on');
    let menuTitle = <HTMLElement>document.getElementById('menu-title');
    if (menuTitle.textContent == "CLOSE") menuTitle.textContent = "ACTIONS";
    else menuTitle.textContent = "CLOSE";
    return false;
  }
}



