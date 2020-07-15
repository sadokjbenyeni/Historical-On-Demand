import { Component, OnInit } from '@angular/core';

import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})

export class TermsComponent implements OnInit {
  constructor(
    private orderService: OrderService
  ) { }

  ngOnInit() { }
}