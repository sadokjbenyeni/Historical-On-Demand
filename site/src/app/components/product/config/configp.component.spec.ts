import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { CurrencyService } from '../../../services/currency.service';

import { ConfigpComponent } from './configp.component';

describe('ConfigpComponent', () => {
  let component: ConfigpComponent;
  let fixture: ComponentFixture<ConfigpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigpComponent ],
      imports: [ HttpClientModule, RouterTestingModule ],
      providers: [ CurrencyService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
