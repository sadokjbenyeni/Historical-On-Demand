import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-caddy-table',
  templateUrl: './caddy-table.component.html',
  styleUrls: ['./caddy-table.component.css']
})
export class CaddyTableComponent implements OnInit {
  dataset: { L1TRADEONLY: string; L1: string; L2: string; };

  constructor() { }
  @Input() symbol;
  @Input() caddy;
  @Input() page;
  @Output() DateChanged: EventEmitter<any> = new EventEmitter();
  @Output() DeleteProduct: EventEmitter<any> = new EventEmitter();
  ngOnInit(): void {
    this.dataset = { L1TRADEONLY: 'L1 - Trades', L1: 'L1 - Full', L2: 'L2 - MBL' };
  }
  DateChange(product, dateToChange, $event) {
    this.DateChanged.emit({ product: product, dateToChange: dateToChange, date: $event.value })
  }
  delCaddies(idproduct) {
    this.DeleteProduct.emit(idproduct)
  }

}
