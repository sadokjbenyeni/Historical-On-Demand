import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { SalesService } from './sales.service';

describe('SalesService', () => {
  let service: SalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(SalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
