import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEmailUpdateComponent } from './confirm-email-update.component';

describe('ConfirmEmailUpdateComponent', () => {
  let component: ConfirmEmailUpdateComponent;
  let fixture: ComponentFixture<ConfirmEmailUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmEmailUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEmailUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
