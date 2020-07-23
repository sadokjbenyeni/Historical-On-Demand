import { TestBed, inject } from '@angular/core/testing';

import { ComplianceService } from './compliance.service';

describe('ComplianceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComplianceService]
    });
  });

  it('should be created', inject([ComplianceService], (service: ComplianceService) => {
    expect(service).toBeTruthy();
  }));
});
