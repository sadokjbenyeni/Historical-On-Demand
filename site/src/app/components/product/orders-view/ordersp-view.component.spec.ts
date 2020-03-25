import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderspViewComponent } from './ordersp-view.component';
import { HttpClientModule } from '@angular/common/http';

import { OrderService } from '../../../services/order.service';
import { ConfigService } from '../../../services/config.service';
import { CurrencyService } from '../../../services/currency.service';

describe('OrderspViewComponent', () => {
  let component: OrderspViewComponent;
  let fixture: ComponentFixture<OrderspViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [RouterTestingModule, HttpClientModule ],
      declarations: [ OrderspViewComponent ],
      providers : [ OrderService, ConfigService, CurrencyService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderspViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
