import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderscViewComponent } from './ordersc-view.component';

describe('OrderscViewComponent', () => {
  let component: OrderscViewComponent;
  let fixture: ComponentFixture<OrderscViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderscViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderscViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
