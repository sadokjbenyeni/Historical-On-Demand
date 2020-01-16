import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Response } from '@angular/http';

import { OrderService } from '../../../services/order.service';
import { ConfigService } from '../../../services/config.service';
import { CurrencyService } from '../../../services/currency.service';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-orders-view',
  templateUrl: './orders-view.component.html',
  styleUrls: ['./orders-view.component.css']
})
export class OrdersViewComponent implements OnInit {
  id: any;
  existSubscribe: boolean;
  totalHTOld: number;
  currencyTxUsd: any;
  currencyTx: any;
  companyName: any;
  payment: string;
  firstname: any;
  lastname: any;
  job: any;
  country: any;
  currency: any;
  symbols: any[];
  totalVat: number;
  totalTTC: number;
  totalHT: number;
  totalFees: number;
  symbol: string;
  message: string;
  action: string;
  list: object;
  cmd: object;
  idCmd: string;
  submissionDate: string;
  state: string;
  states: Array<any>;
  discount: number;
  ht: number;
  vat: number;
  total: number;
  fees: number;
  cart: Array<any>;

  constructor(
    private http: Http,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private configService: ConfigService,
    private currencyService: CurrencyService,
    private orderService: OrderService
  ) {
    route.params.subscribe(_ => this.idCmd = _.id);
  }

  ngOnInit() {
    this.cart = [];
    this.symbols = [];
    this.message = '';
    this.action = '';
    this.symbol = '';
    this.ht = 0;
    this.vat = 1;
    this.fees = 0;
    this.discount = 0;
    this.total = 0;
    this.totalHT = 0;
    this.totalHTOld = 0;
    this.state = '';
    this.getListStates();
    this.getCmd();
  }

  getCmd(){
    this.currencyService.getCurrencies().subscribe(r=>{
      this.symbols = [];
      r.currencies.forEach(s => {
        this.symbols[s.id] = s.symbol;
      });
      this.orderService.getIdOrder(this.idCmd).subscribe((c) => {
        this.list = c;
        this.idCmd = c.cmd.id_cmd;
        this.id = c.cmd.id;
        this.cmd = c.cmd;
        this.companyName = c.cmd.companyName;
        this.payment = c.cmd.payment;
        this.firstname = c.cmd.firstname;
        this.lastname = c.cmd.lastname;
        this.job = c.cmd.job;
        this.country = c.cmd.countryBilling;
        this.discount = c.cmd.discount;
        this.currency = c.cmd.currency;
        this.currencyTx = c.cmd.currencyTx;
        this.currencyTxUsd = c.cmd.currencyTxUsd;
        this.totalFees = this.getHt(c.cmd.totalExchangeFees);
        this.totalHT = (this.getHt(c.cmd.totalHT) - (this.getHt(c.cmd.totalHT) * this.discount / 100) ) + this.totalFees;
        this.totalHTOld = this.getHt(c.cmd.totalHT) + this.totalFees;
        this.vat = c.cmd.vatValue;
        this.totalVat = this.totalHT * this.vat;
        this.totalTTC = this.totalHT + this.totalVat;
        this.submissionDate = c.cmd.submissionDate;
        this.state = c.cmd.state;
        let index = 0;
        if(c.cmd.products.length > 0){
          this.existSubscribe = false;
          this.list['cmd'].products.forEach((p) => {
            if(p.subscription === 1) { this.existSubscribe = true; }
            let diff = this.dateDiff(new Date(p.begin_date), new Date(p.end_date));
            if (p.onetime === 1) {
              p.price = (diff.day + 1) * p.price;
            } else if(p.subscription === 1){
              p.price = p.period * p.price;
            }
            index++;
            let prod = {
              idx: index,
              print: false,
              idCmd: c.cmd.id_cmd,
              id_undercmd: p.id_undercmd,
              status: 'validated',
              quotation_level: p.dataset,
              symbol: p.symbol,
              exchange: p.exchangeName,
              assetClass: p.assetClass,
              mics: p.mics,
              eid: p.eid,
              qhid: p.qhid,
              contractid: p.contractid,
              description: p.description,
              onetime: p.onetime,
              subscription: p.subscription,
              pricingTier: p.pricingTier,
              period: p.period,
              price: p.price,
              ht: p.ht,
              begin_date_select: p.begin_date,
              begin_date_ref: p.begin_date_ref,
              end_date_select : p.end_date,
              end_date_ref : p.end_date_ref,
              backfill_fee: p.backfill_fee,
              ongoing_fee: p.ongoing_fee
            };
            this.ht += p.price;
            this.cart.push(prod);
            if (p.backfill_fee > 0 || p.ongoing_fee > 0) {
              this.cart.push({ print: true, backfill_fee: p.backfill_fee, ongoing_fee: p.ongoing_fee });
            }
          });
        }
      });
    });
  }

  confirm(){
    if(this.action === 'Confirm Client Order Validation') {
      this.orderService.state({idCmd: this.idCmd, id: this.id, status: 'validated', referer: 'Finance', product: this.cart, email: this.cmd['email']}).subscribe(()=>{
        this.router.navigate(['/finance/orders']);
      });
    }
  }

  verifState() {
    if(this.state === 'PVF') {
      return true;
    } else {
      return false;
    }
  }

  actions(action) {
    this.action = action;
  }

  openModal(content) {
    this.modalService.open(content, { size: 'sm'});
  }

  openWindowCustomClass(content) {
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

  getHt(val){
    if (this.currency !== 'usd') {
      return ((val / this.currencyTxUsd) * this.currencyTx);
    } else{
      return val;
    }
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

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
