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

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    this.getDownloadSetting();
  }

  getDownloadSetting() {
    this.configService.getDownloadSetting().subscribe(setting => {
      this.periodOneOff = setting[0].periodOneOff;
      this.downloadOneOff = setting[0].downloadOneOff;
      this.linkPerFile = setting[0].linkPerFile;
      this.periodSubscription = setting[0].periodSubscription;
      this.downloadSubscription = setting[0].downloadSubscription;
    });
  }

  saveOneOff() {
    this.configService.setDownloadSetting({ periodOneOff: this.periodOneOff, linkPerFile: this.linkPerFile, downloadOneOff: this.downloadOneOff }).subscribe(result => {
      this.message = result.message;
    });
  }

  saveSubscription() {
    this.configService.setDownloadSetting({ periodSubscription: this.periodSubscription, downloadSubscription: this.downloadSubscription }).subscribe(result => {
      this.message = result.message;
    });
  }

}
