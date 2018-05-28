import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { RecaptchaModule } from 'ng-recaptcha';

import { UserService } from '../../services/user.service';
import { CurrencyService } from '../../services/currency.service';
import { VatService } from '../../services/vat.service';
import { PaymentService } from '../../services/payment.service';
import { CountriesService } from '../../services/countries.service';
import { CompanytypesService } from '../../services/companytypes.service';

export interface FormModel {
  captcha?: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  confirmation: string;
  isValidPwd: boolean;
  oldAddressBilling: { addressBilling: string; cityBilling: string; postalCodeBilling: string; countryBilling: string; };
  title: string;
  same: boolean;
  loadvat: string;
  message: string;
  coll: string;
  colg: string;
  key: string;
  pnl: string;
  user: object;
  page: string;
  payments: Array<object>;
  currencies: Array<object>;
  companyType: Array<object>;
  country: Array<object>;
  exist: boolean;
  checkrobot: boolean;
  checkv: boolean; // check VAT Number
  term: boolean;


  public formModel: FormModel = {};

  constructor(
    private router: Router,
    private userService: UserService,
    private paymentService: PaymentService,
    private vatService: VatService,
    private currencyService: CurrencyService,
    private countriesService: CountriesService,
    private companytypesService: CompanytypesService
  ) {
  }

  @ViewChild('utilisateurForm')
  private utilisateurForm: NgForm;

  ngOnInit() {
    this.page = this.router.url;
    this.key = '6LcQ80cUAAAAANfU8xFYxntN36rEdS5X5H7bjv3_'; //key reCaptcha
    this.pnl = 'panel panel-primary';
    this.confirmation = '';
    this.isValidPwd = false;
    this.message = '';
    this.exist = true;
    this.checkrobot = true;
    this.term = false;
    this.checkv = false;
    this.loadvat = 'form-control';
    this.getPayments();
    this.user = <object> {
      id: <string>'',
      firstname: <string>'',
      lastname: <string>'',
      email: <string>'',
      password: <string>'',
      job: <string>'',
      companyName: <string>'',
      companyType: <string>'',
      country: <string>'',
      address: <string>'',
      postalCode: <string>'',
      city: <string>'',
      countryBilling: <string>'',
      addressBilling: <string>'',
      postalCodeBilling: <string>'',
      cityBilling: <string>'',
      region: <string>'',
      phone: <string>'',
      website: <string>'',
      currency: <string>'',
      payment: <string>'',
      vat: <string>'',
      checkvat: <boolean>false,
      cgv: <boolean>false,
      commercial: <boolean>true
    };
    this.title = 'Register';
    if ( this.page === '/account' ) {
      this.title = 'My Profil';
      this.getUser();
      this.getCurrency();
    }
    this.getCompanyType();
    this.getCountry();
    this.coll = 'col-lg-12';
    this.colg = 'col-lg-6';
  }

  getPayments(){
    this.paymentService.getPaymentsActive().subscribe(res=>{
      this.payments = res;
    });
  }

  

  resolved(captchaResponse: string) {
    if ( captchaResponse ) {
      this.checkrobot = false;
    } else {
      this.checkrobot = true;
    }
  }

  register(){
    if(this.confirmation === this.user['password']) {
      this.isValidPwd = false;
      this.userService.create(this.user).subscribe(data=>{
        sessionStorage.setItem('register', 'ok')
        this.router.navigate(['/login']);
      },
      error=>{
        console.error(error);
      });
    } else {
      this.isValidPwd = true; 
    }
  }

  checkVat(){
    if (this.user['vat'] !== '' && this.user['vat']) {
      let c = this.user['vat'].substring(0,2);
      let v = this.user['vat'].substring(2,this.user['vat'].length);
      this.loadvat = 'form-control loading';
      this.vatService.checkVat(c + '|' + v).subscribe(data=>{
        this.user['checkvat'] = data.valid;
        this.loadvat = 'form-control';
      },
      error=>{
        console.error(error);
      });
    }
  }

  update() {
    this.userService.updateUser(this.user).subscribe(res => {
      this.message = res.message;
      let user = {};
      user['_id'] = this.user['_id']
      user['token'] = this.user['token']
      user['address'] = this.user['address']
      user['addressBilling'] = this.user['addressBilling']
      user['city'] = this.user['city']
      user['cityBilling'] = this.user['cityBilling']
      user['country'] = this.user['country']
      user['countryBilling'] = this.user['countryBilling']
      user['payment'] = this.user['payment']
      user['postalCode'] = this.user['postalCode']
      user['postalCodeBilling'] = this.user['postalCodeBilling']
      user['vat'] = this.user['vat']
      user['checkvat'] = this.user['checkvat']
      user['state'] = this.user['state']
      user['roleName'] = this.user['roleName']
      user['currency'] = this.user['currency']
      user['sameAddress'] = this.user['sameAddress']
      sessionStorage.setItem('user', JSON.stringify(user));
    });
  }

  cgv() {
    this.term = true;
  }

  cgvClose() {
    this.term = false;
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

  verifMail() {
    if(this.page === '/register'){
      this.userService.verifmail({email : this.user['email']}).subscribe(resp=>{
        this.exist = resp.valid;
      });
    }    
  }

  getUser(){
    let id = JSON.parse(sessionStorage.getItem('user'))._id;
    this.userService.getCompte(id).subscribe(res => {
      this.user = res.user;
      this.user['id'] = id;
      // if(!this.user['checkvat']){ this.checkVat() };
      this.oldAddressBilling = {
        addressBilling: this.user['addressBilling'],
        cityBilling: this.user['cityBilling'],
        postalCodeBilling: this.user['postalCodeBilling'],
        countryBilling: this.user['countryBilling']
      }
    });
  }

  getCurrency() {
    this.currencyService.getCurrencies().subscribe(res => {
      this.currencies = res.currencies;
    });
  }

  getCompanyType() {
    this.companytypesService.getCompanytypes().subscribe(res => {
      this.companyType = res.companytypes;
    });
  }

  getCountry() {
    this.countriesService.getCountries().subscribe(res => {
      this.country = res.countries;
    });
  }
}

