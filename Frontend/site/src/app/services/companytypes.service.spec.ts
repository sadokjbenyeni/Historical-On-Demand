import { TestBed, inject } from '@angular/core/testing';
import { CompanytypesService } from './companytypes.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

describe('CompanytypesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [CompanytypesService]
    });
  });

  it('should be created', inject([CompanytypesService], (service: CompanytypesService) => {
    expect(service).toBeTruthy();
  }));
});
