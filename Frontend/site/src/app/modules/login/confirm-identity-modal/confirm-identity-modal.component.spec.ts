import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmIdentityModalComponent } from './confirm-identity-modal.component';

describe('ConfirmIdentityModalComponent', () => {
  let component: ConfirmIdentityModalComponent;
  let fixture: ComponentFixture<ConfirmIdentityModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmIdentityModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmIdentityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
