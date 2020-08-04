import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPasswordUpdateComponent } from './confirm-password-update.component';

describe('ConfirmPasswordUpdateComponent', () => {
  let component: ConfirmPasswordUpdateComponent;
  let fixture: ComponentFixture<ConfirmPasswordUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmPasswordUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPasswordUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
