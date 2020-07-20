import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginInformationsComponent } from './login-informations.component';

describe('LoginInformationsComponent', () => {
  let component: LoginInformationsComponent;
  let fixture: ComponentFixture<LoginInformationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginInformationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
