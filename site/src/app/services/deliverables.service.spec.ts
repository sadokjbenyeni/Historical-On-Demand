import { TestBed } from '@angular/core/testing';

import { DeliverablesService } from './deliverables.service';

describe('DeliverablesService', () => {
  let service: DeliverablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliverablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
