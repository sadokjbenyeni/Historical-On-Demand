import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { OrderscComponent } from './ordersc.component';

import { OrderService } from '../../../services/order.service';

describe('OrderscComponent', () => {
  let component: OrderscComponent;
  let fixture: ComponentFixture<OrderscComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [ HttpClientModule, RouterTestingModule, NgbModule ],
      declarations: [ OrderscComponent ],
      providers: [ OrderService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderscComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
