declare var chckt: any;

import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from '../../../modal-content';

import { OrderService } from '../../../services/order.service';
import { FluxService } from '../../../services/flux.service';
import { CountriesService } from '../../../services/countries.service';
import { CurrencyService } from '../../../services/currency.service';
import { UserService } from '../../../services/user.service';
import { ConfigService } from '../../../services/config.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../format-datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { BillingComponent } from '../billing/billing.component';
import { MatStepper } from '@angular/material/stepper';
import { BehaviorSubject, } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { OrderAmount } from '../../order/models/order-amount.model';
import { filter } from 'rxjs/operators';




@Component({
  selector: 'app-caddies',
  templateUrl: './caddies.component.html',
  styleUrls: ['./caddies.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class CaddiesComponent implements OnInit, OnDestroy {
  @ViewChild(BillingComponent) billingComponent: BillingComponent;
  @ViewChild('stepper') private stepper: MatStepper;

  getSurvey: BehaviorSubject<any> = new BehaviorSubject<any>("init");
  IsChangeDefaultCurrency: boolean = false;
  IsChangeCurrency: boolean = false;
  IsChangeDefaultAdress: boolean = false;
  numVat: any;
  currencyObj: any;
  taux: any;
  currencyTxUsd: number;
  totalHT: any;
  pages: number;
  framepayment: any;
  // applyVAT: boolean;
  vatValueApply: boolean;
  symbol: string;
  rate: number;
  currencychange: boolean;
  paymentchange: boolean;
  addresschange: boolean;
  checkv: any;
  country: any;
  user: any;
  // oldAddressBilling: { addressBilling: string; cityBilling: string; postalCodeBilling: string; countryBilling: string; vat: string };
  rib: {
    _id: string,
    id: string,
    device: string,
    name: string,
    symbol: string,
    bic: string,
    iban: {
      ib1: string,
      ib2: string,
      ib3: string,
      ib4: string,
      ib5: string,
      ib6: string,
      ib7: string
    },
    rib: {
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
  surveyForm: any;
  termspdf: string;
  viewterms: boolean;
  term: boolean;
  vat: number;
  ht: number;
  total: number;
  caddy: any;
  page: string;
  caddiesactive: string;
  reviewactive: string;
  licensingactive: string;
  billingactive: string;
  confirmactive: string;
  paymentactive: string;
  closeResult: string;
  billingStep: any;
  survey: any;
  noCaddy: boolean;
  orderAmountModel: OrderAmount;
  observerRoute: any;
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private orderService: OrderService,
    private fluxService: FluxService,
    private currencyService: CurrencyService,
    private countriesService: CountriesService,
    private modalService: NgbModal,
    private router: Router,
  ) { }
  ngOnDestroy(): void {
    this.observerRoute.unsubscribe();

  }
  get form() {
    return this.billingComponent ? this.billingComponent.form : null;
  }



  ngOnInit() {
    this.observerRoute = this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(() => {
      this.orderService.updateCaddyState(this.getStepKey(this.stepper.selectedIndex)).subscribe();
    })
    this.pages = 1;
    this.taux = [];
    this.term = false;
    this.getInfoUser();

    // if (JSON.parse(sessionStorage.getItem('surveyForm'))) {
    //   this.surveyForm = JSON.parse(sessionStorage.getItem('surveyForm'));
    // }

    this.currencychange = false;
    this.paymentchange = false;
    this.addresschange = false;
    this.termspdf = '/files/historical_data_tc.pdf';
    this.checkv = false;
    this.viewterms = true;
    this.symbol = '$';
    this.total = 0;
  }


  getInfoUser() {
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
    this.userService.info({ field: field }).subscribe(res => {
      this.user = res.user;
      // a retirer lors de l'implementation CB
      res.user.payment = 'banktransfer';
      this.user["payment"] = 'banktransfer';
      this.payment = 'banktransfer';
      // fin a retirer
      this.checkv = res.user.checkvat;
      this.payment = res.user.payment ? res.user.payment : ''
      //à retirer lors de l'implémentation du paiement par CB
      if (this.user.currency) {
        this.currency = res.user.currency;
      }
      this.getCurrency();
      this.getCaddy();

    });
  }

  getCaddy(currency = null) {
    let caddysubscription = currency ? this.orderService.getCaddies(currency) : this.orderService.getCaddies();
    caddysubscription.subscribe((order) => {
      debugger
      if (!order) {
        this.noCaddy = true
      }
      else {
        this.caddy = order;
        this.fluxService.rate({ currency: this.currency }).subscribe(result => {
          this.currencyObj = this.searchCurrency(this.currency, this.currencies);
          this.rate = parseFloat(result.rate);
          let usd = 0;
          this.currencies.forEach(element => {
            if (element['id'] === 'usd') {
              usd = element['taux'];
              this.currencyTxUsd = usd;
            }
            if (element['id'] === this.currency) {
              this.symbol = element['symbol'];
            }
          });

          this.configService.getVat().subscribe(res => {
            this.vat = res.valueVat / 100;
            this.payment = 'banktransfer';
            this.countriesService.isUE({ id: this.user['countryBilling'] }).subscribe(res => {
              this.vatValueApply = (this.user['countryBilling'] == 'FR' || (res.ue == 1 && (this.user['vat'] == '' || !this.checkv)));

              if (!this.vatValueApply) {
                this.caddy.totalVatUsd = 0;
                this.caddy.totalVat = 0;
              } else {
                this.caddy.totalVatUsd = this.caddy.totalAmountUsd * this.vat;
                this.caddy.totalVat = this.caddy.totalHT * this.vat;
              }
              this.caddy.totalTTCUsd = this.precisionRound(this.caddy.totalAmountUsd + this.caddy.totalVatUsd, 2);
              this.caddy.totalTTC = this.caddy.totalHT + this.caddy.totalVat;

              this.orderAmountModel = {
                currency: this.currency,
                discount: this.caddy.discount,
                totalExchangeFees: this.caddy.totalExchangeFees,
                totalHT: this.caddy.totalHT,
                totalTTC: this.caddy.totalTTC,
                totalVat: this.caddy.totalVat,
                vatValue: this.caddy.vatValue
              }
            });

            this.caddy.products.forEach(item => {
              item.Allproducts = item.subscription.concat(item.onetime)
              item.Allproducts.forEach(product => {
                product.begin_date = new Date(product.begin_date);
                product.end_date = new Date(product.end_date);
              });
            })
            // if(this.payment === 'creditcard'){
            //   this.idCmd = this.cmd['id_cmd'];
            //   this.submitPayment();
            // }
            if (this.payment === 'banktransfer') {
              this.getRib();
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

  getRib() {
    this.rib = { _id: '', id: '', device: '', name: '', symbol: '', bic: '', iban: { ib1: '', ib2: '', ib3: '', ib4: '', ib5: '', ib6: '', ib7: '' }, rib: { cb: '', cg: '', nc: '', cr: '', domiciliation: '' }, maxrib: '', taux: '' };
    this.currencyService.getRib(this.currency).subscribe(res => {
      this.rib = res.rib;
    });
  }

  delCaddies(id_undercmd) {
    this.orderService.delElemOrder({ id_product: id_undercmd }).subscribe((res) => {
      if (res['message'] == 'Order deleted') {
        this.caddy = null;
      }
      else if (res['error']) {
        console.log(`An error occured ${res['error']}`)
      }
      else {
        this.getCaddy(this.currency);
      }
    });
  }

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
  }
  updtSurvey(event) {
    if (event == "Previous") { this.stepper.previous() }
    else if (this.term) {
      this.survey = event;
      this.stepper.selected.completed = true;
      this.stepper.next()
    }

  }
  saveOrderView() {
    this.orderService.updtCaddy({ idCmd: this.caddy.id_cmd, state: 'PLI' }).subscribe(res => { });
  }

  //Function Billing

  // saveBilling() {
  //   let modify = {};
  //   let billingCart = {};
  //   // sessionStorage.setItem('user', JSON.stringify(this.user));

  //   this.countriesService.isUE({ id: this.user['countryBilling'] }).subscribe(res => {
  //     this.vatValueApply = (this.user['countryBilling'] == 'FR' || (res.ue == 1 && (this.user['vat'] == '' || !this.checkv)));

  //     billingCart['currency'] = this.currency;
  //     if (this.currencychange) {
  //       modify['currency'] = this.currency;
  //     }
  //     billingCart['currencyTx'] = this.taux[billingCart['currency']];
  //     billingCart['currencyTxUsd'] = this.taux['usd'];
  //     billingCart['vatValue'] = this.vatValueApply ? this.vat : null;

  //     billingCart['payment'] = this.user['payment'];
  //     if (this.paymentchange) {
  //       modify['payment'] = this.user['payment'];
  //     }
  //     this.orderService.updtCaddy({ idCmd: this.caddy.id_cmd, state: 'PSC', billing: billingCart, cart: this.caddy.products }).subscribe(res => { });
  //   });
  // }

  // saveAmount() {
  //   this.orderService.updtCaddy({
  //     idCmd: this.caddy.id_cmd,
  //     state: 'PSC',
  //     totaux: {
  //       totalHT: this.caddy['totalHT'],
  //       currencyTx: this.rate,
  //       currencyTxUsd: this.currencyTxUsd,
  //       currency: this.currency,
  //       totalTTC: this.precisionRound(this.caddy.totalTTCUsd, 2),
  //     }
  //   }).subscribe();
  // }
  //Function Payment
  // submitPayment() {
  //   // let user = JSON.parse(sessionStorage.getItem('user'));
  //   const that = this;
  //   this.orderService.payment({
  //     cart: {
  //       idCmd: this.caddy.id_cmd,
  //       total: this.caddy.totalTTCUsd,
  //       vatValue: this.vat,
  //       currency: this.currency,
  //       currencyTx: this.rate,
  //       currencyTxUsd: this.currencyTxUsd
  //     },
  //     user: this.user
  //   }).subscribe(resp => {
  //     let sdkConfigObj = {
  //       context: 'test' // change it to 'live' when going live.
  //     }
  //     let checkout = chckt.checkout(resp.body, '#paymentcard', sdkConfigObj);
  //     chckt.hooks.beforeComplete = function (node, paymentData) {
  //       if (paymentData.resultCode === "authorised") {
  //         that.orderService.verify(paymentData).subscribe(r => {
  //           if (r.ok === 1) {
  //             sessionStorage.removeItem('tc');
  //             sessionStorage.removeItem('surveyForm');
  //             that.surveyForm = { dd: '', dt: '', du: { cb: [], other: '' } };
  //             that.open();
  //           }
  //           return false;
  //         });
  //       }
  //        else {
  //         that.orderService.logPayement(paymentData).subscribe(r => {
  //           return false;
  //         });
  //       }
  //     }
  //   });
  // }

  submitRib() {
    this.orderService.submitCaddy(this.currency, this.survey,
      {
        vatNumber: this.billingComponent.form.controls['vatctl'].value,
        countryBilling: this.billingComponent.form.controls['countryBillingctl'].value,
        addressBilling: this.billingComponent.form.controls['addressBillingctl'].value,
        cityBilling: this.billingComponent.form.controls['cityBillingctl'].value,
        postalCode: this.billingComponent.form.controls['postalCodeBillingctl'].value,
      }
    ).subscribe(resp => {
      this.open();
    });
    if (this.IsChangeDefaultAdress) {
      this.userService.changeDefaultAdress(
        this.billingComponent.form.controls['vatctl'].value,
        this.billingComponent.form.controls['countryBillingctl'].value,
        this.billingComponent.form.controls['addressBillingctl'].value,
        this.billingComponent.form.controls['cityBillingctl'].value,
        this.billingComponent.form.controls['postalCodeBillingctl'].value
      ).subscribe();
    }
    if (this.IsChangeDefaultCurrency) {
      this.userService.changeDefaultCurrency(this.currency).subscribe();
    }
    // this.orderService.sortProducts({ idCmd: this.caddy.id_cmd }).subscribe(res => { });
  }

  open() {
    this.observerRoute.unsubscribe();
    const message = [
      'Thank you for your order', '',
      'Your order has been submitted successfully and it is now pending validation.',
      'You will be notified by email once your order has been validated and when you can access your data. You could as well follow the progress of all your orders via your personal profile / order history section.'
    ];

    const modalRef = this.modalService.open(NgbdModalContent, { backdrop: "static", keyboard: false })

    console.log(modalRef.componentInstance)
    modalRef.componentInstance.title = 'Order Submitted';
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.link = '/';
  }

  //Function ALL
  getCurrency() {
    this.currencyService.getCurrencies().subscribe(res => {
      this.currencies = res.currencies;
      this.getSymbol();
    });
  }
  getSymbol() {
    for (var i = 0; i < this.currencies.length; i++) {
      if (this.currencies[i]['id'] === this.currency) {
        this.symbol = this.currencies[i]['symbol'];
      }
      this.taux[this.currencies[i]['id']] = this.currencies[i]['taux'];
    }
  }

  searchCurrency(nameKey, myArray) {
    return myArray.find(item => item.id == nameKey);
  }


  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  DateChange(event) {
    if (event.dateToChange == "begin_date") {
      if (event.date.setHours(0, 0, 0, 0) >= new Date(event.product.begin_date_ref).setHours(0, 0, 0, 0) && event.date.setHours(0, 0, 0, 0) <= new Date(event.product.end_date).setHours(0, 0, 0, 0)) {
        this.changetheDate(event.product.id_undercmd, event.dateToChange, event.date)
      }
      else {
        event.product.begin_date = event.product.begin_date_ref
      }
    }
    else {
      if (event.date.setHours(0, 0, 0, 0) <= new Date(event.product.end_date_ref).setHours(0, 0, 0, 0) && event.date.setHours(0, 0, 0, 0) >= new Date(event.product.begin_date).setHours(0, 0, 0, 0)) {
        this.changetheDate(event.product.id_undercmd, event.product, event.date)
      }
      else {
        event.product.end_date = event.product.end_date_ref
      }
    }

  }
  changetheDate(idprod, dateTochange, date) {
    this.orderService.updateProductDate({ idproduct: idprod, dateToChange: dateTochange, date: date }).subscribe((res) => {
      if (res.error) {
        console.log('an error occured' + res.error)
      }
      else {
        this.getCaddy(this.currency);
      }
    });
  }
  ChangeDefaultCurrency(event) {
    this.IsChangeDefaultCurrency = event
  }

  ChangeCurrency(event) {
    this.currency = event;
    this.getCaddy(event);
  }

  ChangeDefaultAdress(event) {
    this.IsChangeDefaultAdress = event;
  }
  stepForward() {
    this.getSurvey.next("Next");
  }

  stepBack() {
    if (!this.term) {
      this.stepper.previous()
    } else {
      this.getSurvey.next("Previous")
    }
  }
  getStepKey(stepIndex) {
    var steps = new Map<number, string>();
    steps.set(0, "CART")
    steps.set(1, "CART")
    steps.set(2, "PLI")
    steps.set(3, "PBI")
    steps.set(4, "PSC")
    steps.set(5, "PSC")
    return steps.get(stepIndex);
  }
}
