import { Injectable } from '@angular/core';
import { InvoiceService } from '../invoice.service';

@Injectable()
export class DownloadInvoiceService {

  constructor(private invoiceService: InvoiceService,
  ) { }

  setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }

  getInvoice(orderId, invoiceId) {
    this.invoiceService.downloadInvoice(orderId).subscribe(blobResponse => {
      let fileName = invoiceId;
      var downloadURL = window.URL.createObjectURL(blobResponse.body);
      if (!this.setting.element.dynamicDownload) {
        this.setting.element.dynamicDownload = document.createElement('a');
      }
      const element = this.setting.element.dynamicDownload;
      element.setAttribute('href', downloadURL);
      element.setAttribute('download', fileName + '.pdf');
      var event = new MouseEvent("click");
      element.dispatchEvent(event);
    });
  }
}
