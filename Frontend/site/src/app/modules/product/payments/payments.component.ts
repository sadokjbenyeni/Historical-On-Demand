import { Component, OnInit } from '@angular/core';

import { PaymentService } from '../../../services/payment.service';

class itemsClone {
  _id: string;
  id: string;
  name: string;
  max: number;
  delay: number;
  constructor(r){
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

  constructor(
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.getPayments();
  }

  getPayments(){
    this.paymentService.getPayments().subscribe(res=>{
      this.payments = res;
      this.items = new itemsClone(res);
    });
  }

  detail(p){
    this.row = p._id;
  }

  cancel(p){
    this.row = '';
  }

  save(c){
    this.paymentService.save(c).subscribe(res=>{
      this.message = res.message;
      this.row = '';
      setTimeout(() => { this.message = ''; }, 5000);
    });
  }

}
