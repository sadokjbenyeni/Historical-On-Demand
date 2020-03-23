import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderscComponent } from './ordersc.component';

describe('OrderscComponent', () => {
  let component: OrderscComponent;
  let fixture: ComponentFixture<OrderscComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderscComponent ]
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
