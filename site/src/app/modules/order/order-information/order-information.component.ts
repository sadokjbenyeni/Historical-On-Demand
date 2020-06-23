import { Component, OnInit, Input } from '@angular/core';
import { OrderInformation } from '../models/order-information.model';

@Component({
  selector: 'app-order-information',
  templateUrl: './order-information.component.html',
  styleUrls: ['./order-information.component.css']
})
export class OrderInformationComponent implements OnInit {

  @Input() orderInfo: OrderInformation;
  constructor() { }

  ngOnInit(): void {
  }

}
