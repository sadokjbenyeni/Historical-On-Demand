import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';
import { ConfigService } from '../../../services/config.service';

// import * as crypto from 'crypto-js';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token',
  })
};

// class DataTablesResponse {
//   listorders: any[];
// }

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  // idOrder: any;
  token: any;
  // gateway: string;
  // commandId: string;
  // today: Date;
  // textcolor: string;
  currencyTx: any;
  currencyTxUsd: any;
  currency: any;
  symbols: any[];
  // vat: number;
  // totalTTC: any;
  totalExchangeFees: any;
  totalHT: any;
  discount: any;
  // totalVat: number;
  pageTitle: string;
  statusList: Array<any>;
  // datasets: object;
  // state: string;
  // payment: string;
  // submissionDate: any;
  command: Array<object>;
  // details: Array<any>;
  userId: string;
  // list: boolean;
  // viewdetail: boolean;
  // phrase: string;
  // period: any;
  // firstname: any;
  // invoice: string;
  // company: any;
  // lastname: any;
  // job: any;
  // country: any;
  // countryBilling: any;
  // datasetsLink: { L1: string; L1TRADEONLY: string; L2: string; };
  // dtOptions: DataTables.Settings = {};

  constructor(
    // private http: HttpClient,
    // private modalService: NgbModal,
    private orderService: OrderService,
    private currencyService: CurrencyService,
    // private configService: ConfigService,
    // private uploadService: UploadService
  ) {
    // this.phrase = 'test';
  }

  ngOnInit() {
    // this.gateway = environment.gateway;
    // this.today = new Date();
    // this.downloadPeriod();
    this.pageTitle = 'Order History';
    // this.details = [];
    // this.getListStates();
    // this.datasets = {
    //   L1: 'L1 - Full',
    //   L1TRADEONLY: 'L1 - Trades',
    //   L2: 'L2'
    // };
    // this.datasets = {
    //   L1: 'Top of Book',
    //   L1TRADEONLY: 'Times & Sales',
    //   L2: 'Market Depth'
    // };
    this.userId = JSON.parse(sessionStorage.getItem('user'))._id;
    this.token = JSON.parse(sessionStorage.getItem('user')).token;
    httpOptions.headers = httpOptions.headers.set('Authorization', this.token);
    this.listCurrencies();
    // this.list = true;
    // this.viewdetail = false;
    // this.http;
    // .get<DataTablesResponse>(environment.api + '/v1/order', httpOptions)
    // .subscribe(res => {

    //   this.command = res.listorders;
    // });
    // const that = this;
    this.getOrderMetadata();
  }

  getOrderMetadata() {
    this.orderService.getClientOrderMetadata(httpOptions).subscribe(result => {
      this.command = result['listorders'];
    });
  }

  getStatusName(statusId) {
    if (!this.statusList)
      return statusId;
    return this.statusList.filter(status => status.id === statusId)[0] ? this.statusList.filter(status => status.id === statusId)[0].name : statusId;
  }
  listCurrencies() {
    this.currencyService.getCurrencies().subscribe(list => {
      this.symbols = [];
      list.currencies.forEach(item => {
        this.symbols[item.id] = item.symbol;
      });
    });
  }

  getTTC(amount) {
    let ttc = 0;
    if (amount.currency !== 'usd') {
      ttc = (((amount.totalHT + amount.totalExchangeFees) / amount.currencyTxUsd) * amount.currencyTx);
    }
    else {
      ttc = amount.totalHT + amount.totalExchangeFees;
    }
    if (amount.discount > 0) {
      ttc = ttc - (ttc * (amount.discount / 100));
    }
    return this.precisionRound((ttc * (1 + amount.vatValue)), 2);
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  // getListStates() {
  //   this.orderService.getListStates({}).subscribe(res => {
  //     this.states = res['states'];
  //   });
  // }

  // downloadPeriod() {
  //   this.configService.getDownloadSetting().subscribe(period => {
  //     this.period = period;
  //   });
  // }


  // filterUser(link) {
  //   // console.log(this.today, this.limitDownLoad(link.createLinkDate));
  //   let dif = { sec: 0, min: 0, hour: 0, day: 0 };  // Initialisation du retour
  //   let date1 = new Date().getTime();
  //   let expired = new Date(link.createLinkDate);
  //   expired.setDate(expired.getDate() + 14);
  //   let tmp = expired.getTime() - date1;
  //   tmp = Math.floor(tmp / 1000);                    // Nombre de secondes entre les 2 dates
  //   dif.sec = tmp % 60;                            // Extraction du nombre de secondes
  //   tmp = Math.floor((tmp - dif.sec) / 60);            // Nombre de minutes (partie entière)
  //   dif.min = tmp % 60;                            // Extraction du nombre de minutes
  //   tmp = Math.floor((tmp - dif.min) / 60);            // Nombre d'heures (entières)
  //   dif.hour = tmp % 24;                           // Extraction du nombre d'heures
  //   tmp = Math.floor((tmp - dif.hour) / 24);           // Nombre de jours restants
  //   dif.day = tmp;

  //   return link.status === 'active' && dif.day > 0;
  // }

  // openModal(content) {
  //   this.modalService.open(content, { size: 'sm' });
  // }

  // confirm() {
  //   this.orderService.state({ idCmd: this.commandId, status: 'cancelled', referer: 'Client' }).subscribe(() => { });
  // }

  // close() {
  //   this.title = 'Order History';
  //   this.list = true;
  //   this.viewdetail = false;
  //   this.details = [];
  // }



  // encrypt(link) {
  //   return crypto.AES.encrypt(link, this.phrase);
  // }
  // decrypt(link) {
  //   return crypto.AES.decrypt(link, this.phrase).toString(crypto.enc.Utf8);
  // }

  // bulkdownload() {
  //   this.uploadService.upd().subscribe(resp => {
  //   });
  //   // this.http.get('/loadfile/cmd-5a576574f906962c10c79c20-20180209-5a7db4ddb1197b3f022e953a-1/cmd-5a576574f906962c10c79c20-20180209-5a7db4ddb1197b3f022e953a-1_2017-06-06_1053.zip').subscribe(resp => {});
  // };

  // getHt(val) {
  //   if (this.currency !== 'usd') {
  //     return ((val / this.currencyTxUsd) * this.currencyTx);
  //   } else {
  //     return val;
  //   }
  // }



  // getHtAll(val, txUsd, tx) {
  //   if (this.currency !== 'usd') {
  //     return ((val / txUsd) * tx);
  //   } else {
  //     return val;
  //   }
  // }

  // dateDiff(date1, date2) {
  //   let diff = { sec: 0, min: 0, hour: 0, day: 0 };  // Initialisation du retour
  //   let tmp = date2 - date1;
  //   tmp = Math.floor(tmp / 1000);                     // Nombre de secondes entre les 2 dates
  //   diff.sec = tmp % 60;                            // Extraction du nombre de secondes
  //   tmp = Math.floor((tmp - diff.sec) / 60);            // Nombre de minutes (partie entière)
  //   diff.min = tmp % 60;                            // Extraction du nombre de minutes
  //   tmp = Math.floor((tmp - diff.min) / 60);            // Nombre d'heures (entières)
  //   diff.hour = tmp % 24;                           // Extraction du nombre d'heures
  //   tmp = Math.floor((tmp - diff.hour) / 24);           // Nombre de jours restants
  //   diff.day = tmp;
  //   return diff;
  // }



  // limitDownLoad(onetime, subscription, datelk) {
  //   let expired = new Date(datelk);
  //   if (onetime === 1) {
  //     return expired.setDate(expired.getDate() + this.period[0].periodOneOff);
  //   }
  //   if (subscription === 1) {
  //     return expired.setDate(expired.getDate() + this.period[0].periodOneOff);
  //   }
  // }

  // countLink(lks) {
  //   let countlk = 0;
  //   lks.forEach(el => {
  //     countlk += el.link.split("|").length;
  //   });

  //   return countlk;
  // }



  // setting = {
  //   element: {
  //     dynamicDownload: null as HTMLElement
  //   }
  // }
  //detail.idC+'_'+datasetsLink[detail.quotation_level]+'_'+detail.eid+'_one-off-¤'+detail.begin_date_select+'¤'+detail.end_date_select
  //lk.links
  //lk.path
  //detail.assetClass
  // dynamicDownloadByHtmlTag(id: number, dataset: string, eid: string, symbol: string, asset: string, type: string, debut: string, fin: string, text: Array<any>, path: string) {
  //   let fileName = "";
  //   fileName += id;
  //   fileName += "_" + this.datasetsLink[dataset];
  //   fileName += "_" + eid;
  //   if (symbol !== "") {
  //     fileName += "_" + symbol;
  //   }
  //   if (asset !== "") {
  //     fileName += "_" + asset;
  //   }
  //   fileName += "_" + type;
  //   fileName += "_" + this.yyyymmdd(debut.split('T')[0]);
  //   fileName += "_" + this.yyyymmdd(fin.split('T')[0]);


  //   if (!this.setting.element.dynamicDownload) {
  //     this.setting.element.dynamicDownload = document.createElement('a');
  //   }
  //   let liens = [];
  //   text.forEach(ll => {
  //     ll.link.split('|').forEach(lien => {
  //       liens.push(environment.gateway + '/api/user/download/' + this.token + '/' + path + '/' + lien);
  //     });
  //   });
  //   const element = this.setting.element.dynamicDownload;
  //   // const fileType = 'text/json';
  //   // element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(JSON.stringify(liens))}`);
  //   const fileType = 'text/plain';
  //   element.setAttribute('href', `data:${fileType};charset=utf-8,${liens.join('\r\n')}`);
  //   // let fn = fileName.split('¤');
  //   // let datedeb = fn[1].split('T')[0].replace(/-/gi, '');
  //   // let datefin = fn[2].split('T')[0].replace(/-/gi, '');
  //   // element.setAttribute('download', fn[0]+this.viewDate(datedeb)+'_'+this.viewDate(datefin)+'.txt');
  //   element.setAttribute('download', fileName + '.txt');

  //   var event = new MouseEvent("click");
  //   element.dispatchEvent(event);
  // }
  // yyyymmdd = function (d) {
  //   let dat = d.split('-');
  //   let mm = parseInt(dat[1]);
  //   let dd = parseInt(dat[2]);

  //   return [
  //     dat[0],
  //     (mm > 9 ? '-' : '-0') + mm,
  //     (dd > 9 ? '-' : '-0') + dd
  //   ].join('');
  // };



}

