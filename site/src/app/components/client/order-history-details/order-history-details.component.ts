import { Component, OnInit, Inject, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';
import { ConfigService } from '../../../services/config.service';
import { ActivatedRoute } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';
import { Data } from '../../../Models/Order/Data';

import { MatDialog } from '@angular/material/dialog';
import { CancelOrderDialogComponent } from '../cancel-order-dialog/cancel-order-dialog.component';
import { HttpHeaders } from '@angular/common/http';
import { DeliverablesService } from '../../../../app/services/deliverables.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token',
  })
};

@Component({
  selector: 'app-order-history-details',
  templateUrl: './order-history-details.component.html',
  styleUrls: ['./order-history-details.component.css']
})
export class OrderHistoryDetailsComponent implements OnInit {

  idOrder: any;
  token: any;
  gateway: string;
  idCmd: string;
  today: Date;
  currencyTx: any;
  currencyTxUsd: any;
  currency: any;
  symbols: any[];
  vat: number;
  totalTTC: any;
  totalExchangeFees: any;
  totalHT: any;
  discount: any;
  totalVat: number;
  states: Array<any>;
  datasets: object;
  state: string;
  payment: string;
  submissionDate: any;
  cmd: Array<object>;
  details: Array<any>;
  period: any;
  firstname: any;
  invoice: string;
  company: any;
  lastname: any;
  job: any;
  country: any;
  countryBilling: any;
  datasetsLink: { L1: string; L1TRADEONLY: string; L2: string; };
  dtOptions: DataTables.Settings = {};
  clientOrderDetailsTableColumns: string[] = ['item', 'dataSet', 'instrumentID', 'productID', 'symbol', 'description', 'assetClass', 'exchange', 'mic', 'purchaseType'
    , 'engagementPeriod', 'dateFrom', 'dateTo', 'pricingTier', 'price', 'exchangeFees', 'expirationDate', 'remainingDays', 'delivrables'];
  public dataSource = new MatTableDataSource<Data>();
  print: boolean;
  onetime: number;
  subscription: number;
  path: string;
  link: string;

  @Input() isSupport: boolean;

  constructor(
    public dialog: MatDialog,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private configService: ConfigService,
    private deliverablesService: DeliverablesService
  ) {
    this.route.params.subscribe(_ => { this.idCmd = _.id; });
  }


  ngOnInit() {
    this.period = [];
    this.getPeriod();
    this.listCurrencies();

    this.token = JSON.parse(sessionStorage.getItem('user')).token;
    this.symbols = new Array();
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
    this.datasetsLink = {
      L1: 'L1-Full',
      L1TRADEONLY: 'L1-Trades',
      L2: 'L2'
    };
  }

  getState(stateId) {
    if (!this.states) return stateId;
    return this.states.filter(state => state.id === stateId)[0] ? this.states.filter(state => state.id === stateId)[0].name : stateId;
  }

  getHt(value) {
    if (this.currency !== 'usd') {
      value = ((value / this.currencyTxUsd) * this.currencyTx);
    }
    return value;
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
    return expired.setDate(expired.getDate() + this.period[0].periodOneOff);
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

  dynamicDownloadByHtmlTag(id: number, dataset: string, eid: string, symbol: string, asset: string, type: string, debut: string, fin: string, text: Array<any>, path: string) {
    let fileName = "";
    fileName += id;
    fileName += "_" + this.datasetsLink[dataset];
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
    let liens = [];
    text.forEach(ll => {
      ll.link.split('|').forEach(lien => {
        liens.push(environment.gateway + '/api/user/download/' + this.token + '/' + path + '/' + lien);
      });
    });
    const element = this.setting.element.dynamicDownload;
    const fileType = 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${liens.join('\r\n')}`);
    element.setAttribute('download', fileName + '.txt');

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  yyyymmdd = function (d) {
    let dat = d.split('-');
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
    this.orderService.state({ idCmd: this.idCmd, status: 'cancelled', referer: 'Client' }).subscribe(() => { });
  }

  getListStates() {
    this.orderService.getListStates({}).subscribe(res => {
      this.states = res['states'];
    });
  }

  getClientOrderDetails() {
    // httpOptions.headers = httpOptions.headers.set('Authorization', this.token);
    this.orderService.getOrderDetailsById(this.idCmd, httpOptions).subscribe((order) => {
      this.getOrderDetails(order);
    })
  }

  public getOrderDetails(order: any) {
    this.idOrder = order.details.id;
    this.submissionDate = order.details.submissionDate;
    this.payment = order.details.payment;
    this.invoice = order.details.idCommande;
    this.state = order.details.state;
    this.company = order.details.companyName;
    this.firstname = order.details.firstname;
    this.lastname = order.details.lastname;
    this.job = order.details.job;
    this.countryBilling = order.details.countryBilling;
    this.currency = order.details.currency;
    this.currencyTx = order.details.currencyTx;
    this.currencyTxUsd = order.details.currencyTxUsd;
    this.vat = order.details.vatValue;
    if (order.details.currency !== 'usd') {
      this.totalExchangeFees = (order.details.totalExchangeFees / order.details.currencyTxUsd) * order.details.currencyTx;
      this.discount = order.details.discount;
      this.totalHT = ((order.details.totalHT + order.details.totalExchangeFees) / order.details.currencyTxUsd) * order.details.currencyTx;
      if (this.discount > 0) {
        this.totalHT = this.totalHT - (this.totalHT * (this.discount / 100));
      }
      this.totalVat = this.totalHT * this.vat;
      this.totalTTC = this.precisionRound((this.totalHT * (1 + this.vat)), 2);
    }
    else {
      this.totalExchangeFees = order.details.totalExchangeFees;
      this.discount = order.details.discount;
      this.totalHT = order.details.totalHT + order.details.totalExchangeFees;
      if (this.discount > 0) {
        this.totalHT = this.totalHT - (this.totalHT * (this.discount / 100));
      }
      this.totalVat = this.totalHT * this.vat;
      this.totalTTC = this.precisionRound((this.totalHT * (1 + this.vat)), 2);
    }
    let index = 0;
    this.details = [];
    if (order.details.products.length > 0) {
      order.details.products.forEach(product => {
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
        let newProduct = new Data(index, product.dataset, product.qhid, product.eid, product.symbol, product.description, product.assetClass, product.exchangeName, product.mics, product.subscription, product.period, product.begin_date_select, product.end_date_select, product.pricingTier, product.ht, product.links, product.links, product.backfill_fee, product.ongoing_fee, product);
        this.details.push(newProduct);
        // if (product.backfill_fee > 0 || product.ongoing_fee > 0) {
        //   this.print = true;
        //   this.details.push({ backfill_fee: product.backfill_fee, ongoing_fee: product.ongoing_fee });
        // }
      });
    }
    this.dataSource.data = this.details;
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  listCurrencies() {
    this.currencyService.getCurrencies().subscribe(list => {
      this.symbols = [];
      list.currencies.forEach(item => {
        this.symbols[item.id] = item.symbol;
      });
    });
  }

  openDialog(): void {
    const dialogReference = this.dialog.open(CancelOrderDialogComponent, {
      width: '250px',
      data: { idCmd: this.idCmd, status: 'cancelled', referer: 'Client', orderId: this.idOrder }
    });
    dialogReference.afterClosed().subscribe(result => {
    });
  }

  downloadLinks() {
    let fileName = this.idOrder + "_Manifest";
    let downloadablelinks = [];
    this.deliverablesService.getLinks(this.idOrder).subscribe(productslinks => {
      productslinks.forEach(links => {
        links.forEach(link => {
          downloadablelinks.push(link);
        });
      });
      if (!this.setting.element.dynamicDownload) {
        this.setting.element.dynamicDownload = document.createElement('a');
      }
      const element = this.setting.element.dynamicDownload;
      const fileType = 'text/plain';
      element.setAttribute('href', `data:${fileType};charset=utf-8,${downloadablelinks.join('\r\n')}`);
      element.setAttribute('download', fileName + '.txt');
      var event = new MouseEvent("click");
      element.dispatchEvent(event);
    })
  }

}


