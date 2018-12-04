declare var chckt: any;

import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { NgbTabChangeEvent, NgbDatepickerConfig, NgbDateStruct, NgbCalendar, NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from '../../../modal-content';

import { OrderService } from '../../../services/order.service';
import { VatService } from '../../../services/vat.service';
import { FluxService } from '../../../services/flux.service';
import { PaymentService } from '../../../services/payment.service';
import { CountriesService } from '../../../services/countries.service';
import { CurrencyService } from '../../../services/currency.service';
import { UserService } from '../../../services/user.service';
import { ConfigService } from '../../../services/config.service';
import { PdfService } from '../../../services/pdf.service';
import { UploadService } from '../../../services/upload.service';


@Component({
  selector: 'app-caddies',
  templateUrl: './caddies.component.html',
  styleUrls: ['./caddies.component.css']
})
export class CaddiesComponent implements OnInit {
  numVat: any;
  id: any;
  currencyObj: any;
  minRib: boolean;
  taux: any;
  totalFeesUsd: any;
  totalTTCUsd: number;
  totalVatUsd: number;
  totalAmountUsd: any;
  totalHTUsd: any;
  currencyTxUsd: number;
  dataset: { L1TRADEONLY: string; L1: string; L2: string; };
  totalAmount: any;
  discount: any;
  totalTTC: any;
  totalVat: number;
  totalHT: any;
  totalFees: any;
  pages: number;
  framepayment: any;
  idCmd: string;
  status: string;
  applyVAT: boolean;
  symbol: string;
  rate: number;
  currencychange: boolean;
  paymentchange: boolean;
  checkv: any;
  loadvat: string;
  country: any;
  user: object;
  oldAddressBilling: { addressBilling: string; cityBilling: string; postalCodeBilling: string; countryBilling: string; vat: string };
  rib: {
    _id: string,
    id: string,
    device: string,
    name: string,
    symbol: string,
    bic: string,
    iban:{
      ib1: string,
      ib2: string,
      ib3: string,
      ib4: string,
      ib5: string,
      ib6: string,
      ib7: string
    },
    rib:{
      cb: string,
      cg: string,
      nc: string,
      cr: string,
      domiciliation: string
    },
    maxrib: string,
    taux: string
  };
  payment: string;
  payments: Array<object>;
  currencies: Array<object>;
  currency: string;
  surveyForm: { dd: string; dt: string; du: { cb: any[]; other: string; }; };
  termspdf: string;
  viewterms: boolean;
  term: boolean;
  survey: number;
  vat: number;
  ht: number;
  total: number;
  cart: Array<any>;
  cmd: object;
  page: string;
  caddiesactive: string;
  reviewactive: string;
  licensingactive: string;
  billingactive: string;
  confirmactive: string;
  paymentactive: string;
  breadcrumbs: Array<object>;
  closeResult: string;
  
  constructor(
    private router: Router,
    private configService: ConfigService,
    private userService: UserService,
    private orderService: OrderService,
    private uploadService: UploadService,
    private pdfService: PdfService,
    private paymentService: PaymentService,
    private vatService: VatService,
    private fluxService: FluxService,
    private currencyService: CurrencyService,
    private countriesService: CountriesService,
    private modalService: NgbModal,
    private calenda: NgbCalendar,
  ) {}

  ngOnInit() {
    this.minRib = false;
    this.pages = 1;
    this.cart = [];
    this.taux = [];
    this.idCmd = '';
    this.surveyForm = {dd: '', dt: '', du: { cb: [], other: ''} };
    this.term = false;
    this.dataset = {L1TRADEONLY: 'L1 - Trades', L1: 'L1 - Full', L2: 'L2 - MBL'};
    this.user = JSON.parse(sessionStorage.getItem('user'));
    this.getInfoUser(this.user['token']);
    this.status = 'Pending Licensing Information';

    if (JSON.parse(sessionStorage.getItem('tc'))) {
      this.term = JSON.parse(sessionStorage.getItem('tc'));
    }
    if (JSON.parse(sessionStorage.getItem('surveyForm'))) {
      this.surveyForm = JSON.parse(sessionStorage.getItem('surveyForm'));
    }

    this.currencychange= false;
    this.paymentchange= false;
    this.termspdf = '/files/historical_data_tc.pdf';
    this.checkv = false;
    this.loadvat = 'form-control';
    this.viewterms = true;
    this.survey = 0;
    this.symbol = '$';
    this.ht = 0;
    this.total = 0;
    this.caddiesactive = '';
    this.reviewactive = '';
    this.licensingactive = '';
    this.billingactive = '';
    this.confirmactive = '';
    this.paymentactive = '';
    if (this.router.url === '/order/caddies') {
      this.page = 'caddies';
    }
    if (this.router.url === '/order/review') {
      this.page = 'review';
    }
    if (this.router.url === '/order/licensing') {
      this.page = 'licensing';
    }
    if (this.router.url === '/order/billing') {
      this.page = 'billing';
      this.getCountry()
      this.getPayments();
    }
    if (this.router.url === '/order/orderconfirm') {
      // this.getRate();
      this.page = 'orderconfirm';
      // this.getCurrency();
    }

    this.breadcrumbs = [
      { name: "Shopping Cart", icon: "fa fa-shopping-cart", link:'/order/caddies', active:'active' },
      { name: "Order Review", icon: "fa fa-eye", link:'/order/review', active:this.reviewactive },
      { name: "Licensing", icon: "fa fa-briefcase", link:'/order/licensing', active:this.licensingactive },
      { name: "Billing", icon: "fa fa-clipboard", link:'/order/billing', active:this.billingactive },
      { name: "Order Confirmation", icon: "fa fa-handshake-o", link:'/order/orderconfirm', active:this.confirmactive },
      { name: "Payment", icon: "fa fa-credit-card", link:'/order/payment', active:this.paymentactive }
    ];
  }

  changeCurrency(e, id) {
    this.currencyObj = this.searchCurrency(id, this.currencies);
  }

  getPayments(){
    this.paymentService.getPaymentsActive().subscribe(res=>{
      this.payments = res;
    });
  }

  getInfoUser(token){
    let field = [
      'id',
      'email',
      'state',
      'roleName',
      'sameAddress',
      'token',
      'addressBilling',
      'postalCodeBilling',
      'cityBilling',
      'countryBilling',
      'idCountryBilling',
      'address',
      'postalCode',
      'city',
      'idCountry',
      'country',
      'vat',
      'checkvat',
      'payment',
      'currency'
    ];
    this.userService.info({token: token, field: field}).subscribe(res=>{
      this.user = res.user;
      this.checkv = res.user.checkvat;
      if (res.user.checkvat) { this.loadvat = 'form-control'; }
      if (this.router.url === '/order/orderconfirm') {
        if(res.user.payment) {
          this.payment = res.user.payment;
        } else {
          this.payment = '';
        }
      }  
      if(res.user.currency) {
        this.currency = res.user.currency;
        this.getRate();
      } else  {
        this.currency = '';
      }
      this.getCurrency();
      this.oldAddressBilling = {
        addressBilling: res.user.addressBilling,
        cityBilling: res.user.cityBilling,
        postalCodeBilling: res.user.postalCodeBilling,
        countryBilling: res.user.countryBilling,
        vat: res.user.vat
      }
      this.getCaddy(this.user['_id']);
    });
  }

  getCaddy(iduser){
    this.orderService.getCaddies({id: iduser}).subscribe((c) => {
      if(c.cmd.length > 0 ) {
        this.fluxService.rate({currency:c.cmd[0].currency}).subscribe(res=>{
          this.currency = c.cmd[0].currency;
          this.numVat = c.cmd[0].vat;
          this.currencyObj = this.searchCurrency(this.currency, this.currencies);
          this.rate = parseFloat(res.rate);
          let usd = 0;
          for (var i=0; i < this.currencies.length; i++) {
            if (this.currencies[i]['id'] === 'usd') {
              usd = this.currencies[i]['taux'];
              this.currencyTxUsd = usd;
            }
            if (this.currencies[i]['id'] === this.currency) {
                this.symbol =  this.currencies[i]['symbol'];
            }
          }
          this.configService.getVat().subscribe(res=>{
            this.vat = res.valueVat / 100;
            if(c.cmd.length > 0){
              this.cmd = c.cmd[0];
              this.idCmd = c.cmd[0].id_cmd;
              this.id = c.cmd[0].id;
              this.payment = c.cmd[0].payment;
              let index = 0;
              if(c.cmd[0].products.length === 0){
                this.breadcrumbs[1]['active'] = '';
                this.breadcrumbs[2]['active'] = '';
                this.breadcrumbs[3]['active'] = '';
                this.breadcrumbs[4]['active'] = '';
                this.breadcrumbs[5]['active'] = '';
              }
              if(c.cmd[0].state ==='CART' && c.cmd[0].products.length > 0){
                this.reviewactive = 'active';
                this.breadcrumbs[1]['active'] = this.reviewactive;
              }
              if(c.cmd[0].state ==='PLI' && c.cmd[0].products.length > 0){
                this.reviewactive = 'active';
                this.licensingactive = 'active';
                this.breadcrumbs[1]['active'] = this.reviewactive;
                this.breadcrumbs[2]['active'] = this.licensingactive;
              }
              if(c.cmd[0].state ==='PBI' && c.cmd[0].products.length > 0){
                this.reviewactive = 'active';
                this.licensingactive = 'active';
                this.billingactive = 'active';
                this.breadcrumbs[1]['active'] = this.reviewactive;
                this.breadcrumbs[2]['active'] = this.licensingactive;
                this.breadcrumbs[3]['active'] = this.billingactive;
              }
              if(c.cmd[0].state ==='PSC' && c.cmd[0].products.length > 0){
                this.reviewactive = 'active';
                this.licensingactive = 'active';
                this.billingactive = 'active';
                this.confirmactive = 'active';
                this.paymentactive = 'active';
                this.breadcrumbs[1]['active'] = this.reviewactive;
                this.breadcrumbs[2]['active'] = this.licensingactive;
                this.breadcrumbs[3]['active'] = this.billingactive;
                this.breadcrumbs[4]['active'] = this.confirmactive;
                this.breadcrumbs[5]['active'] = this.paymentactive;
              }
              this.cart = [];
              this.totalHTUsd = c.cmd[0].totalHT;
              this.totalFeesUsd = c.cmd[0].totalExchangeFees;
              this.discount = c.cmd[0].discount;
              this.totalAmountUsd = (this.totalHTUsd - (this.totalHTUsd * c.cmd[0].discount / 100) ) + c.cmd[0].totalExchangeFees;
              this.totalVatUsd = this.totalAmountUsd * this.vat;
              this.totalTTCUsd = this.precisionRound(this.totalAmountUsd + this.totalVatUsd, 2);
              if (this.currency !== 'usd') {
                this.totalFees = (c.cmd[0].totalExchangeFees / usd) * this.rate;
                this.totalHT = (c.cmd[0].totalHT / usd) * this.rate;
              } else {
                this.totalFees = c.cmd[0].totalExchangeFees;
                this.totalHT = c.cmd[0].totalHT;
              }
              this.totalAmount = (this.totalHT - (this.totalHT * c.cmd[0].discount / 100) ) + this.totalFees;
              if(this.totalAmount < this.currencyObj.maxrib) {
                this.minRib = true;
                this.user['payment'] = 'creditcard';
              }
              this.totalVat = this.totalAmount * this.vat;
              this.totalTTC = this.precisionRound(this.totalAmount + this.totalVat, 2);
              c.cmd.forEach((cmd) => {
                cmd.products.forEach((p) => {
                  index++;
                  let ht = 0;
                  let backfill_fee = 0;
                  let ongoing_fee = 0;
                  if (this.currency !== 'usd') {
                    ht = (p.ht / usd) * this.rate;
                    backfill_fee = (p.backfill_fee / usd) * this.rate;
                    ongoing_fee = (p.ongoing_fee / usd) * this.rate;
                  } else{
                    ht = p.ht;
                    backfill_fee = p.backfill_fee;
                    ongoing_fee = p.ongoing_fee;
                  }
                  let prod = {
                    print: false, 
                    id: index,
                    idCmd: cmd.id_cmd,
                    idElem: p.id_undercmd,
                    quotation_level: p.dataset,
                    symbol: p.symbol,
                    exchange: p.exchangeName,
                    mics: p.mics,
                    assetClass: p.assetClass,
                    eid: p.eid,
                    qhid: p.qhid,
                    description: p.description,
                    onetime: p.onetime,
                    subscription: p.subscription,
                    period: p.period,
                    pricingTier: p.pricingTier,
                    price: p.price,
                    backfill_fee: backfill_fee,
                    ongoing_fee: ongoing_fee,
                    ht: ht,
                    begin_date_select: p.begin_date,
                    bdref: this.dateNGB(p.begin_date_ref),
                    begin_date: p.begin_date_ref,
                    bds: this.dateNGB(p.begin_date),
                    end_date_select : p.end_date,
                    end_date : p.end_date_ref,
                    edref : this.dateNGB(p.end_date_ref),
                    eds : this.dateNGB(p.end_date)
                  };
                  this.cart.push(prod);
                  if (p.backfill_fee > 0 || p.ongoing_fee > 0) {
                    this.cart.push({ print: true, backfill_fee: backfill_fee, ongoing_fee: ongoing_fee });
                  }
                });
              });
              if (this.router.url === '/order/payment') {
                this.page = 'payment';
                if(this.payment === 'creditcard'){
                  this.idCmd = this.cmd['id_cmd'];
                  this.submitPayment();
                }
                if(this.payment === 'banktransfer'){
                  this.getRib();
                }
              }
            }
          });
        });
      }
    });
  }

  previousPage() {
    this.pages--;
  }
  nextPage() {
    this.pages++;
  }

  // Function Shopping Cart
  getCart(){
    // this.cart[0]["price"] = 105;
    this.cart.forEach(element => {
      this.ht += (parseFloat(element['price']) * this.rate );
    });
    this.isUE();
  }

  getRib() {
    this.rib = { _id: '', id: '', device: '', name: '', symbol: '', bic: '', iban:{ ib1: '', ib2: '', ib3: '', ib4: '', ib5: '', ib6: '', ib7: '' }, rib:{ cb: '', cg: '', nc: '', cr: '', domiciliation: '' }, maxrib: '', taux: '' };
    this.currencyService.getRib(this.currency).subscribe(res => {
      this.rib = res.rib;
    });
  }

  updateCaddies(idCmd, idElem, begin_date, end_date, begin_date_ref, end_date_ref, price, status = '' ) {
    let valid = false;
    let updt = {};
    updt['idCmd'] = idCmd;
    updt['idElem'] = idElem;
    updt['totalHT'] = 0;
    if (new Date(this.yyyymmdd(begin_date)) >= new Date(begin_date_ref) && new Date(this.yyyymmdd(begin_date)) <= new Date(this.yyyymmdd(end_date)) ) {
      updt['begin_date'] = new Date(this.yyyymmdd(begin_date));
      valid = true;
    } else {
      valid = true;
    }
    if (new Date(this.yyyymmdd(end_date)) <= new Date(end_date_ref) && new Date(this.yyyymmdd(begin_date)) <= new Date(this.yyyymmdd(end_date)) ) {
      updt['end_date'] = new Date(this.yyyymmdd(end_date));
      valid = true;
    } else {
      valid = true;
    }
    let diff = this.dateDiff(updt['begin_date'], updt['end_date']).day + 1;
    if(diff < 20) {
      updt['period'] = 20;
      updt['ht'] = 20 * parseFloat(price);
    } else {
      updt['period'] = diff;
      updt['ht'] = diff * parseFloat(price);
    }
    if (status !== '') {
      updt['status'] = status;
    }
    if (valid) {
      this.orderService.updtProductCaddy(updt).subscribe(()=>{
        this.cart = [];
        this.getCaddy(this.user['_id']);
      });
    }
  }
  delCaddies(idCmd, idElem, ht, backfill_fee, ongoing_fee) {
    this.totalFees = this.totalFees - backfill_fee - ongoing_fee;
    this.totalHT = this.totalHT - ht;
    this.orderService.delElemOrder({id_cmd:idCmd, id_product: idElem, backfill_fee: backfill_fee, totalFees: this.totalFees, totalHT: this.totalHT}).subscribe(()=>{
      this.cart = [];
      this.getCaddy(this.user['_id']);
    });
  }
  dateNGB(d) {
    let dm = this.calenda.getToday();
    let dsplit = d.split('-');
    dm.year = parseInt(dsplit[0]);
    dm.month = parseInt(dsplit[1]);
    dm.day = parseInt(dsplit[2]);
    return dm;
  }
  isUE(){
    if(this.user['countryBilling']){
      this.countriesService.isUE({id:this.user['countryBilling']}).subscribe(res=>{
        this.applyVAT = res.ue;
        if(this.applyVAT) {
          this.total = this.ht * (this.vat + 1);
        } else {
          this.total = this.ht;
        }  
      });
    }
  }
  //Function Review

  // Function Licensing

  termsOpen() {
    this.viewterms = false;
  }
  termsClose() {
    this.pages = 1;
    this.viewterms = true;
  }
  termsCheckbox(element: HTMLInputElement): void {
    this.term = element.checked;
    if(element.checked){
      sessionStorage.setItem('tc', JSON.stringify(this.term));
    } else {
      sessionStorage.removeItem('surveyForm');
      this.surveyForm = {dd: '', dt: '', du: { cb: [], other: ''} };
    }
  }
  next() {
    this.survey++;
  }
  previous() {
    this.survey--;
  }
  updtSurvey(event){
    this.surveyForm = event.value;
  }
  saveOrderView() {
    this.orderService.updtCaddy({idCmd: this.idCmd, state: 'PLI'}).subscribe(res=>{});
  }
  saveSurvey(){
    sessionStorage.setItem('surveyForm', JSON.stringify(this.surveyForm));
    this.orderService.updtCaddy({idCmd: this.idCmd, state: 'PBI', survey: this.surveyForm}).subscribe(res=>{});
  }

  //Function Billing
  getCountry() {
    this.countriesService.getCountries().subscribe(res => {
      this.country = res.countries;
    });
  }
  saveBilling() {
    let modify = {};
    let billingCart = {};
    // sessionStorage.setItem('user', JSON.stringify(this.user));
    
    billingCart['currency'] = this.user['currency'];
    if(this.currencychange){
      modify['currency'] = this.user['currency'];
    }
    billingCart['currencyTx'] = this.taux[billingCart['currency']];
    billingCart['currencyTxUsd'] = this.taux['usd'];
    billingCart['vatValue'] = this.vat;
    
    billingCart['payment'] = this.user['payment'];
    if(this.paymentchange){
      modify['payment'] = this.user['payment'];
    }
    billingCart['vat'] = this.user['vat'];
    if(this.user['vat'] !== this.oldAddressBilling['vat']){
      modify['vat'] = this.user['vat'];
    }
    billingCart['addressBilling'] = this.user['addressBilling'];
    if(this.user['addressBilling'] !== this.oldAddressBilling['addressBilling']){
      modify['addressBilling'] = this.user['addressBilling'];
    }
    billingCart['cityBilling'] = this.user['cityBilling'];
    if(this.user['cityBilling'] !== this.oldAddressBilling['cityBilling']){
      modify['cityBilling'] = this.user['cityBilling'];
    }
    billingCart['countryBilling'] = this.user['countryBilling'];
    if(this.user['countryBilling'] !== this.oldAddressBilling['countryBilling']){
      modify['countryBilling'] = this.user['countryBilling'];
    }
    billingCart['postalCodeBilling'] = this.user['postalCodeBilling'];
    if(this.user['postalCodeBilling'] !== this.oldAddressBilling['postalCodeBilling']){
      modify['postalCodeBilling'] = this.user['postalCodeBilling'];
    }
    // if(this.currencychange || this.paymentchange){
      modify['token'] = this.user['token'];
      modify['checkvat'] = this.checkv;
      this.userService.preferBilling(modify).subscribe(res=>{});
    // }
    for (let index = 0; index < this.cart.length; index++) {
      this.cart[index].status = 'PSC';
    }
    this.orderService.updtCaddy({idCmd: this.idCmd, state: 'PSC', billing: billingCart, cart: this.cart}).subscribe(res=>{});
  }

  saveAmount() {
    this.orderService.updtCaddy({
      idCmd: this.idCmd,
      state: 'PSC',
      totaux : {
        totalExchangeFees : this.totalFeesUsd,
        totalHT : this.totalHTUsd,
        currencyTx : this.rate,
        currencyTxUsd : this.currencyTxUsd,
        currency : this.currency,
        totalTTC : this.precisionRound(this.totalTTCUsd, 2),
      }
    }).subscribe(res=>{});
  }

  sameAddress(){
    if (this.user['sameAddress']){
      this.user['addressBilling'] = this.user['address'];
      this.user['cityBilling'] = this.user['city'];
      this.user['postalCodeBilling'] = this.user['postalCode'];
      this.user['countryBilling'] = this.user['country'];
    }
    else {
      this.user['addressBilling'] = this.oldAddressBilling['addressBilling'];
      this.user['cityBilling'] = this.oldAddressBilling['cityBilling'];
      this.user['postalCodeBilling'] = this.oldAddressBilling['postalCodeBilling'];
      this.user['countryBilling'] = this.oldAddressBilling['countryBilling'];
    }
  }
  checkVat(){
    if (this.user['vat'] !== '' && this.user['vat']) {
      let c = this.user['vat'].substring(0,2);
      let v = this.user['vat'].substring(2,this.user['vat'].length);
      this.loadvat = 'form-control loading';
      this.vatService.checkVat(c + '|' + v).subscribe(data=>{
        this.checkv = data.valid;
        this.loadvat = 'form-control';
      },
      error=>{
        console.error(error);
      });
    }
  }

  //Function Order Confirmation
  getRate(){
    this.fluxService.rate({currency:this.currency}).subscribe(res=>{
      this.rate = parseFloat(res.rate);
      this.getCart();
    });
  }

  //Function Payment
  submitPayment() {
    // let user = JSON.parse(sessionStorage.getItem('user'));
    const that = this;
    this.orderService.payment({
      cart: {
        idCmd: this.idCmd,
        total: this.totalTTCUsd,
        vatValue: this.vat,
        currency: this.currency,
        currencyTx: this.rate,
        currencyTxUsd: this.currencyTxUsd
      },
      user: this.user
    }).subscribe(resp=>{
      let sdkConfigObj = {
        context : 'test' // change it to 'live' when going live.
      }
      let checkout = chckt.checkout(resp.body, '#paymentcard', sdkConfigObj);
      chckt.hooks.beforeComplete = function(node, paymentData) {
        that.orderService.verify(paymentData).subscribe(r=>{
          if(r.ok === 1){
            sessionStorage.removeItem('tc');
            sessionStorage.removeItem('surveyForm');
            that.surveyForm = {dd: '', dt: '', du: { cb: [], other: ''} };
            that.open();
          }
          return false;
        });
      }
    });
  }
 
  submitRib() {
    // this.pdfService.setPdf(this.cmd, this.user['id'], this.rib);
    // this.pdfService.setHeader('', this.user['id'], this.numVat, '', '', this.id, this.currency);
    // this.pdfService.setBillinAddress(companyName, address, cp, city, country);
    // this.pdfService.link('QH-ORDER-'+ this.id);
    // this.uploadService.pdfOrderFrom({
    //   type: 'order',
    //   id: this.id,
    //   cmd: this.cmd,
    //   token: this.user['token']
    // }).subscribe(()=>{});
    this.orderService.rib({
      idCmd: this.idCmd,
      total: this.totalTTCUsd,
      vatValue: this.vat,
      currency: this.currency,
      currencyTx: this.rate,
      currencyTxUsd: this.currencyTxUsd,
      email: this.user['email'],
      token: this.user['token']
    }).subscribe(resp=>{
      sessionStorage.removeItem('tc');
      sessionStorage.removeItem('surveyForm');
      this.surveyForm = {dd: '', dt: '', du: { cb: [], other: ''} };
      this.open();
      // this.pdfService.header('', this.user['id'], this.numVat, '', '', this.id, this.currency);
      // this.pdfService.link('QH-CMD-'+ this.id);
    });
  }

  open() {
    const message = [
      'Thank you for your order','', 
      'Your order has been submitted successfully and it is now pending validation.',
      'You will be notified by email once your order has been validated and when you can access your data. You could as well follow the progress of all your orders via your personal profile / order history section.'
    ];

    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = 'Order Submitted';
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.link = '/';
  }

   //Function ALL
  getCurrency() {
    this.currencyService.getCurrencies().subscribe(res => {
      this.currencies = res.currencies;
      // if(this.page === 'orderconfirm'){
        this.getSymbol();
      // }
    });
  }
  getSymbol(){
    for (var i=0; i < this.currencies.length; i++) {
      if (this.currencies[i]['id'] === this.user['currency']) {
          this.symbol =  this.currencies[i]['symbol'];
        }
        this.taux[this.currencies[i]['id']] = this.currencies[i]['taux'];
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
  searchCurrency(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
      if (myArray[i].id === nameKey) {
        return myArray[i];
      }
    }
  }
  yyyymmdd(d) {
    var mm = d.month;
    var dd = d.day;
    return [ d.year, (mm>9 ? '' : '0') + mm,(dd>9 ? '' : '0') + dd ].join('-');
  };

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
}
