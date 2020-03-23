import { TestBed, inject } from '@angular/core/testing';

import { VatService } from './vat.service';
import { HttpClientModule } from '@angular/common/http';

describe('VatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [VatService]
    });
  });

  it('should be created', inject([VatService], (service: VatService) => {
    expect(service).toBeTruthy();
  }));
});
