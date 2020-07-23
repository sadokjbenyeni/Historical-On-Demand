import { TestBed, inject } from '@angular/core/testing';

import { CompanytypesService } from './companytypes.service';

describe('CompanytypesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompanytypesService]
    });
  });

  it('should be created', inject([CompanytypesService], (service: CompanytypesService) => {
    expect(service).toBeTruthy();
  }));
});
