import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CountriesService } from '../../../services/countries.service';
import { PaymentService } from '../../../services/payment.service';
import { VatService } from '../../../services/vat.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {
  @Input() user;
  @Input() currencies;
  @Input() currency;
  @Output() ChangeCurrency = new EventEmitter();
  @Output() ChangeDefaultCurrency = new EventEmitter();
  @Output() ChangeDefaultAdress = new EventEmitter();
  form: FormGroup;
  currencychangeDefault: boolean = false;
  AdressBillingchangeDefault: boolean = false;

  country: any;
  payments: any;
  symbol: any;
  taux = [];
  validVat: any;


  constructor(private formBuilder: FormBuilder, private vatService: VatService, private countriesService: CountriesService, private paymentService: PaymentService) {

  }

  ngOnInit(): void {
    this.initFields()
    this.getCountry();
    this.getPayments();
    this.checkVat()
    // this.getCurrency();
  }

  // let vat = control.value
  // let c = vat.substring(0, 2);
  // let v = vat.substring(2, this.form.controls["vatctl"].value.length);

  // this.vatService.checkVat(c + '|' + v).subscribe(data => {
  //   // this.validVat = data.valid;
  //   if (!data.valid) {
  //     this.form.controls['vatctl'].setErrors({ 'incorrect': true });
  //   }
  // },
  //   error => {
  //     console.error(error);
  //   });


  initFields() {
    this.form = this.formBuilder.group({
      vatctl: [this.user.vat, Validators.required],
      addressBillingctl: [this.user.addressBilling, Validators.required],
      cityBillingctl: [this.user.cityBilling, Validators.required],
      postalCodeBillingctl: [this.user.postalCodeBilling, Validators.required],
      countryBillingctl: [this.user.countryBilling, Validators.required],
    });
  }
  getCountry() {
    this.countriesService.getCountries().subscribe(res => {
      this.country = res.countries;
    });
  }
  getPayments() {
    this.paymentService.getPaymentsActive().subscribe(res => {
      this.payments = res.filter(item => item.id != "creditcard");
    });
  }

  checkVat() {
    var vat = this.form.controls["vatctl"].value;
    if (vat) {
      let c = vat.substring(0, 2);
      let v = vat.substring(2, vat.length);
      this.vatService.checkVat(c + '|' + v).subscribe(data => {
        // this.validVat = data.valid;
        if (!data.valid) {

          this.form.controls['vatctl'].setErrors({ 'incorrect': true });
        }
      },
        error => {
          console.error(error);
        });
    }
  }
  defaultBilling(event) {
    this.ChangeDefaultAdress.emit(event.checked);
  }
  ChangedDefaultCurrency(event) {
    this.ChangeDefaultCurrency.emit(event.checked);
  }
  ChangedCurrency(currencyId) {
    this.ChangeCurrency.emit(currencyId);
  }

  SetAdress(event) {
    if (event.checked) {
      this.form.controls['addressBillingctl'].setValue(this.user.address);
      this.form.controls['cityBillingctl'].setValue(this.user.city);
      this.form.controls['postalCodeBillingctl'].setValue(this.user.postalCode);
      this.form.controls['countryBillingctl'].setValue(this.user.country);
    }
    else {
      this.form.controls['addressBillingctl'].setValue(this.user.addressBilling);
      this.form.controls['cityBillingctl'].setValue(this.user.cityBilling);
      this.form.controls['postalCodeBillingctl'].setValue(this.user.postalCodeBilling);
      this.form.controls['countryBillingctl'].setValue(this.user.countryBilling);
    }

  }
}