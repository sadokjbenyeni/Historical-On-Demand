import { Component, OnInit } from '@angular/core';

import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-vat',
  templateUrl: './vat.component.html',
  styleUrls: ['./vat.component.css']
})
export class VatComponent implements OnInit {

  message: string;
  vat: number;
  constructor(
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.getVat();
  }

  getVat(){
    this.configService.getVat().subscribe(res => {
      this.vat = res.valueVat;
    });
  }

  saveVat(){
    this.configService.setVat({vat: this.vat}).subscribe(res => {
      this.message = res.message;
    });
  }

}
