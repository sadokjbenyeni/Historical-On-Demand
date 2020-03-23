import { TestBed, inject } from '@angular/core/testing';

import { PdfService } from './pdf.service';
import { HttpClientModule } from '@angular/common/http';

describe('PdfService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [PdfService]
    });
  });

  it('should be created', inject([PdfService], (service: PdfService) => {
    expect(service).toBeTruthy();
  }));
});
