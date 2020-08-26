import { Component, OnInit } from '@angular/core';

import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-adtv',
  templateUrl: './adtv.component.html',
  styleUrls: ['./adtv.component.css']
})
export class AdtvComponent implements OnInit {

  adtv: [{ tab: Array<any> }];
  cell: string;
  cellval: string;
  message: string;

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    this.adtv = [{ tab: [] }];
    this.message = '';
    this.cell = '';
    this.cellval = '';
    this.getPricingTier();
  }

  getPricingTier() {
    this.configService.getPricingTier().subscribe(pricingTier => { this.adtv = pricingTier });
  }
  save() {
    this.configService.setPricingTier(this.adtv).subscribe(result => { this.message = result.message });
  }
}
