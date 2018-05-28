import { TestBed, inject } from '@angular/core/testing';

import { FluxService } from './flux.service';

describe('FluxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FluxService]
    });
  });

  it('should be created', inject([FluxService], (service: FluxService) => {
    expect(service).toBeTruthy();
  }));
});
