import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { DownloadSettingComponent } from './download-setting.component';
import { ConfigService } from '../../../services/config.service';

describe('DownloadSettingComponent', () => {
  let component: DownloadSettingComponent;
  let fixture: ComponentFixture<DownloadSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      declarations: [ DownloadSettingComponent ],
      providers: [ ConfigService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
