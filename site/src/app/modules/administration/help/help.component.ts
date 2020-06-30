import { Component, OnInit } from '@angular/core';

import { UploadService } from '../../../services/upload.service';


@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  page: number;
  rotation: number;
  zoom: number;
  originalSize: boolean;
  pdf: string;
  renderText: boolean;
  isLoaded: boolean;
  stickToPage;
  showAll: boolean;
  autoresize: boolean;
  fitToPage: boolean;
  newHelp: any;

  constructor( private uploadService: UploadService ) {
    this.page = 1;
    this.pdf = '';
    this.rotation = 0;
    this.zoom = 1.0;
    this.originalSize = false;
    this.renderText = true;
    this.isLoaded = false;
    this.stickToPage = false;
    this.showAll = false;
    this.autoresize = true;
    this.fitToPage = true;
  }

  ngOnInit() {
    this.newHelp = { doc: '' };
  }
  onUpload(event) {
    const files: FileList = event.target.files;
    const tempFile = files[0];
    if (tempFile) {
      const bodyRequest: FormData = new FormData();
      bodyRequest.append('doc', tempFile);
      this.uploadService.upload(bodyRequest).subscribe((res) => {
        this.newHelp.doc = '/files/' + res.file;
        this.pdf = '/files/' + res.file;
      });
    }
  }

  incrementPage(amount: number) {
    this.page += amount;
  }
}
