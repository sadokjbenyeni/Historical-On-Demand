import { Component, OnInit } from '@angular/core';

import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-download-setting',
  templateUrl: './download-setting.component.html',
  styleUrls: ['./download-setting.component.css']
})
export class DownloadSettingComponent implements OnInit {

  message: string;

  periodOneOff: number;
  downloadOneOff: number;
  linkPerFile: number;
  periodSubscription: number;
  downloadSubscription: number;

  constructor(
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.getDownloadSetting();
  }

  getDownloadSetting(){
    this.configService.getDownloadSetting().subscribe(res => {
      this.periodOneOff = res[0].periodOneOff;
      this.downloadOneOff = res[0].downloadOneOff;
      this.linkPerFile = res[0].linkPerFile;
      this.periodSubscription = res[0].periodSubscription;
      this.downloadSubscription = res[0].downloadSubscription;
    });
  }

  saveOneOff(){
    this.configService.setDownloadSetting({periodOneOff: this.periodOneOff,linkPerFile: this.linkPerFile, downloadOneOff: this.downloadOneOff}).subscribe(res => {
      this.message = res.message;
    });
  }

  saveSubscription(){
    this.configService.setDownloadSetting({periodSubscription: this.periodSubscription, downloadSubscription: this.downloadSubscription}).subscribe(res => {
      this.message = res.message;
    });
  }

}
