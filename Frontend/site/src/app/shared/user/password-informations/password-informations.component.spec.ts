import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordInformationsComponent } from './password-informations.component';

describe('PasswordInformationsComponent', () => {
  let component: PasswordInformationsComponent;
  let fixture: ComponentFixture<PasswordInformationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordInformationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
