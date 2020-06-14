import { Component, OnInit, Input } from '@angular/core';
import { Rib } from 'src/app/components/finance/rib/rib.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  @Input() rib:any;
  constructor() { }

  ngOnInit(): void {
  }

}
