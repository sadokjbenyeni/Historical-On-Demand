import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { OrderService } from '../../../services/order.service';
import { UploadService } from '../../../services/upload.service';
import { CurrencyService } from '../../../services/currency.service';
import { ConfigService } from '../../../services/config.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../order/product';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token',
  })
};

class DataTablesResponse {
  listorders: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

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
  textcolor: string;
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
  title: string;
  states: Array<any>;
  datasets: object;
  state: string;
  payment: string;
  submissionDate: any;
  cmd: Array<object>;
  details: Array<any>;
  idUser: string;
  list: boolean;
  viewdetail: boolean;
  phrase: string;
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

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private configService: ConfigService,
    private uploadService: UploadService) {
    this.phrase = 'test';
    route.params.subscribe(_ => { this.idCmd = _.id; });
  }


  ngOnInit() {
    this.symbols = new Array();
    this.gateway = environment.gateway;
    this.today = new Date();
    this.listCurrencies();

    this.periodDnl();
    this.title = 'Order History';
    this.details = [];
    this.getListStates();
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
    // this.datasets = {
    //   L1: 'Top of Book',
    //   L1TRADEONLY: 'Times & Sales',
    //   L2: 'Market Depth'
    // };
    this.idUser = JSON.parse(sessionStorage.getItem('user'))._id;
    this.token = JSON.parse(sessionStorage.getItem('user')).token;
    this.list = true;
    this.viewdetail = false;
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: false,
      order: [[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.token = this.token;
        httpOptions.headers = httpOptions.headers.set('Authorization', this.token);
        this.http
          .post<DataTablesResponse>(environment.api + '/v1/order/details', httpOptions)
          .subscribe(res => {
            this.cmd = res.listorders;
            callback({
              recordsTotal: res.recordsTotal,
              recordsFiltered: res.recordsFiltered,
              data: [],
            });
          });
      },
      columns: [
        { data: 'id' },
        { data: 'submissionDate' },
        { data: 'state' },
        { data: 'total' },
        { data: 'invoice' },
        { data: 'details', orderable: false },
      ]
    };
    this.getClientOrderMetadata();
    this.getClientOrderData();
    this.getClientOrderFees();
    // this.view();
  }

  getStateName(stateId) {
    if (!this.states)
      return stateId;
    return this.states.filter(e => e.id === stateId)[0] ? this.states.filter(e => e.id === stateId)[0].name : stateId;
  }

  getHt(val) {
    if (this.currency !== 'usd') {
      return ((val / this.currencyTxUsd) * this.currencyTx);
    } else {
      return val;
    }
  }

  dateDiff(date1, date2) {
    let diff = { sec: 0, min: 0, hour: 0, day: 0 };  // Initialisation du retour
    let tmp = date2 - date1;
    tmp = Math.floor(tmp / 1000);                     // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60;                            // Extraction du nombre de secondes
    tmp = Math.floor((tmp - diff.sec) / 60);            // Nombre de minutes (partie entière)
    diff.min = tmp % 60;                            // Extraction du nombre de minutes
    tmp = Math.floor((tmp - diff.min) / 60);            // Nombre d'heures (entières)
    diff.hour = tmp % 24;                           // Extraction du nombre d'heures
    tmp = Math.floor((tmp - diff.hour) / 24);           // Nombre de jours restants
    diff.day = tmp;
    return diff;
  }

  limitDownLoad(onetime, subscription, datelk) {
    let expired = new Date(datelk);
    if (onetime === 1) {
      return expired.setDate(expired.getDate() + this.period[0].periodOneOff);
    }
    if (subscription === 1) {
      return expired.setDate(expired.getDate() + this.period[0].periodOneOff);
    }
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
    // const fileType = 'text/json';
    // element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(JSON.stringify(liens))}`);
    const fileType = 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${liens.join('\r\n')}`);
    // let fn = fileName.split('¤');
    // let datedeb = fn[1].split('T')[0].replace(/-/gi, '');
    // let datefin = fn[2].split('T')[0].replace(/-/gi, '');
    // element.setAttribute('download', fn[0]+this.viewDate(datedeb)+'_'+this.viewDate(datefin)+'.txt');
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

  close() {
    this.title = 'Order History';
    this.list = true;
    this.viewdetail = false;
    this.details = [];
  }

  periodDnl() {
    this.configService.getDownloadSetting().subscribe(period => {
      this.period = period;
    });
  }

  getListStates() {
    this.orderService.getListStates({}).subscribe(res => {
      this.states = res['states'];
    });
  }


  view() {
    this.orderService.getIdOrder(this.idCmd).subscribe((c) => {
      this.list = c.cmd;
      this.details = [];
      this.list = false;
      this.viewdetail = true;
      this.title = 'Order Details'
      this.idCmd = c.cmd.id_cmd;
      this.idOrder = c.cmd.id;
      this.invoice = c.cmd.idCommande;
      this.state = c.cmd.state;
      this.firstname = c.cmd.firstname;
      this.lastname = c.cmd.lastname;
      this.payment = c.cmd.payment;
      this.company = c.cmd.companyName;
      this.job = c.cmd.job;
      this.country = c.cmd.country;
      this.countryBilling = c.cmd.countryBilling;
      if (this.state === 'active') {
        this.textcolor = 'text-success';
      } else if (this.state === 'rejected') {
        this.textcolor = 'text-danger';
      } else if (this.state === 'cancelled') {
        this.textcolor = 'text-warning';
      } else if (this.state === 'inactive') {
        this.textcolor = 'text-muted';
      } else {
        this.textcolor = 'text-color';
      }
      this.submissionDate = c.cmd.submissionDate;
      let index = 0;
      if (c.cmd.products.length > 0) {
        c.cmd.products.forEach(p => {
          index++;
          let l = [];
          if (!p.links) { p['links'] = []; }
          p.links.forEach(pl => {
            pl.onetime = p.onetime;
            pl.subscription = p.subscription;
            l.push(pl);
          });
          let prod = {
            id: index,
            print: false,
            idC: c.cmd.id,
            idCmd: c.cmd.id_cmd,
            idElem: p.id_undercmd,
            quotation_level: p.dataset,
            symbol: p.symbol,
            exchange: p.exchangeName,
            assetClass: p.assetClass,
            eid: p.eid,
            qhid: p.qhid,
            links: l,
            description: p.description,
            onetime: p.onetime,
            subscription: p.subscription,
            pricingTier: p.pricingTier,
            period: p.period,
            price: p.price,
            ht: p.ht,
            begin_date_select: p.begin_date,
            begin_date: p.begin_date_ref,
            end_date_select: p.end_date,
            end_date: p.end_date_ref
          };
          // this.ht += p.price;
          this.details.push(prod);
          if (p.backfill_fee > 0 || p.ongoing_fee > 0) {
            this.details.push({ print: true, backfill_fee: p.backfill_fee, ongoing_fee: p.ongoing_fee });
          }
          // console.log(this.details);
        });
      }
      // this.details = c.products;
      this.currency = c.cmd.currency;
      this.currencyTx = c.cmd.currencyTx;
      this.currencyTxUsd = c.cmd.currencyTxUsd;
      this.vat = c.cmd.vatValue;
      if (c.cmd.currency !== 'usd') {
        this.totalExchangeFees = (c.cmd.totalExchangeFees / c.cmd.currencyTxUsd) * c.cmd.currencyTx;
        this.discount = c.cmd.discount;
        this.totalHT = ((c.cmd.totalHT + c.cmd.totalExchangeFees) / c.cmd.currencyTxUsd) * c.cmd.currencyTx;
        if (this.discount > 0) {
          this.totalHT = this.totalHT - (this.totalHT * (this.discount / 100));
        }
        this.totalVat = this.totalHT * this.vat;
        this.totalTTC = this.precisionRound((this.totalHT * (1 + this.vat)), 2);
      } else {
        this.totalExchangeFees = c.cmd.totalExchangeFees;
        this.discount = c.cmd.discount;
        this.totalHT = c.cmd.totalHT + c.cmd.totalExchangeFees;
        if (this.discount > 0) {
          this.totalHT = this.totalHT - (this.totalHT * (this.discount / 100));
        }
        this.totalVat = this.totalHT * this.vat;
        this.totalTTC = this.precisionRound((this.totalHT * (1 + this.vat)), 2);
      }
    });
  };

  getClientOrderMetadata() {
    this.orderService.getClientOrderMetadataById(this.idCmd).subscribe((order) => {
      this.idOrder = order.metadata.id;
      this.submissionDate = order.metadata.submissionDate;
      this.payment = order.metadata.payment;
      this.invoice = null;
      this.state = order.metadata.state;
      this.company = order.metadata.companyName;
      this.firstname = order.metadata.firstname;
      this.lastname = order.metadata.lastname;
      this.job = order.metadata.job;
      this.countryBilling = order.metadata.countryBilling;
    })
  }

  getClientOrderData() {
    this.orderService.getClientOrderDataById(this.idCmd).subscribe((order) => {
      let index = 0;
      if (order.data.products.length > 0) {
        order.data.products.forEach(product => {
          index++;
          let linkList = [];
          if (!product.links) { product['links'] = []; }
          product.links.forEach(productLink => {
            productLink.onetime = product.onetime;
            productLink.subscription = product.subscription;
            linkList.push(productLink);
          });
          let newProduct = {
            id: index,
            print: false,
            idC: order.data.id,
            idCmd: order.data.id_cmd,
            idElem: product.id_undercmd,
            quotation_level: product.dataset,
            symbol: product.symbol,
            exchange: product.exchangeName,
            assetClass: product.assetClass,
            eid: product.eid,
            qhid: product.qhid,
            links: linkList,
            description: product.description,
            onetime: product.onetime,
            subscription: product.subscription,
            pricingTier: product.pricingTier,
            period: product.period,
            price: product.price,
            ht: product.ht,
            begin_date_select: product.begin_date,
            begin_date: product.begin_date_ref,
            end_date_select: product.end_date,
            end_date: product.end_date_ref
          };
          this.details.push(newProduct);
          if (product.backfill_fee > 0 || product.ongoing_fee > 0) {
            this.details.push({ print: true, backfill_fee: product.backfill_fee, ongoing_fee: product.ongoing_fee });
          }
        });
      }
    })
  }

  getClientOrderFees() {
    this.orderService.getClientOrderFeesById(this.idCmd).subscribe((order) => {
      this.currency = order.fees.currency;
      this.currencyTx = order.fees.currencyTx;
      this.currencyTxUsd = order.fees.currencyTxUsd;
      this.vat = order.fees.vatValue;
      if (order.fees.currency !== 'usd') {
        this.totalExchangeFees = (order.fees.totalExchangeFees / order.fees.currencyTxUsd) * order.fees.currencyTx;
        this.discount = order.fees.discount;
        this.totalHT = ((order.fees.totalHT + order.fees.totalExchangeFees) / order.fees.currencyTxUsd) * order.fees.currencyTx;
        if (this.discount > 0) {
          this.totalHT = this.totalHT - (this.totalHT * (this.discount / 100));
        }
        this.totalVat = this.totalHT * this.vat;
        this.totalTTC = this.precisionRound((this.totalHT * (1 + this.vat)), 2);
      } else {
        this.totalExchangeFees = order.fees.totalExchangeFees;
        this.discount = order.fees.discount;
        this.totalHT = order.fees.totalHT + order.fees.totalExchangeFees;
        if (this.discount > 0) {
          this.totalHT = this.totalHT - (this.totalHT * (this.discount / 100));
        }
        this.totalVat = this.totalHT * this.vat;
        this.totalTTC = this.precisionRound((this.totalHT * (1 + this.vat)), 2);
      }
    })
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


}
