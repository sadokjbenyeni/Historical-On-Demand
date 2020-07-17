import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSideBarComponent } from './account-side-bar.component';

describe('AccountSideBarComponent', () => {
  let component: AccountSideBarComponent;
  let fixture: ComponentFixture<AccountSideBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountSideBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
