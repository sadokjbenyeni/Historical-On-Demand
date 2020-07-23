import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigpComponent } from './configp.component';

describe('ConfigpComponent', () => {
  let component: ConfigpComponent;
  let fixture: ComponentFixture<ConfigpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
