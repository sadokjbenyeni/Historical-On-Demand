import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuproductComponent } from './menuproduct.component';

describe('MenuproductComponent', () => {
  let component: MenuproductComponent;
  let fixture: ComponentFixture<MenuproductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuproductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
