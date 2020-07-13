import { TestBed, inject } from '@angular/core/testing';

import { FinanceService } from './finance.service';
import { HttpClientModule } from '@angular/common/http';

describe('FinanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [FinanceService]
    });
  });

  it('should be created', inject([FinanceService], (service: FinanceService) => {
    expect(service).toBeTruthy();
  }));
});
