import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RibComponent } from './rib.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { HttpClientModule } from '@angular/common/http';

import { CurrencyService } from '../../../services/currency.service';


describe('RibComponent', () => {
  let component: RibComponent;
  let fixture: ComponentFixture<RibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RibComponent ],
      imports : [ HttpClientModule, NgbModule ],
      providers: [ CurrencyService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
