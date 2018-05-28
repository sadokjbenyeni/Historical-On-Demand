import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RibComponent } from './rib.component';

describe('RibComponent', () => {
  let component: RibComponent;
  let fixture: ComponentFixture<RibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
