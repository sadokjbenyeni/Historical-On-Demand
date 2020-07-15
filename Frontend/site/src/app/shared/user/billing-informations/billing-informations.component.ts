import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CountriesService } from '../../../services/countries.service';
import { PaymentService } from '../../../services/payment.service';
import { BillingInformation } from '../models/billing-information.model';
import { CurrencyService } from '../../../services/currency.service';

@Component({
  selector: 'app-billing-informations',
  templateUrl: './billing-informations.component.html',
  styleUrls: ['./billing-informations.component.css']
})
export class BillingInformationsComponent implements OnInit, OnChanges {

  @Input() billigInformations: BillingInformation;
  form: FormGroup;

  country: any;
  payments: any;
  currencies: any;
  symbol: any;
  toUpdate: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private countriesService: CountriesService,
    private paymentService: PaymentService,
    private currencyService: CurrencyService) {

  }
  ngOnInit(): void {
    this.getCountry();
    this.getPaymentsMethod();
    this.getCurrency();
  }

  ngOnChanges(userChanged): void {
    this.initFields();
  }
  initFields() {

    this.form = this.formBuilder.group({
      vatctl: [{ value: this.billigInformations.vatNumber, disabled: !this.toUpdate }],
      addressBillingctl: [{ value: this.billigInformations.billingAddress, disabled: !this.toUpdate }],
      cityBillingctl: [{ value: this.billigInformations.billingCity, disabled: !this.toUpdate }],
      postalCodeBillingctl: [{ value: this.billigInformations.billingPostalCode, disabled: !this.toUpdate }],
      countryBillingctl: [{ value: this.billigInformations.billingCountry, disabled: !this.toUpdate }],
      billingCurrency: [{ value: this.billigInformations.billingCurrency, disabled: !this.toUpdate }],
      billingPayment: [{ value: this.billigInformations.billingPayment, disabled: !this.toUpdate }]
    });
  }
  getCountry() {
    this.countriesService.getCountries().subscribe(res => {
      this.country = res.countries;
    });
  }

  getPaymentsMethod() {
    this.paymentService.getPaymentsActive().subscribe(result => {
      this.payments = result.filter(item => item.id != "creditcard");
    });
  }

  getCurrency() {
    this.currencyService.getCurrencies().subscribe(result => {
      this.currencies = result.currencies;
    });
  }
}