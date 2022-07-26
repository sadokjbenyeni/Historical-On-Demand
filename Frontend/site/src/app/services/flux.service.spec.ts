import { TestBed, inject } from '@angular/core/testing';

import { FluxService } from './flux.service';
import { HttpClientModule } from '@angular/common/http';

describe('FluxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [FluxService]
    });
  });

  it('should be created', inject([FluxService], (service: FluxService) => {
    expect(service).toBeTruthy();
  }));
});
