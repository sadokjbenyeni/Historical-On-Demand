import { Component, OnInit } from '@angular/core';

import { PdfService } from '../../../services/pdf.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})

export class TermsComponent implements OnInit {
  constructor(
    private pdfService: PdfService,
    private orderService: OrderService
  ) { }

  ngOnInit() { }

  link() {
    this.pdfService.pdf({ id: 229 }).subscribe(res => {
      console.log(res.file);
    });
  }
}