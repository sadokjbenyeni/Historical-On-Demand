import { Component, OnInit, Input } from '@angular/core';
import { OrderAmount } from '../models/order-amount.model';

@Component({
  selector: 'app-order-amount',
  templateUrl: './order-amount.component.html',
  styleUrls: ['./order-amount.component.css']
})
export class OrderAmountComponent implements OnInit {
  @Input() orderAmount: OrderAmount;
  @Input() symbol: any[];

  constructor() { }

  ngOnInit(): void {
  }

}
