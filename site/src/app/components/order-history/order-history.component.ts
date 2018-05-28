import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { OrderService } from '../../services/order.service';
import { UploadService } from '../../services/upload.service';
import { CurrencyService } from '../../services/currency.service';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import * as crypto from 'crypto-js';


@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {

  token: any;
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
  totalVat: number;
  title: string;
  states: object;
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

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    private orderService: OrderService,
    private currencyService: CurrencyService,
    private uploadService: UploadService
  ) {
    this.phrase = 'test';
  }

  ngOnInit() {
    this.today = new Date();
    this.title = 'Order History';
    this.details = [];
    this.states = {
      CART: 'Pending Licensing Information',
      PLI: 'Pending Licensing Information',
      PBI: 'Pending Billing Information',
      PSC: 'Pending Subscription by Client',
      PVP: 'Pending Validation by Product',
      PVC: 'Pending Validation by Compliance',
      PVF: 'Pending Validation by Finance',
      validated: 'Validated',
      active: 'Active',
      inactive: 'Inactive',
      cancelled: 'Cancelled',
      rejected: 'Rejected' 
    };
    this.datasets = {
      L1: 'L1 - Full',
      L1TRADEONLY: 'L1 - Trades',
      L2: 'L2' 
    };
    // this.datasets = {
    //   L1: 'Top of Book',
    //   L1TRADEONLY: 'Times & Sales',
    //   L2: 'Market Depth' 
    // };
    this.idUser = JSON.parse(sessionStorage.getItem('user'))._id;
    this.token = JSON.parse(sessionStorage.getItem('user')).token;
    this.getCmd();
    this.list = true;
    this.viewdetail = false;
  }

  view(c){
    this.list = false;
    this.viewdetail = true;
    this.title = 'Order : ' + c.id;
    this.idCmd = c.id_cmd;
    this.state = c.state;
    this.payment = c.payment;
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
    this.submissionDate = c.updatedAt;
    let index = 0;
    if(c.products.length > 0){
      c.products.forEach(p => {
        index++;
        let prod = {
          id: index,
          print: false, 
          idCmd: c.id_cmd,
          idElem: p.id_undercmd,
          quotation_level: p.dataset,
          symbol: p.symbol,
          exchange: p.exchangeName,
          assetClass: p.assetClass,
          eid: p.eid,
          qhid: p.qhid,
          links: p.links,
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
      });
    }
    // this.details = c.products;
    this.currency = c.currency;
    this.currencyTx = c.currencyTx;
    this.currencyTxUsd = c.currencyTxUsd;
    this.vat = c.vatValue;
    if (c.currency !== 'usd') {
      this.totalExchangeFees = (c.totalExchangeFees / c.currencyTxUsd) * c.currencyTx;
      this.totalHT = ( (c.totalHT + c.totalExchangeFees) / c.currencyTxUsd) * c.currencyTx;
      this.totalVat = this.totalHT * this.vat;
      this.totalTTC = this.precisionRound(((c.total / c.currencyTxUsd) * c.currencyTx), 2);
    } else{
      this.totalExchangeFees = c.totalExchangeFees;
      this.totalHT = c.totalHT + c.totalExchangeFees;
      this.totalVat = this.totalHT * this.vat;
      this.totalTTC = this.precisionRound(c.total, 2);
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

  getCmd() {
    this.currencyService.getCurrencies().subscribe(r=>{
      this.symbols = [];
      r.currencies.forEach(s => {
        this.symbols[s.id] = s.symbol;
      });
      this.orderService.getOrder(this.idUser).subscribe(resp => {
        this.cmd = [];
        if(resp.cmd.length > 0){
          this.cmd = resp.cmd;
        }
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

  limitDownLoad(datelk) {
    let expired = new Date(datelk);
    return expired.setDate(expired.getDate() + 7);
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
  
}
