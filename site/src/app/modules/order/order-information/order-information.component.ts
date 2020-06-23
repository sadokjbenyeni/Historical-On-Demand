import { Component, OnInit, Input } from '@angular/core';
import { OrderInformation } from '../models/order-information.model';
import { DownloadInvoiceService } from '../../../services/Intern/download-invoice.service';

@Component({
  selector: 'app-order-information',
  templateUrl: './order-information.component.html',
  styleUrls: ['./order-information.component.css']
})
export class OrderInformationComponent implements OnInit {

  @Input() orderInfo: OrderInformation;
  constructor(
    private downloadInvoiceService: DownloadInvoiceService) { }

  ngOnInit(): void {
  }
  downloadInvoice() {
    this.downloadInvoiceService.getInvoice(this.orderInfo.id, this.orderInfo.invoice);
  }
}
