import { TestBed, inject } from '@angular/core/testing';

import { ComplianceService } from './compliance.service';
import { HttpClientModule } from '@angular/common/http';

describe('ComplianceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [ComplianceService]
    });
  });

  it('should be created', inject([ComplianceService], (service: ComplianceService) => {
    expect(service).toBeTruthy();
  }));
});
