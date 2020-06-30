import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { RouterTestingModule } from '@angular/router/testing';
import { DataService } from '../../../services/data.service';
import { ElasticService } from '../../../services/elastic.service';

import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { ConfigService } from '../../../services/config.service';
import { FluxService } from '../../../services/flux.service';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchComponent ],
      imports: [ HttpClientModule, RouterTestingModule ],
      providers: [ DataService, ElasticService, OrderService, UserService, ConfigService, FluxService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
