import { TestBed } from '@angular/core/testing';

import { DownloadInvoiceService } from './download-invoice.service';

describe('DownloadInvoiceService', () => {
  let service: DownloadInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
