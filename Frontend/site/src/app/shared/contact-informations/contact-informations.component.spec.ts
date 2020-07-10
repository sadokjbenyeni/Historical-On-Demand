import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactInformationsComponent } from './contact-informations.component';

describe('ContactInformationsComponent', () => {
  let component: ContactInformationsComponent;
  let fixture: ComponentFixture<ContactInformationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactInformationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
