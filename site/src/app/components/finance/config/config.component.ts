import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CurrencyService } from '../../../services/currency.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {

  currencies: any;
  constructor(
    private currencyService: CurrencyService
  ) { }

  ngOnInit() {
  this.getListCurrency();
  }

  getListCurrency(){
    this.currencyService.getCurrencies().subscribe(res=>{
      this.currencies = res.currencies;
    });
  }

}
