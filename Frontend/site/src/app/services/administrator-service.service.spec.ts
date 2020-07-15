import { TestBed } from '@angular/core/testing';

import { AdministratorServiceService } from './administrator-service.service';

describe('AdministratorServiceService', () => {
  let service: AdministratorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdministratorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
