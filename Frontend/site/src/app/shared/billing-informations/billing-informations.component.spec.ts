import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingInformationsComponent } from './billing-informations.component';

describe('BillingInformationsComponent', () => {
  let component: BillingInformationsComponent;
  let fixture: ComponentFixture<BillingInformationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingInformationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
