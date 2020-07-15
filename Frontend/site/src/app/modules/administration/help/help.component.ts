import { Component, OnInit } from '@angular/core';

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

  constructor() {
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

  incrementPage(amount: number) {
    this.page += amount;
  }
}
