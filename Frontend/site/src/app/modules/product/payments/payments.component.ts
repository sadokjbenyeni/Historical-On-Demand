import { Component, OnInit } from '@angular/core';

import { PaymentService } from '../../../services/payment.service';

class itemsClone {
  _id: string;
  id: string;
  name: string;
  max: number;
  delay: number;
  constructor(r) {
    this._id = r._id;
    this.id = r.id;
    this.name = r.name;
    this.max = r.max;
    this.delay = r.delay;
  }
};

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  payments: Array<any>;
  row: string;
  message: string;
  items: Object;

  constructor(private paymentService: PaymentService) { }

  ngOnInit() {
    this.getPayments();
  }

  getPayments() {
    this.paymentService.getPayments().subscribe(listOfPayments => {
      this.payments = listOfPayments;
      this.items = new itemsClone(listOfPayments);
    });
  }

  detail(product) {
    this.row = product._id;
  }

  cancel() {
    this.row = '';
  }

  save(changes) {
    this.paymentService.save(changes).subscribe(result => {
      this.message = result.message;
      this.row = '';
      setTimeout(() => { this.message = ''; }, 5000);
    });
  }

}
