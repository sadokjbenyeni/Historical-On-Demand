import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHistoryComponent } from './order-history.component';
import { HttpClientModule } from '@angular/common/http';

import { OrderService } from '../../services/order.service';
import { UploadService } from '../../services/upload.service';
import { CurrencyService } from '../../services/currency.service';
import { ConfigService } from '../../services/config.service';

describe('OrderHistoryComponent', () => {
  let component: OrderHistoryComponent;
  let fixture: ComponentFixture<OrderHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderHistoryComponent ],
      providers: [ OrderService, UploadService, CurrencyService, ConfigService ],
      imports: [ HttpClientModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
