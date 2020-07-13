import { TestBed, inject } from '@angular/core/testing';

import { RoleService } from './role.service';
import { HttpClientModule } from '@angular/common/http';

describe('RoleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [RoleService]
    });
  });

  it('should be created', inject([RoleService], (service: RoleService) => {
    expect(service).toBeTruthy();
  }));
});
