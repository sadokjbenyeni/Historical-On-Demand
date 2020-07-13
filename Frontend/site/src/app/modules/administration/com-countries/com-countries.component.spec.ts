import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComCountriesComponent } from './com-countries.component';
import { HttpClientModule } from '@angular/common/http';

import { CountriesService } from '../../../services/countries.service';

describe('ComCountriesComponent', () => {
  let component: ComCountriesComponent;
  let fixture: ComponentFixture<ComCountriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule, RouterTestingModule ],
      declarations: [ ComCountriesComponent ],
      providers: [ CountriesService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
