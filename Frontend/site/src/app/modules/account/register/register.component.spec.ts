import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { RegisterComponent } from './register.component';

import { UserService } from '../../../services/user.service';
import { CurrencyService } from '../../../services/currency.service';
import { VatService } from '../../../services/vat.service';
import { PaymentService } from '../../../services/payment.service';
import { CountriesService } from '../../../services/countries.service';
import { CompanytypesService } from '../../../services/companytypes.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule, FormsModule ],
      declarations: [ RegisterComponent ],
      providers: [ UserService, CurrencyService, VatService, PaymentService, CountriesService, CompanytypesService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
