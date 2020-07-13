import { TestBed, inject } from '@angular/core/testing';

import { ElasticService } from './elastic.service';
import { HttpClientModule } from '@angular/common/http';

describe('ElasticService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [ElasticService]
    });
  });

  it('should be created', inject([ElasticService], (service: ElasticService) => {
    expect(service).toBeTruthy();
  }));
});
