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

describe('Jasmine Company Service',() => {
  let service : CompanytypesService;
  let http : HttpClient;
  beforeEach(() => {service  = new CompanytypesService(http);
  });

  it('#getCompanyTypes should return list of company types', ()=> {
    expect(service.getCompanytypes()).toBe(http.get<any>( environment.api + '/companytype'))
  });
})