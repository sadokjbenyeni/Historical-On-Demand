import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderspComponent } from './ordersp.component';

describe('OrderspComponent', () => {
  let component: OrderspComponent;
  let fixture: ComponentFixture<OrderspComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderspComponent ]
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
