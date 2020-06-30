import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenufinanceComponent } from './menufinance.component';

describe('MenufinanceComponent', () => {
  let component: MenufinanceComponent;
  let fixture: ComponentFixture<MenufinanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenufinanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenufinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
