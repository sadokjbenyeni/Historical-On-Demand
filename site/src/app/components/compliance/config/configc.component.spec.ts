import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigcComponent } from './configc.component';

describe('ConfigcComponent', () => {
  let component: ConfigcComponent;
  let fixture: ComponentFixture<ConfigcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
