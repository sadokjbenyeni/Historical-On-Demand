import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { OrderService } from '../../services/order.service';
import { UploadService } from '../../services/upload.service';
import { CurrencyService } from '../../services/currency.service';
import { ConfigService } from '../../services/config.service';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import * as crypto from 'crypto-js';

                                                        

class DataTablesResponse {
  listorders: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {

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
  datasetsLink: { L1: string; L1TRADEONLY: string; L2: string; };
  dtOptions: DataTables.Settings = {};

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    private orderService: OrderService,
    private currencyService: CurrencyService,
    private configService: ConfigService,
    private uploadService: UploadService
  ) {
    this.phrase = 'test';
  }

  ngOnInit() {
    this.gateway = environment.gateway;
    this.today = new Date();
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
    this.getCurrencies();
    this.list = true;
    this.viewdetail = false;
    
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: false,
      order: [[ 0, 'desc' ]],
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.idUser = this.idUser;
        this.http
        .post<DataTablesResponse>(environment.api + '/order/history', dataTablesParameters, {})
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
  }

  filterUser(link) {
    // console.log(this.today, this.limitDownLoad(link.createLinkDate));
    let dif = { sec: 0, min: 0, hour:0, day: 0 };  // Initialisation du retour
    let date1 = new Date().getTime();
    let expired = new Date(link.createLinkDate);
    expired.setDate(expired.getDate() + 14);
    let tmp = expired.getTime() - date1;
    tmp = Math.floor(tmp/1000);                    // Nombre de secondes entre les 2 dates
    dif.sec = tmp % 60;                            // Extraction du nombre de secondes
    tmp = Math.floor((tmp-dif.sec)/60);            // Nombre de minutes (partie entière)
    dif.min = tmp % 60;                            // Extraction du nombre de minutes
    tmp = Math.floor((tmp-dif.min)/60);            // Nombre d'heures (entières)
    dif.hour = tmp % 24;                           // Extraction du nombre d'heures
    tmp = Math.floor((tmp-dif.hour)/24);           // Nombre de jours restants
    dif.day = tmp;

    return link.status === 'active' && dif.day > 0;
  }

  view(c){
    this.details = [];
    this.list = false;
    this.viewdetail = true;
    this.title = 'Order Details : ' + c.id;
    this.idCmd = c.id_cmd;
    this.invoice = c.idCommande;
    this.state = c.state;
    this.firstname = c.firstname;
    this.lastname = c.lastname;
    this.payment = c.payment;
    this.company = c.companyName;
    this.job = c.job;
    this.country = c.country;
    if(this.state === 'active') {
      this.textcolor = 'text-success';
    } else if(this.state === 'rejected') {
      this.textcolor = 'text-danger';
    } else if(this.state === 'cancelled') {
      this.textcolor = 'text-warning';
    } else if(this.state === 'inactive') {
      this.textcolor = 'text-muted';
    } else {
      this.textcolor = 'text-color';
    }
    this.submissionDate = c.submissionDate;
    let index = 0;
    if(c.products.length > 0){
      c.products.forEach(p => {
        index++;
        let l = [];
        if(!p.links){ p['links'] = []; }
        p.links.forEach(pl => {
          pl.onetime = p.onetime;
          pl.subscription = p.subscription;  
          l.push(pl);
        });
        let prod = {
          id: index,
          print: false, 
          idC: c.id,
          idCmd: c.id_cmd,
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
          end_date_select : p.end_date,
          end_date : p.end_date_ref
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
    this.currency = c.currency;
    this.currencyTx = c.currencyTx;
    this.currencyTxUsd = c.currencyTxUsd;
    this.vat = c.vatValue;
    if (c.currency !== 'usd') {
      this.totalExchangeFees = (c.totalExchangeFees / c.currencyTxUsd) * c.currencyTx;
      this.discount = c.discount;
      this.totalHT = ( (c.totalHT + c.totalExchangeFees) / c.currencyTxUsd) * c.currencyTx;
      if(this.discount>0){
        this.totalHT = this.totalHT - ( this.totalHT * (this.discount / 100) );
      }
      this.totalVat = this.totalHT * this.vat;
      this.totalTTC = this.precisionRound((this.totalHT * (1 + this.vat)), 2);
    } else{
      this.totalExchangeFees = c.totalExchangeFees;
      this.discount = c.discount;
      this.totalHT = c.totalHT + c.totalExchangeFees;
      if(this.discount>0){
        this.totalHT = this.totalHT - ( this.totalHT * (this.discount / 100) );
      }
      this.totalVat = this.totalHT * this.vat;
      this.totalTTC = this.precisionRound((this.totalHT * (1 + this.vat)), 2);
    }
  }

  openModal(content) {
    this.modalService.open(content, { size: 'sm' });
  }

  confirm() {
    this.orderService.state({idCmd: this.idCmd, status: 'cancelled', referer: 'Client'}).subscribe(()=>{});
  }

  close(){
    this.title = 'Order History';
    this.list = true;
    this.viewdetail = false;
    this.details = [];
  }

  getCurrencies() {
    this.currencyService.getCurrencies().subscribe(r=>{
      this.symbols = [];
      r.currencies.forEach(s => {
        this.symbols[s.id] = s.symbol;
      });
    });
 }
  
  encrypt(link) {
    return crypto.AES.encrypt(link, this.phrase);
  }
  decrypt(link) {
    return crypto.AES.decrypt(link, this.phrase).toString(crypto.enc.Utf8);
  }
  
  bulkdownload(){
    this.uploadService.upd().subscribe(resp => {
    });
    // this.http.get('/loadfile/cmd-5a576574f906962c10c79c20-20180209-5a7db4ddb1197b3f022e953a-1/cmd-5a576574f906962c10c79c20-20180209-5a7db4ddb1197b3f022e953a-1_2017-06-06_1053.zip').subscribe(resp => {});
  };

  getHt(val){
    if (this.currency !== 'usd') {
      return ((val / this.currencyTxUsd) * this.currencyTx);
    } else{
      return val;
    }
  }

  getTTC(val){
    let ttc = 0;
    if (val.currency !== 'usd') {
      ttc = ((val.totalHT / val.currencyTxUsd) * val.currencyTx);
      if(val.discount>0){
        ttc = ttc - ( ttc * (val.discount / 100) );
      }
    } else{
      ttc = val.totalHT;
      if(val.discount>0){
        ttc = ttc - ( ttc * (val.discount / 100) );
      }
    }
    return this.precisionRound((ttc * (1 + val.vatValue)), 2);
  }

  getHtAll(val, txUsd, tx){
    if (this.currency !== 'usd') {
      return ((val / txUsd) * tx);
    } else{
      return val;
    }
  }

  dateDiff(date1, date2){
    let diff = { sec: 0, min: 0, hour:0, day: 0 };  // Initialisation du retour
    let tmp = date2 - date1;
    tmp = Math.floor(tmp/1000);                     // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60;                            // Extraction du nombre de secondes
    tmp = Math.floor((tmp-diff.sec)/60);            // Nombre de minutes (partie entière)
    diff.min = tmp % 60;                            // Extraction du nombre de minutes
    tmp = Math.floor((tmp-diff.min)/60);            // Nombre d'heures (entières)
    diff.hour = tmp % 24;                           // Extraction du nombre d'heures
    tmp = Math.floor((tmp-diff.hour)/24);           // Nombre de jours restants
    diff.day = tmp;
    return diff;
  }

  periodDnl(){
    this.configService.getDownloadSetting().subscribe(period=>{
      this.period = period;
    });
  }

  limitDownLoad(onetime, subscription, datelk) {
    let expired = new Date(datelk);
    if(onetime === 1){
      return expired.setDate(expired.getDate() + this.period[0].periodOneOff);
    }
    if(subscription === 1){
      return expired.setDate(expired.getDate() + this.period[0].periodOneOff);
    }
  }

  countLink(lks) {
    let countlk = 0;
    lks.forEach(el => {
      countlk += el.link.split("|").length;
    });

    return countlk;
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
  
  setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }
//detail.idC+'_'+datasetsLink[detail.quotation_level]+'_'+detail.eid+'_one-off-¤'+detail.begin_date_select+'¤'+detail.end_date_select
//lk.links
//lk.path
//detail.assetClass
  dyanmicDownloadByHtmlTag(id: number, dataset: string, eid: string, symbol: string, asset: string, type: string, debut: string, fin: string, text: Array<any>, path: string) {
    let fileName = "";
    fileName += id;
    fileName += "_"+ this.datasetsLink[dataset];
    fileName += "_"+ eid;
    if(symbol !== ""){
      fileName += "_"+ symbol;
    }
    if(asset !== ""){
      fileName += "_"+ asset;
    }
    fileName += "_"+ type;
    fileName += "_"+ this.yyyymmdd(debut.split('T')[0]);
    fileName += "_"+ this.yyyymmdd(fin.split('T')[0]);


    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    let liens = [];
    text.forEach(ll => {
      ll.link.split('|').forEach(lien => {
        liens.push(environment.gateway + '/api/user/test/'+this.token+'/'+ path +'/'+ lien);
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
    element.setAttribute('download', fileName +'.txt');

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
  yyyymmdd = function(d) {
    let dat = d.split('-');
    let mm = parseInt(dat[1]);
    let dd = parseInt(dat[2]);
  
    return [
      dat[0],
      (mm>9 ? '-' : '-0') + mm,
      (dd>9 ? '-' : '-0') + dd
    ].join('');
  };

  getListStates(){
    this.orderService.getListStates({}).subscribe(res=>{
      this.states = res.states;
    });
  }
  getStateName(stateId) {
    if( !this.states )
      return stateId;
    return this.states.filter( e => e.id === stateId )[0] ? this.states.filter( e => e.id === stateId )[0].name : stateId;
  }

}

