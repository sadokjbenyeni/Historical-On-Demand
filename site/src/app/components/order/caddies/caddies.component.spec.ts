import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CaddiesComponent } from './caddies.component';
import { HttpClientModule } from '@angular/common/http';

import { OrderService } from '../../../services/order.service';
import { VatService } from '../../../services/vat.service';
import { FluxService } from '../../../services/flux.service';
import { PaymentService } from '../../../services/payment.service';
import { CountriesService } from '../../../services/countries.service';
import { CurrencyService } from '../../../services/currency.service';
import { UserService } from '../../../services/user.service';
import { ConfigService } from '../../../services/config.service';
import { PdfService } from '../../../services/pdf.service';
import { UploadService } from '../../../services/upload.service';

describe('CaddiesComponent', () => {
  let component: CaddiesComponent;
  let fixture: ComponentFixture<CaddiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaddiesComponent ],
      imports: [ RouterTestingModule, HttpClientModule ],
      providers: [ OrderService, VatService, FluxService, PaymentService, CountriesService, CurrencyService, UserService, ConfigService, PdfService, UploadService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaddiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
