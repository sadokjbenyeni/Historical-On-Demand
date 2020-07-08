
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { OrderService } from '../../../services/order.service';
import { CountriesService } from '../../../services/countries.service';
import { CurrencyService } from '../../../services/currency.service';
import { UserService } from '../../../services/user.service';
import { ConfigService } from '../../../services/config.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../formatters/format-datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { BillingComponent } from '../billing/billing.component';
import { MatStepper } from '@angular/material/stepper';
import { BehaviorSubject, } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { OrderAmount } from '../../order/models/order-amount.model';
import { filter } from 'rxjs/operators';
import { NgbdModalContent } from '../../../shared/modal-content/modal-content';




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
  pages: number;
  vatValueApply: boolean;
  symbol: string;
  currencychange: boolean = false;
  paymentchange: boolean = false;
  addresschange: boolean = false;
  checkv: any = false;
  user: any;
  ribObject: {
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
  payments: Array<object>;
  currencies: Array<object>;
  currency: string;
  surveyForm: any;
  termspdf: string = '/files/historical_data_tc.pdf';
  viewterms: boolean = true;
  term: boolean = false;
  ht: number;
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
    private currencyService: CurrencyService,
    private countriesService: CountriesService,
    private modalService: NgbModal,
    private router: Router,
  ) { }
  ngOnDestroy(): void {
    if (this.caddy) {
      this.observerRoute.unsubscribe();
    }

  }
  get form() {
    return this.billingComponent ? this.billingComponent.form : null;
  }
  ngOnInit() {
    this.observerRoute = this.router.events.subscribe(rout => {
      if (rout instanceof NavigationStart)
        this.orderService.updateCaddyState(this.getStepKey(this.stepper.selectedIndex)).subscribe();
    })
    this.pages = 1;
    this.getInfoUser();
  }


  getInfoUser() {

    let field = [
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
      'payment',
      'currency'
    ];
    this.userService.info({ field: field }).subscribe(res => {
      this.user = res.user;
      //checkinitialVat

      // a retirer lors de l'implementation CB
      this.user.payment = 'banktransfer';
      // fin a retirer
      this.user.payment = res.user.payment ? res.user.payment : ''
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
      if (!order) {
        this.noCaddy = true
        this.observerRoute.unsubscribe();
        return
      }
      this.caddy = order;
      this.currencyService.getCurrencies().subscribe(list => {
        this.symbol = list.currencies.find(item => item.id == this.currency).symbol;
        let countrybilling = this.billingComponent.form ? this.billingComponent.form.controls['countryBillingctl'].value : this.user.countryBilling
        this.calculateFinalAmount(countrybilling);
        this.caddy.products.forEach(item => {
          item.Allproducts = item.subscription.concat(item.onetime)
          item.Allproducts.forEach(product => {
            product.begin_date = new Date(product.begin_date);
            product.end_date = new Date(product.end_date);
          });
        })

        if (this.user.payment === 'banktransfer') {
          this.getRib();
        }
      });
    });
  }

  setvatvalid(isvalid) {
    this.checkv = isvalid;
    let billingcountry = this.billingComponent ? this.billingComponent.form.controls['countryBillingctl'].value : this.user.billingCountry
    this.calculateFinalAmount(billingcountry)
  }
  calculateFinalAmount(billingCountry) {
    this.orderAmountModel = {
      currency: this.currency,
      discount: 0,
      totalExchangeFees: this.caddy.totalExchangeFees,
      totalHT: this.caddy.totalHT,
      totalTTC: this.caddy.totalHT,
      totalVat: 0,
      vatValue: 0
    }
    if (billingCountry == 'FR') {
      this.setVat()
    }
    else if (!this.checkv)
      this.countriesService.isUE({ id: billingCountry }).subscribe(res => {
        if (res.ue == 1) {
          this.setVat()
        }
      });
  }
  setVat() {
    this.configService.getVat().subscribe(vat => {
      this.orderAmountModel.vatValue = vat.valueVat / 100;
      this.orderAmountModel.totalVat = this.orderAmountModel.totalHT * this.orderAmountModel.vatValue;
      this.orderAmountModel.totalTTC += this.orderAmountModel.totalVat
    })
  }

  previousPage() {
    this.pages--;
  }
  nextPage() {
    this.pages++;
  }

  getRib() {
    this.ribObject = { _id: '', id: '', device: '', name: '', symbol: '', bic: '', iban: { ib1: '', ib2: '', ib3: '', ib4: '', ib5: '', ib6: '', ib7: '' }, rib: { cb: '', cg: '', nc: '', cr: '', domiciliation: '' }, maxrib: '', taux: '' };
    this.currencyService.getRib(this.currency).subscribe(res => {
      this.ribObject = res.rib;
    });
  }

  delCaddies(id_undercmd) {
    this.orderService.delElemOrder({ id_product: id_undercmd }).subscribe((res) => {
      if (res.message == 'Order deleted') {
        this.caddy = null;
        this.observerRoute.unsubscribe();
      }
      else if (res.error) {
        console.log(`An error occured ${res.error}`)
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

  updtSurvey(event) {
    if (event == "Previous") { this.stepper.previous() }
    else if (this.term) {
      this.survey = event;
      this.stepper.selected.completed = true;
      this.stepper.next()
    }

  }

  submitRib() {
    this.orderService.submitCaddy(this.currency, this.survey,
      {
        vatNumber: this.billingComponent.form.controls['vatctl'].value,
        countryBilling: this.billingComponent.form.controls['countryBillingctl'].value,
        addressBilling: this.billingComponent.form.controls['addressBillingctl'].value,
        cityBilling: this.billingComponent.form.controls['cityBillingctl'].value,
        postalCode: this.billingComponent.form.controls['postalCodeBillingctl'].value,
      }
    ).subscribe(() => {
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
    modalRef.componentInstance.title = 'Order Submitted';
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.link = '/';
  }

  //Function ALL
  getCurrency() {
    this.currencyService.getCurrencies().subscribe(res => {
      this.currencies = res.currencies;
      this.symbol = this.getSymbol(this.currency);
    });
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
  getSymbol(currency) {
    var symbols = new Map<string, string>();
    symbols.set("gbp", "£")
    symbols.set("eur", "‎€")
    symbols.set("usd", "$")
    return symbols.get(currency);
  }
}
