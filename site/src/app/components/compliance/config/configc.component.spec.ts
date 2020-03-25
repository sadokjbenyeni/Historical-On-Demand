import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigcComponent } from './configc.component';
import { HttpClientModule } from '@angular/common/http';

import { CurrencyService } from '../../../services/currency.service';

describe('ConfigcComponent', () => {
  let component: ConfigcComponent;
  let fixture: ComponentFixture<ConfigcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      declarations: [ ConfigcComponent ],
      providers: [ CurrencyService ]
      
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
