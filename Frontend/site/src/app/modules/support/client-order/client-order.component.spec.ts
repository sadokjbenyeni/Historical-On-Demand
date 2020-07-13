import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientOrderComponent } from './client-order.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { OrderService } from '../../../services/order.service';

describe('ClientOrderComponent', () => {
  let component: ClientOrderComponent;
  let fixture: ComponentFixture<ClientOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientOrderComponent ],
      imports: [ HttpClientModule, RouterTestingModule, NgbModule ],
      providers: [ OrderService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
