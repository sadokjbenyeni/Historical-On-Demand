import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router'
import { OrderspViewComponent } from './ordersp-view.component';

describe('OrderspViewComponent', () => {
  let component: OrderspViewComponent;
  let fixture: ComponentFixture<OrderspViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [ActivatedRoute],
      declarations: [ OrderspViewComponent ]
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
