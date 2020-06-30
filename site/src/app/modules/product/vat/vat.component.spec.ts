import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VatComponent } from './vat.component';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';


describe('VatComponent', () => {
  let component: VatComponent;
  let fixture: ComponentFixture<VatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ ConfigService ],
      declarations: [ VatComponent ],
      imports: [ HttpClientModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
