import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OrdersViewComponent } from './orders-view.component';
import { HttpClientModule } from '@angular/common/http';

import { OrderService } from '../../../services/order.service';
import { ConfigService } from '../../../services/config.service';
import { CurrencyService } from '../../../services/currency.service';

describe('OrdersViewComponent', () => {
  let component: OrdersViewComponent;
  let fixture: ComponentFixture<OrdersViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdersViewComponent ],
      imports: [ HttpClientModule, RouterTestingModule ],
      providers: [ OrderService, ConfigService, CurrencyService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
