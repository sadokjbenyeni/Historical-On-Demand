import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusupportComponent } from './menusupport.component';

describe('MenusupportComponent', () => {
  let component: MenusupportComponent;
  let fixture: ComponentFixture<MenusupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenusupportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenusupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
