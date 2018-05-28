import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CurrencyService } from '../../../services/currency.service';

export class Rib{
  maxrib: number;
  rib: {
    cb: string,
    cg: string,
    nc: string,
    cr: string,
    domiciliation: string
  };
  iban: {
    ib1: string,
    ib2: string,
    ib3: string,
    ib4: string,
    ib5: string,
    ib6: string,
    ib7: string
  };
  bic: string;
}

@Component({
  selector: 'app-rib',
  templateUrl: './rib.component.html',
  styleUrls: ['./rib.component.css']
})
export class RibComponent implements OnInit {

  message: string;
  currencies: Array<Rib>;

  constructor(
    private currencyService: CurrencyService
  ) { }

  ngOnInit() {
    this.message = '';
    this.getListCurrency();
  }

  getListCurrency(){
    this.currencyService.getCurrencies().subscribe(res=>{
      this.currencies = res.currencies;
    });
  }

  saveRib(c) {
    this.currencyService.saverib(c).subscribe(res=>{
      this.message = res.message;
    });
  }

  resetMessage(){
    this.message = '';
  }
}
