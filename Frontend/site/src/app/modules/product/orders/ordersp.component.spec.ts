import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { OrderspComponent } from './ordersp.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { OrderService } from '../../../services/order.service';
import { CurrencyService } from '../../../services/currency.service';

describe('OrderspComponent', () => {
  let component: OrderspComponent;
  let fixture: ComponentFixture<OrderspComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderspComponent ],
      imports: [ RouterTestingModule, HttpClientModule, NgbModule ], 
      providers: [ OrderService, CurrencyService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
