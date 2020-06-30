import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailFailedComponent } from './mail-failed.component';

describe('MailFailedComponent', () => {
  let component: MailFailedComponent;
  let fixture: ComponentFixture<MailFailedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailFailedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
