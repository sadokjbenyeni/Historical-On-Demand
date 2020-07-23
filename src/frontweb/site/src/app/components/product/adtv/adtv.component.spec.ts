import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdtvComponent } from './adtv.component';

describe('AdtvComponent', () => {
  let component: AdtvComponent;
  let fixture: ComponentFixture<AdtvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdtvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdtvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
