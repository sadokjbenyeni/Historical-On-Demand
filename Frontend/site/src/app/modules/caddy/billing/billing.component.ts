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
  @Output() IsVatValid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() countryChanged: EventEmitter<string> = new EventEmitter<string>();

  invalidVat: boolean;
  form: FormGroup;
  currencychangeDefault: boolean = false;
  AdressBillingchangeDefault: boolean = false;

  country: any;
  payments: any;
  symbol: any;
  taux = [];

  constructor(private formBuilder: FormBuilder, private vatService: VatService, private countriesService: CountriesService, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.initFields();
    this.getCountry();
    this.getPayments();
    this.checkVat();
  }

  initFields() {
    this.form = this.formBuilder.group({
      vatctl: [this.user.vat, []],
      addressBillingctl: [this.user.addressBilling, Validators.required],
      cityBillingctl: [this.user.cityBilling, Validators.required],
      postalCodeBillingctl: [this.user.postalCodeBilling, Validators.required],
      countryBillingctl: [this.user.countryBilling, Validators.required],
    });
  }
  getCountry() {
    this.countriesService.getCountries().subscribe(listOfCountries => {this.country = listOfCountries.countries});
  }
  getPayments() {
    this.paymentService.getPaymentsActive().subscribe(activePayments => {this.payments = activePayments.filter(item => item.id != "creditcard")});
  }

  checkVat() {
    var vat = this.form.controls["vatctl"].value;
    if (vat) {
      let c = vat.substring(0, 2);
      let v = vat.substring(2, vat.length);
      this.vatService.checkVat(c + '|' + v).subscribe(data => {
        if (!data.valid) {
          this.IsVatValid.emit(false);
          this.invalidVat = true;
        }
        else {
          this.IsVatValid.emit(true);
          this.invalidVat = false;

        }
      },
        error => {
          console.error(error);
        });
    }
  }
  changecountry(event) {
    this.countryChanged.emit(event.value)
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