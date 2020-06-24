import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaddyTableComponent } from './caddy-table.component';

describe('CaddyTableComponent', () => {
  let component: CaddyTableComponent;
  let fixture: ComponentFixture<CaddyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaddyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaddyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
