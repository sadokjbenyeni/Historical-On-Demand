import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadSettingComponent } from './download-setting.component';

describe('DownloadSettingComponent', () => {
  let component: DownloadSettingComponent;
  let fixture: ComponentFixture<DownloadSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadSettingComponent ]
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
