import { TestBed, async, inject } from '@angular/core/testing';
import { GuardGuard } from './guard.guard';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('GuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientModule,
        RouterTestingModule],
      providers: [
        GuardGuard,
        UserService]
    });
  });

  it('should ...', inject([GuardGuard], (guard: GuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
