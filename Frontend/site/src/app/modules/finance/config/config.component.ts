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
  dtOptions: DataTables.Settings = {};

  constructor(
    private currencyService: CurrencyService
  ) { }

  ngOnInit() {
    this.getListCurrency();
    this.dtOptions = {
      searching: false,
      info: false,
      ordering: false,
      processing: false,
      paging: false,
      lengthChange: false
    };
  }

  getListCurrency(){
    this.currencyService.getCurrencies().subscribe(res=>{
      this.currencies = res.currencies;
    });
  }

}
